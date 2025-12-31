import z from "zod";

// Helper to convert empty strings to undefined
const emptyStringAsUndefined = (val: string | undefined) =>
  val === "" ? undefined : val;

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
});

// Parse and validate environment variables
const rawEnv = {
  NEXT_PUBLIC_API_URL: emptyStringAsUndefined(process.env.NEXT_PUBLIC_API_URL),
};

export const env = envSchema.parse(rawEnv);
