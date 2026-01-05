import "dotenv/config";

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import { FastifyPluginAsync, FastifyServerOptions } from "fastify";
import { env } from "./env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface AppOptions
  extends FastifyServerOptions, Partial<AutoloadPluginOptions> {}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // Place here your custom code!
  // Validate environment variables as early as possible.
  void env;

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: {
      ...opts,
      prefix: "/api",
    },
  });
};

export default app;
export { app, options };
