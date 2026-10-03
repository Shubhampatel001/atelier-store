import type Stripe from "stripe";

import { closePendingOrder } from "@/db/queries/orders";
import { fulfillCheckout } from "@/lib/checkout";
import { getStripe } from "@/lib/stripe";

// Stripe webhook endpoint. Locally:
//   stripe listen --forward-to localhost:3000/api/webhooks/stripe
// and put the printed `whsec_…` in STRIPE_WEBHOOK_SECRET.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return new Response("Webhook not configured", { status: 400 });
  }

  // Signature verification needs the exact raw body.
  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      // Card payments complete here; delayed methods (bank debits) complete
      // later with `async_payment_succeeded`. `fulfillCheckout` checks
      // `payment_status` and only fulfils paid sessions, exactly once.
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await fulfillCheckout(event.data.object.id);
        break;
      case "checkout.session.async_payment_failed":
        await closePendingOrder(
          event.data.object.id,
          orderIdOf(event.data.object),
          "failed",
        );
        break;
      case "checkout.session.expired":
        await closePendingOrder(
          event.data.object.id,
          orderIdOf(event.data.object),
          "expired",
        );
        break;
    }
  } catch (error) {
    // A 5xx makes Stripe retry with backoff; fulfilment is idempotent.
    console.error(`Stripe webhook ${event.id} (${event.type}) failed`, error);
    return new Response("Webhook handler failed", { status: 500 });
  }

  return new Response(null, { status: 200 });
}

/** The order a session was created for, as set by `startCheckout`. */
function orderIdOf(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;
  return orderId && session.client_reference_id === orderId ? orderId : null;
}
