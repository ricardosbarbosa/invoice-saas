import { z } from "zod";
import type { Prisma } from "@workspace/db";
import {
  optionalString,
  optionalEmail,
  optionalCurrency,
} from "./common";

/**
 * Client status enum values.
 */
export type ClientStatus = "active" | "archived";

/**
 * Base client schema.
 */
export const clientSchema = z.object({
  name: z.string().min(1),
  email: optionalEmail,
  phone: optionalString,
  taxId: optionalString,
  addressLine1: optionalString,
  addressLine2: optionalString,
  city: optionalString,
  state: optionalString,
  postalCode: optionalString,
  country: optionalString,
  currency: optionalCurrency,
  notes: optionalString,
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

