import "server-only";

import { asc, eq, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { products, productStock } from "@/db/schema";
import { LOW_STOCK_THRESHOLD } from "@/lib/catalog";
import { requireAdmin } from "@/lib/session";

// Admin-only reads. Each one checks the caller itself, so a page that
// forgets to call `requireAdmin()` still can't leak this data.

const PLACED = sql`status in ('paid', 'needs_review')`;
const LAST_30_DAYS = sql`created_at >= now() - interval '30 days'`;

/** Headline numbers for the dashboard. Money is in cents. */
export async function getDashboardStats() {
  await requireAdmin();

  const result = await db.execute(sql`
    select
      (select coalesce(sum(coalesce(total, subtotal)), 0)
         from orders where ${PLACED} and ${LAST_30_DAYS})::int as revenue,
      (select count(*) from orders where ${PLACED} and ${LAST_30_DAYS})::int as orders,
      (select count(*) from orders where status = 'needs_review')::int as needs_review,
      (select count(*) from product_stock
         where quantity <= ${LOW_STOCK_THRESHOLD})::int as low_stock
  `);
  const [row] = result.rows as {
    revenue: number;
    orders: number;
    needs_review: number;
    low_stock: number;
  }[];
  return {
    revenue: row.revenue,
    orders: row.orders,
    needsReview: row.needs_review,
    lowStock: row.low_stock,
  };
}

/** Sizes at or below the low-stock threshold, emptiest first. */
export async function getLowStock(limit = 10) {
  await requireAdmin();

  return db
    .select({
      slug: products.slug,
      name: products.name,
      size: productStock.size,
      quantity: productStock.quantity,
    })
    .from(productStock)
    .innerJoin(products, eq(products.id, productStock.productId))
    .where(lte(productStock.quantity, LOW_STOCK_THRESHOLD))
    .orderBy(asc(productStock.quantity), asc(products.name), asc(productStock.position))
    .limit(limit);
}
