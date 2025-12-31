import z from "zod";
import type { Prisma } from "@workspace/db";

/**
 * Client status enum values.
 */
export type ClientStatus = "active" | "archived";

/**
 * Base client schema.
 */
export const clientSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string(),
  taxId: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  notes: z.string(),
});

/**
 * Client update schema (all fields optional, status can be updated).
 */
export const clientUpdateSchema = clientSchema.partial().extend({
  status: z.enum(["active", "archived"]).optional(),
});

/**
 * Type inferred from client schema.
 */
export type ClientCreateInput = z.infer<typeof clientSchema>;

/**
 * Type inferred from client update schema.
 */
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;

/**
 * Type inferred from client schema (for form values).
 */
export type ClientFormValues = z.infer<typeof clientSchema>;

/**
 * Prisma payload type for client with organization.
 */
export type ClientWithOrganization = Prisma.ClientGetPayload<{
  include: { organization: true };
}>;
