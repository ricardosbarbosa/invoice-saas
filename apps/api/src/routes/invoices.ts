import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { Decimal } from "@workspace/db";
import {
  getActiveOrganizationId,
  requireOrgPermission,
} from "../lib/organization";
import {
  computeInvoiceTotals,
  parseDecimal,
  reserveInvoiceNumber,
} from "../lib/invoice-utils";

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    schema.optional()
  );

const decimalInput = z.union([z.string(), z.number()]);
const optionalDecimalInput = emptyToUndefined(decimalInput);
const optionalString = emptyToUndefined(z.string());
const optionalDateString = emptyToUndefined(z.string().datetime());
const optionalCurrency = emptyToUndefined(z.string().length(3));

const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: decimalInput,
  unitPrice: decimalInput,
  taxRate: optionalDecimalInput,
});

const invoiceBaseSchema = z.object({
  clientId: z.string().min(1),
  issueDate: optionalDateString,
  dueDate: optionalDateString,
  currency: optionalCurrency,
  discountType: z.enum(["percentage", "fixed"]).optional(),
  discountValue: optionalDecimalInput,
  shippingAmount: optionalDecimalInput,
  shippingTaxRate: optionalDecimalInput,
  notes: optionalString,
  terms: optionalString,
  items: z.array(invoiceItemSchema).min(1),
});

const discountRefine = (
  data: { discountType?: "percentage" | "fixed"; discountValue?: unknown },
  ctx: z.RefinementCtx
) => {
  const hasDiscountType = data.discountType !== undefined;
  const hasDiscountValue = data.discountValue !== undefined;

  if (hasDiscountType && !hasDiscountValue) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["discountValue"],
      message: "Discount value is required when discount type is set.",
    });
  }

  if (!hasDiscountType && hasDiscountValue) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["discountType"],
      message: "Discount type is required when discount value is set.",
    });
  }
};

const invoiceCreateSchema = invoiceBaseSchema.superRefine(discountRefine);

const invoiceUpdateSchema = invoiceBaseSchema
  .omit({ clientId: true })
  .partial()
  .extend({
    status: z.enum(["draft", "sent", "paid", "void"]).optional(),
  })
  .superRefine(discountRefine);

type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;
type InvoiceUpdateInput = z.infer<typeof invoiceUpdateSchema>;

const paramsSchema = z.object({
  invoiceId: z.string().min(1),
});

const normalizeDate = (value?: string) =>
  value ? new Date(value) : new Date();

const invoices: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/invoices",
    { preHandler: fastify.authGuard },
    async (request, reply) => {
      const organizationId = getActiveOrganizationId(request, reply);
      if (!organizationId) return;

      const allowed = await requireOrgPermission(
        request,
        reply,
        { invoice: ["read"] },
        organizationId
      );
      if (!allowed) return;

      const invoices = await fastify.prisma.invoice.findMany({
        where: { organizationId },
        include: { items: true, client: true },
        orderBy: { createdAt: "desc" },
      });

      return {
        data: invoices.map((invoice) => ({
          ...invoice,
          totals: computeInvoiceTotals({
            items: invoice.items,
            discountType: invoice.discountType,
            discountValue: invoice.discountValue,
            shippingAmount: invoice.shippingAmount,
            shippingTaxRate: invoice.shippingTaxRate,
            currency: invoice.currency,
          }),
        })),
      };
    }
  );

  fastify.post(
    "/invoices",
    { preHandler: fastify.authGuard },
    async (request, reply) => {
      const organizationId = getActiveOrganizationId(request, reply);
      if (!organizationId) return;

      const allowed = await requireOrgPermission(
        request,
        reply,
        { invoice: ["create"] },
        organizationId
      );
      if (!allowed) return;

      const body: InvoiceCreateInput = invoiceCreateSchema.parse(request.body);
      const issueDate = normalizeDate(body.issueDate);
      const dueDate = body.dueDate ? new Date(body.dueDate) : null;

      const client = await fastify.prisma.client.findFirst({
        where: { id: body.clientId, organizationId },
      });

      if (!client) {
        reply.code(404).send({ error: "CLIENT_NOT_FOUND" });
        return;
      }

      const created = await fastify.prisma.$transaction(async (tx) => {
        const { number, defaultCurrency } = await reserveInvoiceNumber(
          tx,
          organizationId,
          issueDate
        );

        const currency = (
          body.currency ||
          client.currency ||
          defaultCurrency
        ).toUpperCase();

        return tx.invoice.create({
          data: {
            organizationId,
            clientId: body.clientId,
            number,
            status: "draft",
            issueDate,
            dueDate,
            currency,
            discountType: body.discountType ?? null,
            discountValue: parseDecimal(body.discountValue),
            shippingAmount: parseDecimal(body.shippingAmount),
            shippingTaxRate: parseDecimal(body.shippingTaxRate),
            notes: body.notes,
            terms: body.terms,
            items: {
              create: body.items.map((item) => ({
                description: item.description,
                quantity: new Decimal(item.quantity),
                unitPrice: new Decimal(item.unitPrice),
                taxRate: parseDecimal(item.taxRate),
              })),
            },
          },
          include: { items: true, client: true },
        });
      });

      reply.code(201);
      return {
        ...created,
        totals: computeInvoiceTotals({
          items: created.items,
          discountType: created.discountType,
          discountValue: created.discountValue,
          shippingAmount: created.shippingAmount,
          shippingTaxRate: created.shippingTaxRate,
          currency: created.currency,
        }),
      };
    }
  );

  fastify.get(
    "/invoices/:invoiceId",
    { preHandler: fastify.authGuard },
    async (request, reply) => {
      const organizationId = getActiveOrganizationId(request, reply);
      if (!organizationId) return;

      const allowed = await requireOrgPermission(
        request,
        reply,
        { invoice: ["read"] },
        organizationId
      );
      if (!allowed) return;

      const params = paramsSchema.parse(request.params);
      const invoice = await fastify.prisma.invoice.findFirst({
        where: { id: params.invoiceId, organizationId },
        include: { items: true, client: true },
      });

      if (!invoice) {
        reply.code(404).send({ error: "INVOICE_NOT_FOUND" });
        return;
      }

      return {
        ...invoice,
        totals: computeInvoiceTotals({
          items: invoice.items,
          discountType: invoice.discountType,
          discountValue: invoice.discountValue,
          shippingAmount: invoice.shippingAmount,
          shippingTaxRate: invoice.shippingTaxRate,
          currency: invoice.currency,
        }),
      };
    }
  );

  fastify.patch(
    "/invoices/:invoiceId",
    { preHandler: fastify.authGuard },
    async (request, reply) => {
      const organizationId = getActiveOrganizationId(request, reply);
      if (!organizationId) return;

      const params = paramsSchema.parse(request.params);
      const body: InvoiceUpdateInput = invoiceUpdateSchema.parse(request.body);

      const existing = await fastify.prisma.invoice.findFirst({
        where: { id: params.invoiceId, organizationId },
        include: { items: true },
      });

      if (!existing) {
        reply.code(404).send({ error: "INVOICE_NOT_FOUND" });
        return;
      }

      const statusPermissionMap = {
        sent: "send",
        paid: "mark-paid",
        void: "void",
        draft: "update",
      } as const;

      const hasNonStatusChanges = Object.keys(body).some(
        (key) => key !== "status"
      );

      if (hasNonStatusChanges) {
        const allowed = await requireOrgPermission(
          request,
          reply,
          { invoice: ["update"] },
          organizationId
        );
        if (!allowed) return;
      }

      if (body.status && body.status !== existing.status) {
        const action = statusPermissionMap[body.status];
        const allowed = await requireOrgPermission(
          request,
          reply,
          { invoice: [action] },
          organizationId
        );
        if (!allowed) return;
      }

      const issueDate = body.issueDate
        ? new Date(body.issueDate)
        : existing.issueDate;
      const dueDate = body.dueDate ? new Date(body.dueDate) : existing.dueDate;

      const updated = await fastify.prisma.$transaction(async (tx) => {
        if (body.items) {
          await tx.invoiceItem.deleteMany({
            where: { invoiceId: existing.id },
          });
        }

        return tx.invoice.update({
          where: { id: existing.id },
          data: {
            status: body.status,
            issueDate,
            dueDate,
            currency: body.currency?.toUpperCase(),
            discountType: body.discountType ?? existing.discountType,
            discountValue:
              body.discountValue === undefined
                ? existing.discountValue
                : parseDecimal(body.discountValue),
            shippingAmount:
              body.shippingAmount === undefined
                ? existing.shippingAmount
                : parseDecimal(body.shippingAmount),
            shippingTaxRate:
              body.shippingTaxRate === undefined
                ? existing.shippingTaxRate
                : parseDecimal(body.shippingTaxRate),
            notes: body.notes,
            terms: body.terms,
            items: body.items
              ? {
                  create: body.items.map((item) => ({
                    description: item.description,
                    quantity: new Decimal(item.quantity),
                    unitPrice: new Decimal(item.unitPrice),
                    taxRate: parseDecimal(item.taxRate),
                  })),
                }
              : undefined,
          },
          include: { items: true, client: true },
        });
      });

      return {
        ...updated,
        totals: computeInvoiceTotals({
          items: updated.items,
          discountType: updated.discountType,
          discountValue: updated.discountValue,
          shippingAmount: updated.shippingAmount,
          shippingTaxRate: updated.shippingTaxRate,
          currency: updated.currency,
        }),
      };
    }
  );

  fastify.delete(
    "/invoices/:invoiceId",
    { preHandler: fastify.authGuard },
    async (request, reply) => {
      const organizationId = getActiveOrganizationId(request, reply);
      if (!organizationId) return;

      const allowed = await requireOrgPermission(
        request,
        reply,
        { invoice: ["delete"] },
        organizationId
      );
      if (!allowed) return;

      const params = paramsSchema.parse(request.params);
      const existing = await fastify.prisma.invoice.findFirst({
        where: { id: params.invoiceId, organizationId },
      });

      if (!existing) {
        reply.code(404).send({ error: "INVOICE_NOT_FOUND" });
        return;
      }

      await fastify.prisma.invoice.delete({
        where: { id: existing.id },
      });

      reply.code(204).send();
    }
  );
};

export default invoices;
