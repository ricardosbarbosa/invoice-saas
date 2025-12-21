import fp from "fastify-plugin";
import cors, { FastifyCorsOptions } from "@fastify/cors";
import { env } from "../env";

export default fp<FastifyCorsOptions>(async (fastify) => {
  await fastify.register(cors, {
    origin: env.CORS_ORIGIN ?? true,
    credentials: true,

    // ✅ important for DELETE (preflight)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],

    // optional but nice
    optionsSuccessStatus: 204,
  });
});
