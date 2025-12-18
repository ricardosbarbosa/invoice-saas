import { z } from "zod"

/**
 * Shared validators/helpers for environment variables across the monorepo.
 *
 * Note: app-specific env schemas live in each app (e.g. `apps/web/env.ts`,
 * `apps/api/src/env.ts`). This package is for reusable building blocks.
 */

export { z }

export const portSchema = z.coerce.number().int().min(1).max(65535)
export const urlSchema = z.string().url()


