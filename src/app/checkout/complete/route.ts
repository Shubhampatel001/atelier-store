import { NextResponse, type NextRequest } from "next/server";

import { BAG_COOKIE } from "@/lib/bag";
import { fulfillCheckout, isCheckoutSessionId } from "@/lib/checkout";

// Stripe's `success_url`. A Route Handler rather than a page because it
// needs to clear the bag cookie and revalidate stock, which pages cannot do
// while rendering. The webhook is the source of truth for fulfilment; this
// just gets there first when the shopper is present.
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!isCheckoutSessionId(sessionId)) {
    return NextResponse.redirect(new URL("/bag", request.url));
  }

  let complete = false;
  try {
    const session = await fulfillCheckout(sessionId);
    complete = session.status === "complete";
  } catch (error) {
    console.error(`Checkout completion for ${sessionId} failed`, error);
  }

  const target = new URL("/checkout/success", request.url);
  target.searchParams.set("session_id", sessionId);
  const response = NextResponse.redirect(target, 303);
  if (complete) response.cookies.delete(BAG_COOKIE);
  return response;
}
