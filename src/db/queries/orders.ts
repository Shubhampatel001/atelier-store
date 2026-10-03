import "server-only";

import { and, desc, eq, inArray, sql } from "drizzle-orm";

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
  userId: string | null,
) {
  await db.batch([
    db.insert(orders).values({ id, subtotal, userId }),
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
 * One statement, so it is atomic on the HTTP driver. The order's stock rows
 * are locked first (in a fixed order, so concurrent orders can't deadlock)
 * and checked against the lines. The order row is then claimed only while
 * still `pending` (concurrent webhook and success-page calls serialise on
 * that row lock) and gets its final status in the same write: `paid`, or
 * `needs_review` if any line was oversold and needs a person to resolve it.
 * Stock is decremented only for the claimed order and only where enough
 * remains.
 *
 * An order whose session ID was never attached (see `startCheckout`) is
 * claimed by the session that names it in `order_id` metadata, which
 * `fulfillCheckout` reads from Stripe, and gets that session ID now.
 *
 * Returns the slugs whose stock changed, or null if already fulfilled.
 */
export async function markOrderPaid(details: PaidDetails) {
  const result = await db.execute(sql`
    with locked as (
      select ps.quantity >= oi.quantity as enough
      from order_items as oi
      join product_stock as ps
        on ps.product_id = oi.product_id and ps.size = oi.size
      where oi.order_id = ${details.orderId}
      order by ps.product_id, ps.size
      for update of ps
    ),
    claimed as (
      update ${orders}
      set status = (
            case
              when (select count(*) from locked where enough)
                 = (select count(*) from order_items where order_id = ${details.orderId})
              then 'paid'
              else 'needs_review'
            end
          )::order_status,
          paid_at = now(),
          updated_at = now(),
          email = ${details.email},
          total = ${details.total},
          stripe_checkout_session_id = ${details.sessionId},
          stripe_payment_intent_id = ${details.paymentIntentId},
          shipping_address = ${
            details.shippingAddress
              ? JSON.stringify(details.shippingAddress)
              : null
          }::jsonb
      where id = ${details.orderId}
        and (stripe_checkout_session_id = ${details.sessionId}
             or stripe_checkout_session_id is null)
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
      (select array_agg(distinct slug) from decremented) as slugs
  `);

  const [row] = result.rows as { claimed: number; slugs: string[] | null }[];
  if (!row || row.claimed === 0) return null;
  return row.slugs ?? [];
}

export async function getOrderBySession(sessionId: string) {
  return db.query.orders.findFirst({
    where: eq(orders.stripeCheckoutSessionId, sessionId),
    with: { items: { orderBy: (item, { asc }) => [asc(item.id)] } },
  });
}

/**
 * A customer's placed orders, newest first. Pending checkouts and unpaid
 * sessions are left out: they never became orders from the customer's view.
 */
export async function getOrdersForUser(userId: string) {
  return db.query.orders.findMany({
    where: and(
      eq(orders.userId, userId),
      inArray(orders.status, ["paid", "needs_review"]),
    ),
    orderBy: [desc(orders.createdAt)],
    columns: {
      id: true,
      status: true,
      subtotal: true,
      total: true,
      createdAt: true,
    },
    with: {
      items: {
        orderBy: (item, { asc }) => [asc(item.id)],
        columns: { id: true, name: true, image: true, quantity: true },
      },
    },
  });
}
