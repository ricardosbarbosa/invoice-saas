# shadcn/ui monorepo template

This template is for creating a monorepo with shadcn/ui.

## Usage

```bash
pnpm dlx shadcn@latest init
```

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button"
```

## Environment Variables (T3 Env)

This repo uses **T3 Env** for typed + runtime-validated environment variables.

- Web (Next.js): copy `apps/web/.env.example` to `apps/web/.env.local`
- API (Fastify): copy `apps/api/.env.example` to `apps/api/.env`

If required env vars are missing/invalid, the app will fail fast at startup/build time.

## Database (Prisma 7)

- Shared Prisma 7 setup lives in `packages/db` (`prisma/schema.prisma` + `prisma.config.ts`) and uses the Postgres adapter.
- Copy `packages/db/.env.example` to `packages/db/.env` and set `DATABASE_URL` (also set the same value in `apps/api/.env` for runtime).
- Generate the client once after changing the schema: `DATABASE_URL="postgresql://..." pnpm --filter @workspace/db prisma:generate`.
- Migrations: `pnpm --filter @workspace/db prisma:migrate -- --name init` (or `prisma:push` for dev sync) and explore data with `prisma:studio`.
- Use the client from any workspace package: `import { prisma } from "@workspace/db"`—the Fastify app auto-loads it as `fastify.prisma`.
