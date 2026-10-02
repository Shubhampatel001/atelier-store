# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev            # dev server (also rewrites AGENTS.md — see below)
npm run build          # production build
npm run lint           # ESLint (flat config, eslint-config-next core-web-vitals + typescript)
npm run typecheck      # tsc --noEmit
npm run db:generate    # generate SQL migrations from src/db/schema into ./drizzle
npm run db:migrate     # apply migrations
npm run db:push        # push schema directly (prototyping only)
npm run db:studio      # Drizzle Studio
npm run db:seed        # reset catalogue tables from src/db/seed-data.ts
npm run auth:generate  # generate Better Auth tables into src/db/schema/auth.ts
```

There is no test runner configured. Verify changes with `npm run typecheck` and `npm run lint`.

## Environment

Copy `.env.example` to `.env.local`. Both the app and `drizzle.config.ts` read `.env.local` (Drizzle Kit loads it explicitly via `dotenv`). Required: `DATABASE_URL` (Neon pooled connection string), `BETTER_AUTH_SECRET` (`npx auth@latest secret`), `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`.

`src/db/index.ts` throws at import time if `DATABASE_URL` is unset, so anything importing `@/db` or `@/lib/auth` (including the `/api/auth/*` route) fails without it.

## Architecture

Next.js 16 App Router + React 19, TypeScript strict, Tailwind CSS v4, Drizzle ORM on Neon serverless Postgres, Better Auth. Path alias `@/*` → `src/*`.

- **Next.js version caveat:** Next 16 differs from older training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next-specific code. Example already in use: route-typed global helpers like `LayoutProps<"/">` in `src/app/layout.tsx` (types generated under `.next/types` / `.next/dev/types`).
- **Database:** `src/db/index.ts` exports a single `db` built with the Neon **HTTP** driver (`drizzle-orm/neon-http`) and the full schema object. The HTTP driver has no interactive transactions. All tables live in `src/db/schema/` and must be re-exported from `src/db/schema/index.ts` — that barrel is what both the `db` client (relational queries) and Drizzle Kit (`schema: "./src/db/schema"`) consume.
- **Auth:** `src/lib/auth.ts` is the server Better Auth instance using `drizzleAdapter(db, { provider: "pg" })`; `nextCookies()` must remain the **last** plugin. It's mounted via `toNextJsHandler` at `src/app/api/auth/[...all]/route.ts`. `src/lib/auth-client.ts` is the React client (`better-auth/react`) pointed at `NEXT_PUBLIC_APP_URL`.
- **Tailwind v4 / design system:** configured in CSS only — everything lives in `src/app/globals.css`; there is no `tailwind.config` file. Monochrome luxury-editorial style: the default Tailwind palette and radius scale are reset (`--color-*: initial`, `--radius-*: initial`), so only system tokens exist (`paper`, `ink`, `muted`, `surface`, `line`, `sale`, …) and corners are square (`rounded-full` still works). Colour tokens map to raw `:root` variables via `@theme inline`, so `.theme-inverse` re-themes a subtree for dark bands. Use the role utilities (`type-display`, `type-heading`, `type-label`, `type-price`, …), layout primitives (`shell`, `section`, `product-grid`, `split`, `media`, `divider`), semantic spacing (`px-gutter`, `py-section`, `gap-block`), and component classes (`btn btn-primary|secondary|ghost`, `link`, `link-quiet`) rather than ad-hoc values. Fonts: Geist (sans), Bodoni Moda (`font-serif`, display), Geist Mono — loaded via `next/font` in `src/app/layout.tsx`.

## Catalogue data

Products, categories and per-size stock live in Postgres (`src/db/schema/catalog.ts`: `categories` 1─< `products` 1─< `product_stock`). Prices are stored as integer cents. `product_stock` is keyed by `(product_id, size)`, and products without sizes have a single `One size` row. This is not a variants model: a size has no SKU or price of its own.

- Read through `src/db/queries/catalog.ts` (`server-only`, React `cache`). It maps rows to the `Product` type the components already use, with prices in dollars.
- `src/lib/catalog.ts` holds the types, pure stock/price helpers and static marketing content. It must **never** import `@/db`, because the client `PurchasePanel` imports it through `StockStatus`.
- `/` and `/products/[slug]` use ISR (`revalidate = 60`). `next build` therefore needs `DATABASE_URL`.
- `npm run db:seed` (`tsx --env-file=.env.local src/db/seed.ts`) wipes the catalogue tables and reloads them from `src/db/seed-data.ts` in one `db.batch`. Schema changes go through `db:generate` → review SQL → `db:migrate`.

## Current state

Beyond the catalogue tables, this is a foundation only: no auth method (e.g. `emailAndPassword`) is enabled yet, so Better Auth errors until its tables exist. To set up auth tables: `npm run auth:generate`, re-export `./auth` from `src/db/schema/index.ts`, then `npm run db:generate && npm run db:migrate`. Re-run `auth:generate` whenever Better Auth plugins/config change the required schema.

## AGENTS.md

`AGENTS.md` is written and re-added by `next dev` (see `node_modules/next/dist/server/lib/generate-agent-files.js`). Don't hand-edit or delete it; reverting it just recreates the change. Put project guidance in this file instead.
