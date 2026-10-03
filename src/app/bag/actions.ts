"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type Stripe from "stripe";

import { getBag, readBagLines } from "@/db/queries/bag";
import { getSizeStock } from "@/db/queries/catalog";
import {
  attachCheckoutSession,
  createPendingOrder,
  deleteOrder,
  type NewOrderItem,
} from "@/db/queries/orders";
import {
  BAG_COOKIE,
  BAG_MAX_AGE,
  MAX_BAG_LINES,
  MAX_LINE_QUANTITY,
  isSameLine,
  serializeBag,
  type BagLine,
} from "@/lib/bag";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export type BagActionResult = { ok: true } | { ok: false; error: string };

// Server Actions are public POST endpoints: every argument is untrusted.
const isReference = (slug: unknown, size: unknown) =>
  typeof slug === "string" &&
  typeof size === "string" &&
  slug.length > 0 &&
  slug.length <= 200 &&
  size.length > 0 &&
  size.length <= 50;

async function writeBag(lines: BagLine[]) {
  const store = await cookies();
  if (lines.length === 0) {
    store.delete(BAG_COOKIE);
    return;
  }
  // Readable by the browser so the header can show a count without making
  // every page dynamic. It holds no prices or personal data.
  store.set(BAG_COOKIE, serializeBag(lines), {
    path: "/",
    maxAge: BAG_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function stockError(stock: number) {
  if (stock <= 0) return "This size is now sold out.";
  return stock === 1
    ? "Only 1 piece is available in this size."
    : `Only ${stock} pieces are available in this size.`;
}

export async function addToBag(
  slug: string,
  size: string,
): Promise<BagActionResult> {
  if (!isReference(slug, size)) return { ok: false, error: "Invalid item." };

  const stock = await getSizeStock(slug, size);
  if (stock === undefined) {
    return { ok: false, error: "This piece is no longer available." };
  }

  const lines = await readBagLines();
  const existing = lines.find((line) => isSameLine(line, slug, size));
  const quantity = (existing?.quantity ?? 0) + 1;

  if (quantity > stock) return { ok: false, error: stockError(stock) };
  if (quantity > MAX_LINE_QUANTITY) {
    return {
      ok: false,
      error: `You can add up to ${MAX_LINE_QUANTITY} of each piece.`,
    };
  }
  if (!existing && lines.length >= MAX_BAG_LINES) {
    return { ok: false, error: "Your bag is full." };
  }

  await writeBag(
    existing
      ? lines.map((line) =>
          isSameLine(line, slug, size) ? { ...line, quantity } : line,
        )
      : [...lines, { slug, size, quantity }],
  );
  return { ok: true };
}

export async function updateBagQuantity(
  slug: string,
  size: string,
  quantity: number,
): Promise<BagActionResult> {
  if (
    !isReference(slug, size) ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_LINE_QUANTITY
  ) {
    return { ok: false, error: "Invalid quantity." };
  }

  const lines = await readBagLines();
  if (!lines.some((line) => isSameLine(line, slug, size))) {
    return { ok: false, error: "This piece is no longer in your bag." };
  }

  const stock = await getSizeStock(slug, size);
  if (stock === undefined) {
    return { ok: false, error: "This piece is no longer available." };
  }
  if (quantity > stock) return { ok: false, error: stockError(stock) };

  await writeBag(
    lines.map((line) =>
      isSameLine(line, slug, size) ? { ...line, quantity } : line,
    ),
  );
  return { ok: true };
}

export async function removeFromBag(
  slug: string,
  size: string,
): Promise<BagActionResult> {
  if (!isReference(slug, size)) return { ok: false, error: "Invalid item." };

  const lines = await readBagLines();
  await writeBag(lines.filter((line) => !isSameLine(line, slug, size)));
  return { ok: true };
}

// Tags these sessions in the Stripe Dashboard so this flow can be compared
// with future ones (for example an embedded checkout).
const CHECKOUT_INTEGRATION_ID = "atelier_bag_checkout_qzvmrtke";

// Shipping is complimentary and the store sells in USD only. Widen this
// list (and review tax obligations) before shipping internationally.
const SHIPPING_COUNTRIES = ["US"] as const;

const toCents = (dollars: number) => Math.round(dollars * 100);

/**
 * Snapshot the bag into a pending order, create a Stripe Checkout Session
 * for it and redirect there. Prices and stock come from the database, never
 * from the client. Stock is not reserved: it is decremented when payment
 * succeeds (see `markOrderPaid`).
 */
export async function startCheckout(): Promise<BagActionResult> {
  if (!isStripeConfigured()) {
    return { ok: false, error: "Checkout is temporarily unavailable." };
  }

  // Charge exactly what the bag page shows: quantities capped at live stock,
  // sold-out lines left out.
  const bag = await getBag();
  const available = bag.items.filter((item) => item.quantity > 0);
  if (available.length === 0) {
    return { ok: false, error: "There is nothing available in your bag." };
  }

  const items: NewOrderItem[] = available.map((item) => ({
    slug: item.product.slug,
    name: item.product.name,
    color: item.product.color,
    size: item.size,
    image: item.product.image,
    unitPrice: toCents(item.product.price),
    quantity: item.quantity,
  }));
  const subtotal = items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );

  const orderId = randomUUID();
  try {
    await createPendingOrder(orderId, items, subtotal);
  } catch (error) {
    console.error("Failed to create pending order", error);
    return { ok: false, error: "We couldn't start checkout. Please try again." };
  }

  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    .replace(/\/$/, "");

  const failed: BagActionResult = {
    ok: false,
    error: "We couldn't start checkout. Please try again.",
  };

  let session: Stripe.Checkout.Session;
  try {
    session = await getStripe().checkout.sessions.create(
      {
        mode: "payment",
        client_reference_id: orderId,
        metadata: { order_id: orderId },
        payment_intent_data: { metadata: { order_id: orderId } },
        integration_identifier: CHECKOUT_INTEGRATION_ID,
        line_items: items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            unit_amount: item.unitPrice,
            product_data: {
              name: item.name,
              description:
                item.size === "One size"
                  ? item.color
                  : `${item.color} · Size ${item.size}`,
              images: [item.image],
              metadata: { slug: item.slug, size: item.size },
            },
          },
        })),
        shipping_address_collection: {
          allowed_countries: [...SHIPPING_COUNTRIES],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              display_name: "Complimentary express delivery",
              fixed_amount: { amount: 0, currency: "usd" },
              delivery_estimate: {
                minimum: { unit: "business_day", value: 2 },
                maximum: { unit: "business_day", value: 4 },
              },
            },
          },
        ],
        phone_number_collection: { enabled: true },
        // Short-lived so abandoned sessions release their pending order.
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
        success_url: `${base}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/bag`,
      },
      { idempotencyKey: `checkout-session:${orderId}` },
    );
  } catch (error) {
    console.error("Failed to create Stripe Checkout Session", error);
    await discardOrder(orderId);
    return failed;
  }

  try {
    await attachCheckoutSession(orderId, session.id);
  } catch (error) {
    // Without the session ID the order can never be fulfilled, so close the
    // session before anyone can pay it.
    console.error("Failed to attach Checkout Session to order", error);
    try {
      await getStripe().checkout.sessions.expire(session.id);
    } catch (expireError) {
      console.error(`Failed to expire Checkout Session ${session.id}`, expireError);
    }
    await discardOrder(orderId);
    return failed;
  }

  if (!session.url) return failed;
  redirect(session.url);
}

/** Best-effort cleanup of an order whose checkout never started. */
async function discardOrder(orderId: string) {
  try {
    await deleteOrder(orderId);
  } catch (error) {
    console.error(`Failed to delete pending order ${orderId}`, error);
  }
}
