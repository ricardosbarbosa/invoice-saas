// This file contains code that we reuse between our tests.
import * as test from "node:test";
import Fastify from "fastify";
import { app, options } from "../src/fastify-app.js";

process.env.DATABASE_URL ??=
  "postgres://postgres:postgres@localhost:5432/postgres";
process.env.BETTER_AUTH_SECRET ??= "test-test-test-test-test-test-1234";
process.env.BETTER_AUTH_URL ??= "http://localhost:3001";
process.env.CORS_ORIGIN ??= "http://example.com";

export type TestContext = {
  after: typeof test.after;
};

// Fill in this config with all the configurations
// needed for testing the application
function config() {
  return {
    skipOverride: true, // Register our application with fastify-plugin
  };
}

// Automatically build and tear down our instance
async function build(t: TestContext) {
  const fastify = Fastify({
    logger: false, // Disable logging in tests
    ...options,
    ...config(),
  });

  // Register the app plugin
  await fastify.register(app, options);

  // Tear down our app after we are done
  // eslint-disable-next-line no-void
  t.after(() => void fastify.close());

  return fastify;
}

export { config, build };
