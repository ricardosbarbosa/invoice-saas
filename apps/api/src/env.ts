import { createEnv } from "@t3-oss/env-core";
import { databaseUrlSchema, portSchema, z } from "@workspace/env";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    HOST: z.string().default("0.0.0.0"),
    PORT: portSchema.default(3001),
    CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),
    DATABASE_URL: databaseUrlSchema,
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url().optional(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
