import { prisma } from "@workspace/db"
import { betterAuth } from "better-auth"
import { admin, organization } from "better-auth/plugins"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { ac, adminRoles, organizationRoles } from "./permissions.js"

const trustedOrigins: string[] = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin: string) => origin.trim())
  .filter(Boolean)

export const auth = betterAuth({
  appName: "Invoice SaaS",
  /**
   * Fastify base URL. Falls back to localhost when unset so
   * local dev works without extra configuration.
   */
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  trustedOrigins,
  plugins: [
    admin({
      ac,
      roles: adminRoles,
      /**
       * Admin role is inferred from the user's role field (default "admin").
       * No adminUserIds override so roles drive access control.
       */
    }),
    organization({
      ac,
      roles: organizationRoles,
      dynamicAccessControl: {
        enabled: true,
      },
    })
  ]
})

type SessionPayload = NonNullable<Awaited<ReturnType<(typeof auth)["api"]["getSession"]>>>
export type AuthContext = SessionPayload
export type AuthSession = SessionPayload["session"]
export type AuthUser = SessionPayload["user"]
