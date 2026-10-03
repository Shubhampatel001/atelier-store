import "server-only";

import { revalidatePath } from "next/cache";
import type Stripe from "stripe";

import { markOrderPaid } from "@/db/queries/orders";
import { getStripe } from "@/lib/stripe";

/** Checkout Session IDs are opaque, but always carry this prefix. */
export const isCheckoutSessionId = (value: unknown): value is string =>
  typeof value === "string" && /^cs_(test|live)_[A-Za-z0-9]+$/.test(value);

/**
 * Fulfils a Checkout Session. Safe to call any number of times, including
 * concurrently: the webhook and the success page both call it, and only the
 * first call that sees a paid session marks the order paid and moves stock.
 *
 * Always re-reads the session from Stripe rather than trusting a payload.
 */
export async function fulfillCheckout(sessionId: string) {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  if (session.payment_status === "unpaid") return session;

  const orderId = session.metadata?.order_id;
  if (!orderId || session.client_reference_id !== orderId) {
    throw new Error(`Checkout Session ${session.id} has no matching order.`);
  }

  const slugs = await markOrderPaid({
    orderId,
    sessionId: session.id,
    paymentIntentId: idOf(session.payment_intent),
    email: session.customer_details?.email ?? null,
    total: session.amount_total,
    shippingAddress: shippingAddressOf(session),
  });

  // Stock changed: refresh the ISR pages that show it.
  if (slugs && slugs.length > 0) {
    revalidatePath("/", "layout");
  }
  return session;
}

const idOf = (value: string | { id: string } | null) =>
  typeof value === "string" ? value : (value?.id ?? null);

function shippingAddressOf(session: Stripe.Checkout.Session) {
  const shipping = session.collected_information?.shipping_details;
  if (!shipping) return null;
  return {
    name: shipping.name,
    line1: shipping.address.line1,
    line2: shipping.address.line2,
    city: shipping.address.city,
    state: shipping.address.state,
    postalCode: shipping.address.postal_code,
    country: shipping.address.country,
  };
}
