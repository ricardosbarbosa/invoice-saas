import { prisma } from "@workspace/db";
import { betterAuth } from "better-auth";
import { admin, openAPI, organization } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { ac, adminRoles, organizationRoles } from "./permissions.js";
import { passkey } from "@better-auth/passkey";
import { Resend } from "resend";

function getResendClient(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to your API env (.env) so password reset + email verification can send emails."
    );
  }
  return new Resend(key);
}

function getResendFrom(): string {
  // In production you should set RESEND_FROM to a verified sender/domain in Resend.
  // For local smoke tests, Resend allows using onboarding@resend.dev.
  return (
    process.env.RESEND_FROM ??
    (process.env.NODE_ENV === "production"
      ? ""
      : "Invoice SaaS <onboarding@resend.dev>")
  );
}

function getFrontendBaseURL(fallbackOrigins: string[]): string {
  // Used to generate "pretty" links that land on the frontend, then the frontend
  // calls Better Auth endpoints with the token.
  //
  // Priority:
  // 1) FRONTEND_URL
  // 2) first value from CORS_ORIGIN (already parsed into trustedOrigins)
  const direct = process.env.FRONTEND_URL?.trim();
  if (direct) return direct;
  if (fallbackOrigins.length > 0) return fallbackOrigins[0]!;
  throw new Error(
    "FRONTEND_URL is not set and CORS_ORIGIN is empty. Set FRONTEND_URL (e.g. https://app.example.com) to generate frontend links in emails."
  );
}

const trustedOrigins: string[] = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin: string) => origin.trim())
  .filter(Boolean);

const isProd = process.env.NODE_ENV === "production";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const auth: ReturnType<typeof betterAuth> = betterAuth({
  appName: "Invoice SaaS",
  advanced: {
    /**
     * Important:
     * - In production (HTTPS + real subdomains), cross-subdomain cookies are desirable.
     * - On localhost, setting a cookie Domain can cause browsers to reject the cookie.
     */
    crossSubDomainCookies: { enabled: isProd },
    defaultCookieAttributes: {
      /**
       * Important:
       * - `SameSite=None` requires `Secure` in modern browsers.
       * - Local dev often runs on plain HTTP, so `SameSite=Lax` + non-secure cookies
       *   are more reliable on localhost.
       */
      sameSite: isProd ? "None" : "Lax",
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - depends on better-auth version typings
      secure: isProd,
    },
  },
  /**
   * Fastify base URL. Falls back to localhost when unset so
   * local dev works without extra configuration.
   */
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, token }) => {
      const from = getResendFrom();
      if (!from) {
        throw new Error(
          'RESEND_FROM is not set. Set it to something like "Invoice SaaS <no-reply@yourdomain.com>" (must be a verified sender in Resend).'
        );
      }

      const frontendBaseURL = getFrontendBaseURL(trustedOrigins);
      const resetUrl = new URL("/reset-password", frontendBaseURL);
      resetUrl.searchParams.set("token", token);

      const resend = getResendClient();
      const result = await resend.emails.send({
        from,
        to: user.email,
        subject: "Reset your password",
        text: `Hello ${user.name}, click ${resetUrl.toString()} to reset your password.`,
        html: `
          <p>Hello ${user.name},</p>
          <p>Click <a href="${resetUrl.toString()}">here</a> to reset your password.</p>
        `,
      });

      // Resend returns { data, error } (and may also throw). Make failures explicit.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maybeError = (result as any)?.error;
      if (maybeError) {
        throw new Error(
          `Failed to send reset password email via Resend: ${
            maybeError?.message ?? String(maybeError)
          }`
        );
      }
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, token }) => {
      const from = getResendFrom();
      if (!from) {
        throw new Error(
          'RESEND_FROM is not set. Set it to something like "Invoice SaaS <no-reply@yourdomain.com>" (must be a verified sender in Resend).'
        );
      }

      const frontendBaseURL = getFrontendBaseURL(trustedOrigins);
      const verifyUrl = new URL("/verify-email", frontendBaseURL);
      verifyUrl.searchParams.set("token", token);

      const resend = getResendClient();
      const result = await resend.emails.send({
        from,
        to: user.email,
        subject: "Verify your email",
        text: `Hello ${user.name}, click ${verifyUrl.toString()} to verify your email.`,
        html: `
          <p>Hello ${user.name},</p>
          <p>Click <a href="${verifyUrl.toString()}">here</a> to verify your email.</p>
        `,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maybeError = (result as any)?.error;
      if (maybeError) {
        throw new Error(
          `Failed to send verification email via Resend: ${
            maybeError?.message ?? String(maybeError)
          }`
        );
      }
    },
  },
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
