import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

// Drizzle Studio's local server runs SQL for any request with no auth and
// wildcard CORS, so any website open while it runs can reach it. Give it a
// least-privilege role (see CLAUDE.md) instead of the owner DATABASE_URL.
// Deliberately no fallback to DATABASE_URL.
const url = process.env.STUDIO_DATABASE_URL;
if (!url) {
  throw new Error(
    "STUDIO_DATABASE_URL is not set. Add a limited-role connection string to .env.local (see CLAUDE.md).",
  );
}
if (url === process.env.DATABASE_URL) {
  throw new Error(
    "STUDIO_DATABASE_URL must not be the same credential as DATABASE_URL.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
