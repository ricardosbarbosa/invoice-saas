import { z } from "zod";
import type { Prisma } from "@workspace/db";

/**
 * Type representing values that can be converted to Decimal.
 */
export type DecimalLike = Prisma.Decimal | string | number;

/**
 * Zod schema for decimal input (accepts string or number).
 */
export const decimalInput = z.union([z.string(), z.number()]);
