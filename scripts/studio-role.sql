-- Least-privilege role for Drizzle Studio (`npm run db:studio`).
-- Run once as the database owner (Neon SQL Editor), after replacing the
-- password placeholder. Never commit the real password.
--
-- Studio can read and edit catalogue rows, but cannot change the schema or
-- touch any other table (e.g. Better Auth's user/session tables, the
-- drizzle migrations journal). Re-run the GRANT block when new tables
-- should be editable in Studio.

CREATE ROLE studio_editor WITH LOGIN PASSWORD '<generate-a-long-random-password>';

GRANT USAGE ON SCHEMA public TO studio_editor;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE categories, products, product_stock
  TO studio_editor;

-- Needed to insert rows with serial ids.
GRANT USAGE, SELECT ON SEQUENCE categories_id_seq, products_id_seq TO studio_editor;
