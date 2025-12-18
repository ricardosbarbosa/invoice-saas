# Getting Started with [Fastify-CLI](https://www.npmjs.com/package/fastify-cli)
This project was bootstrapped with Fastify-CLI.

## Available Scripts

Run these from the repo root unless noted otherwise:

- `pnpm dev` — starts the monorepo dev servers (web + api) via Turbo
- `pnpm --filter api dev` — starts only the API in watch mode
- `pnpm --filter api build` — builds the API to `dist/`
- `pnpm --filter api start` — runs the compiled API from `dist/`
- `pnpm --filter api test` — runs the API tests

## Environment Variables

Create an `apps/api/.env` file (or set env vars in your process manager). Use `apps/api/.env.example` as a starting point.

- `NODE_ENV`: `development` | `test` | `production` (default: `development`)
- `HOST`: bind address (default: `0.0.0.0`)
- `PORT`: server port (default: `3001`)
- `CORS_ORIGIN`: optional. If set, CORS is restricted to that origin; otherwise CORS allows all origins.

## Learn More

To learn Fastify, check out the [Fastify documentation](https://fastify.dev/docs/latest/).
