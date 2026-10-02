import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  orderItems,
  orders,
  products,
  type OrderShippingAddress,
} from "@/db/schema";

export type NewOrderItem = {
  slug: string;
  name: string;
  color: string;
  size: string;
  image: string;
  /** Minor units (cents). */
  unitPrice: number;
  quantity: number;
};

/** Order and line snapshots in one transaction (`db.batch`). */
export async function createPendingOrder(
  id: string,
  items: NewOrderItem[],
  subtotal: number,
) {
  await db.batch([
    db.insert(orders).values({ id, subtotal }),
    db.insert(orderItems).values(
      items.map((item) => ({
        ...item,
        orderId: id,
        productId: sql`(select ${products.id} from ${products} where ${products.slug} = ${item.slug})`,
      })),
    ),
  ]);
}

export async function attachCheckoutSession(id: string, sessionId: string) {
  await db
    .update(orders)
    .set({ stripeCheckoutSessionId: sessionId })
    .where(eq(orders.id, id));
}

export async function deleteOrder(id: string) {
  await db.delete(orders).where(eq(orders.id, id));
}

/** Move a still-pending order to a terminal unpaid status. */
export async function closePendingOrder(
  sessionId: string,
  status: "failed" | "expired",
) {
  await db
    .update(orders)
    .set({ status })
    .where(
      and(
        eq(orders.stripeCheckoutSessionId, sessionId),
        eq(orders.status, "pending"),
      ),
    );
}

export type PaidDetails = {
  orderId: string;
  sessionId: string;
  paymentIntentId: string | null;
  email: string | null;
  total: number | null;
  shippingAddress: OrderShippingAddress | null;
};

/**
 * Marks a pending order paid and decrements stock, exactly once.
 *
 * One statement, so it is atomic on the HTTP driver: the order row is
 * claimed only while still `pending` (concurrent webhook and success-page
 * calls serialise on that row lock), and stock is decremented only for
 * the claimed order and only where enough remains. Lines that could not be
 * decremented mean the order was oversold and needs a person to resolve it.
 *
 * Returns the slugs whose stock changed, or null if already fulfilled.
 */
export async function markOrderPaid(details: PaidDetails) {
  const result = await db.execute(sql`
    with claimed as (
      update ${orders}
      set status = 'paid',
          paid_at = now(),
          updated_at = now(),
          email = ${details.email},
          total = ${details.total},
          stripe_payment_intent_id = ${details.paymentIntentId},
          shipping_address = ${
            details.shippingAddress
              ? JSON.stringify(details.shippingAddress)
              : null
          }::jsonb
      where id = ${details.orderId}
        and stripe_checkout_session_id = ${details.sessionId}
        and status = 'pending'
      returning id
    ),
    decremented as (
      update product_stock as ps
      set quantity = ps.quantity - oi.quantity
      from order_items as oi
      join claimed on claimed.id = oi.order_id
      where ps.product_id = oi.product_id
        and ps.size = oi.size
        and ps.quantity >= oi.quantity
      returning oi.slug
    )
    select
      (select count(*) from claimed)::int as claimed,
      (select count(*) from decremented)::int as decremented,
      (select count(*) from order_items where order_id = ${details.orderId})::int as lines,
      (select array_agg(distinct slug) from decremented) as slugs
  `);

  const [row] = result.rows as {
    claimed: number;
    decremented: number;
    lines: number;
    slugs: string[] | null;
  }[];
  if (!row || row.claimed === 0) return null;

  if (row.decremented < row.lines) {
    await db
      .update(orders)
      .set({ status: "needs_review" })
      .where(eq(orders.id, details.orderId));
  }
  return row.slugs ?? [];
}

export async function getOrderBySession(sessionId: string) {
  return db.query.orders.findFirst({
    where: eq(orders.stripeCheckoutSessionId, sessionId),
    with: { items: { orderBy: (item, { asc }) => [asc(item.id)] } },
  });
}
