import { prisma } from "@workspace/db";
import { betterAuth } from "better-auth";
import { admin, openAPI, organization } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { ac, adminRoles, organizationRoles } from "./permissions.js";
import { passkey } from "@better-auth/passkey";

const trustedOrigins: string[] = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin: string) => origin.trim())
  .filter(Boolean);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const auth: ReturnType<typeof betterAuth> = betterAuth({
  appName: "Invoice SaaS",
  advanced: {
    crossSubDomainCookies: { enabled: true },
    defaultCookieAttributes: {
      sameSite: "None",
    },
  },
  /**
   * Fastify base URL. Falls back to localhost when unset so
   * local dev works without extra configuration.
   */
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins,
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  plugins: [
    openAPI(),
    passkey(),
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
    }),
  ],
});

type SessionPayload = NonNullable<
  Awaited<ReturnType<(typeof auth)["api"]["getSession"]>>
>;
export type AuthContext = SessionPayload;
export type AuthSession = SessionPayload["session"];
export type AuthUser = SessionPayload["user"];
