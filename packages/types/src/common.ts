import { z } from "zod";
import type { Prisma } from "@workspace/db";

/**
 * Helper to convert empty strings to undefined for optional fields.
 * Uses preprocess for better type inference.
 */
export const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value: unknown) => (value === "" ? undefined : value),
    schema.optional()
  );

/**
 * Type representing values that can be converted to Decimal.
 */
export type DecimalLike = Prisma.Decimal | string | number;

/**
 * Zod schema for decimal input (accepts string or number).
 */
export const decimalInput = z.union([z.string(), z.number()]);

/**
 * Optional decimal input schema.
 */
export const optionalDecimalInput = emptyToUndefined(decimalInput);

/**
 * Optional string schema.
 */
export const optionalString = emptyToUndefined(z.string());

/**
 * Optional email schema.
 */
export const optionalEmail = emptyToUndefined(z.string().email());

/**
 * Optional date string schema (ISO datetime).
 */
export const optionalDateString = emptyToUndefined(z.string().datetime());

/**
 * Optional currency schema (3-character string).
 */
export const optionalCurrency = emptyToUndefined(z.string().length(3));

