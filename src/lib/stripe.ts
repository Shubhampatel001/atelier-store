import "server-only";

import Stripe from "stripe";

// Lazily created so pages that never touch Stripe (and builds without the
// keys) keep working. Use a restricted key (`rk_…`) rather than the secret
// key: this integration only needs "Checkout Sessions: Write". Line items use
// inline `price_data`, so no Products or Prices permissions are required.
let client: Stripe | undefined;

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  client ??= new Stripe(key, {
    appInfo: { name: "Atelier Store" },
  });
  return client;
}
