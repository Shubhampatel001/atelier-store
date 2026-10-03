import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { products } from "./catalog";

/**
 * pending      Checkout Session created, not paid yet.
 * paid         Paid and stock decremented.
 * needs_review Paid, but stock ran out before fulfilment (oversold).
 * failed       A delayed payment method failed.
 * expired      The Checkout Session expired unpaid.
 */
export const orderStatus = pgEnum("order_status", [
  "pending",
  "paid",
  "needs_review",
  "failed",
  "expired",
]);

export type OrderShippingAddress = {
  name: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
};

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    status: orderStatus("status").notNull().default("pending"),
    stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    email: text("email"),
    currency: text("currency").notNull().default("usd"),
    /** Minor units (cents), from our catalogue at checkout start. */
    subtotal: integer("subtotal").notNull(),
    /** Minor units (cents), as charged by Stripe. Set when paid. */
    total: integer("total"),
    shippingAddress: jsonb("shipping_address").$type<OrderShippingAddress>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (table) => [
    index("orders_status_idx").on(table.status),
    check("orders_subtotal_check", sql`${table.subtotal} >= 0`),
  ],
);

/** Snapshot of each bag line at checkout start; survives catalogue edits. */
export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    color: text("color").notNull(),
    size: text("size").notNull(),
    image: text("image").notNull(),
    /** Minor units (cents). */
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    check("order_items_quantity_check", sql`${table.quantity} > 0`),
    check("order_items_unit_price_check", sql`${table.unitPrice} >= 0`),
  ],
);

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
