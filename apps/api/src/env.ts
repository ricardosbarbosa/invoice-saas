import { createEnv } from '@t3-oss/env-core'
import { portSchema, z } from '@workspace/env'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    HOST: z.string().default('0.0.0.0'),
    PORT: portSchema.default(3001),
    CORS_ORIGIN: z.string().min(1).optional()
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true
})


