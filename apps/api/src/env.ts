import z from "zod";

// Helper to convert empty strings to undefined
const emptyStringAsUndefined = (val: string | undefined) =>
  val === "" ? undefined : val;

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  // Used by @workspace/auth (Resend) for password reset + email verification.
  RESEND_API_KEY: z.string().min(1),
  // Must be a verified sender in Resend (usually a verified domain).
  // Example: "Invoice SaaS <no-reply@yourdomain.com>"
  // For quick local testing you can use: "Invoice SaaS <onboarding@resend.dev>"
  RESEND_FROM: z.string().min(1).optional(),
});

// Parse and validate environment variables
const rawEnv = Object.fromEntries(
  Object.entries(process.env).map(([key, value]) => [
    key,
    emptyStringAsUndefined(value),
  ])
);

export const env = envSchema.parse(rawEnv);
