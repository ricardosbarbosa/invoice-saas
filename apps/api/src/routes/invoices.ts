import type { FastifyPluginAsync } from "fastify";
import { Decimal } from "@workspace/db";
import {
  invoiceCreateSchema,
  invoiceUpdateSchema,
  type InvoiceCreateInput,
  type InvoiceUpdateInput,
} from "@workspace/types";
import {
  getActiveOrganizationId,
  requireOrgPermission,
} from "../lib/organization";
import { renderInvoicePdf } from "../lib/invoice-pdf";
import {
  computeInvoiceTotals,
  parseDecimal,
  reserveInvoiceNumber,
} from "../lib/invoice-utils";
import z from "zod";

const paramsSchema = z.object({
  invoiceId: z.string().min(1),
});

const normalizeDate = (value?: string) =>
  value ? new Date(value) : new Date();

const sanitizeFilename = (value: string) => {
  const cleaned = value
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned.length > 0 ? cleaned : "invoice";
};

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
    "/invoices/:invoiceId/pdf",
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
        include: { items: true, client: true, organization: true },
      });

      if (!invoice) {
        reply.code(404).send({ error: "INVOICE_NOT_FOUND" });
        return;
      }

      const totals = computeInvoiceTotals({
        items: invoice.items,
        discountType: invoice.discountType,
        discountValue: invoice.discountValue,
        shippingAmount: invoice.shippingAmount,
        shippingTaxRate: invoice.shippingTaxRate,
        currency: invoice.currency,
      });

      const pdfBuffer = await renderInvoicePdf({ invoice, totals });
      const safeFilename = sanitizeFilename(invoice.number);

      reply
        .header("Content-Type", "application/pdf")
        .header(
          "Content-Disposition",
          `attachment; filename="${safeFilename}.pdf"`
        )
        .header("Cache-Control", "private, no-store, max-age=0")
        .send(pdfBuffer);
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
