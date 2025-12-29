import { z } from "zod";
import type { Prisma } from "@workspace/db";
import {
  decimalInput,
  optionalDecimalInput,
  optionalDateString,
  optionalCurrency,
  optionalString,
} from "./common";

/**
 * Invoice totals calculation result.
 */
export type InvoiceTotals = {
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  shippingTotal: string;
  shippingTax: string;
  total: string;
};

/**
 * Invoice status enum values.
 */
export type InvoiceStatus = "draft" | "sent" | "paid" | "void";

/**
 * Discount type enum values.
 */
export type DiscountType = "percentage" | "fixed";

/**
 * Zod schema for invoice item.
 */
export const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: decimalInput,
  unitPrice: decimalInput,
  taxRate: optionalDecimalInput,
});

/**
 * Base invoice schema (without clientId for updates).
 */
export const invoiceBaseSchema = z.object({
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

/**
 * Discount validation refinement function.
 */
const discountRefine = (
  data: { discountType?: DiscountType; discountValue?: unknown },
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

/**
 * Invoice create schema (includes clientId and applies discount validation).
 */
export const invoiceCreateSchema = invoiceBaseSchema.superRefine(discountRefine);

/**
 * Invoice update schema (clientId omitted, status optional, applies discount validation).
 */
export const invoiceUpdateSchema = invoiceBaseSchema
  .omit({ clientId: true })
  .partial()
  .extend({
    status: z.enum(["draft", "sent", "paid", "void"]).optional(),
  })
  .superRefine(discountRefine);

/**
 * Type inferred from invoice create schema.
 */
export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;

/**
 * Type inferred from invoice update schema.
 */
export type InvoiceUpdateInput = z.infer<typeof invoiceUpdateSchema>;

/**
 * Prisma payload type for invoice with client and items.
 */
export type InvoiceWithClientAndItems = Prisma.InvoiceGetPayload<{
  include: { client: true; items: true };
}>;

/**
 * Prisma payload type for invoice with all relations.
 */
export type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: { items: true; client: true; organization: true };
}>;

/**
 * Invoice with client, items, and computed totals.
 */
export type InvoiceWithClientAndItemsAndTotals = InvoiceWithClientAndItems & {
  totals: InvoiceTotals;
};

