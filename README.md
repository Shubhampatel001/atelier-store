# Atelier Store

eCommerce app foundation built on:

- [Next.js](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com) v4
- [Better Auth](https://www.better-auth.com) for authentication
- [Drizzle ORM](https://orm.drizzle.team) with [Neon](https://neon.tech) serverless Postgres

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env template and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

   - `DATABASE_URL` — Neon connection string
   - `BETTER_AUTH_SECRET` — generate with `npx auth@latest secret`

3. Start the dev server:

   ```bash
   npm run dev
   ```

   Better Auth is mounted at `/api/auth/*`. It returns errors until its tables
   exist (see below).

## Project structure

```
drizzle.config.ts              Drizzle Kit config (reads .env.local)
src/app/api/auth/[...all]/     Better Auth route handler
src/db/index.ts                Drizzle client (Neon HTTP driver)
src/db/schema/                 Drizzle table definitions
src/lib/auth.ts                Better Auth server instance
src/lib/auth-client.ts         Better Auth React client
```

## Scripts

| Script                  | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| `npm run dev`           | Start the dev server                                 |
| `npm run build`         | Production build                                     |
| `npm run lint`          | Run ESLint                                           |
| `npm run typecheck`     | Type-check with `tsc`                                |
| `npm run db:generate`   | Generate SQL migrations from the schema              |
| `npm run db:migrate`    | Apply migrations                                     |
| `npm run db:push`       | Push schema directly to the database (prototyping)   |
| `npm run db:studio`     | Open Drizzle Studio                                  |
| `npm run auth:generate` | Generate Better Auth tables into `src/db/schema/auth.ts` |

Better Auth's tables are not created yet. When auth work begins, run
`npm run auth:generate`, re-export the file from `src/db/schema/index.ts`,
then `npm run db:generate && npm run db:migrate`.
