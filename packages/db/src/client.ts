import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, type Prisma } from "@prisma/client"
import { Pool } from "pg"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

const logLevels: Prisma.LogLevel[] =
  process.env.NODE_ENV === "development"
    ? ["query", "error", "warn"]
    : ["error"]

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is not set")
}

/**
 * A singleton Prisma client that stays alive across dev reloads.
 * This is safe to import from both the API and Next.js server modules.
 */
export const prisma =
  globalForPrisma.prisma ??
  (() => {
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)

    return new PrismaClient({
      adapter,
      log: logLevels
    })
  })()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
