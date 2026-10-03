"use client";

import { useActionState } from "react";

import {
  startCheckout,
  type BagActionResult,
} from "@/app/(store)/bag/actions";

// Posts to `startCheckout`, which redirects to Stripe on success. Errors
// (stock changed, Stripe unavailable) come back as state and show inline.
export function CheckoutButton({ disabled }: { disabled?: boolean }) {
  const [state, action, pending] = useActionState<
    BagActionResult | null,
    FormData
  >(() => startCheckout(), null);

  return (
    <form action={action} className="flex flex-col gap-3">
      <button
        type="submit"
        className="btn btn-primary btn-lg w-full"
        disabled={disabled || pending}
        aria-describedby="checkout-note"
      >
        {pending ? "Redirecting…" : "Proceed to checkout"}
      </button>
      {state && !state.ok && (
        <p role="alert" className="text-center text-body-sm text-sale">
          {state.error}
        </p>
      )}
    </form>
  );
}
