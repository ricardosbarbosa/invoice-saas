import "dotenv/config";

import Fastify from "fastify";
import { app, options } from "./fastify-app";
import { env } from "./env";

async function start() {
  const fastify = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
    },
    ...options,
  });

  // Register the app plugin
  await fastify.register(app, options);

  try {
    await fastify.listen({
      host: env.HOST,
      port: env.PORT,
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
