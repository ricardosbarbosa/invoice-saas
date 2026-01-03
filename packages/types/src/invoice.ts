import { z } from "zod";
import type { Prisma } from "@workspace/db";
import { decimalInput } from "./common";

/**
 * Invoice totals calculation result.
 */
export type InvoiceTotals = {
  subtotal: string;
  total: string;
};

/**
 * Invoice status enum values.
 */
export type InvoiceStatus = "draft" | "sent" | "paid" | "void";

/**
 * Zod schema for invoice item.
 */
export const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: decimalInput,
  unitPrice: decimalInput,
});

/**
 * Base invoice schema (without clientId for updates).
 */
export const invoiceBaseSchema = z.object({
  clientId: z.string().min(1, "Client is required."),
  issueDate: z.date({ error: "Issue date is required." }),
  dueDate: z.date({ error: "Due date is required." }),
  currency: z.string().length(3, "Currency must be 3 characters.").optional(),
  notes: z.string().optional(),
  items: z
    .array(invoiceItemSchema)
    .min(1, { error: "Add at least one line item." }),
});

/**
 * Invoice create schema (includes clientId).
 */
export const invoiceCreateSchema = invoiceBaseSchema;

/**
 * Invoice update schema (clientId omitted, status optional).
 */
export const invoiceUpdateSchema = invoiceBaseSchema
  .omit({ clientId: true })
  .partial()
  .extend({
    status: z.enum(["draft", "sent", "paid", "void"]).optional(),
  });

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
