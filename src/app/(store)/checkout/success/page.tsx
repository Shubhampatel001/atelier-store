import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ArrowRightIcon } from "@/components/icons";
import { getOrderBySession } from "@/db/queries/orders";
import { formatPrice } from "@/lib/catalog";
import { isCheckoutSessionId } from "@/lib/checkout";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false },
};

const fromCents = (cents: number) => cents / 100;

export default async function CheckoutSuccessPage({
  searchParams,
}: PageProps<"/checkout/success">) {
  const { session_id: sessionId } = await searchParams;
  if (!isCheckoutSessionId(sessionId) || !isStripeConfigured()) notFound();

  const session = await getStripe()
    .checkout.sessions.retrieve(sessionId)
    .catch(() => null);
  if (!session) notFound();
  if (session.status !== "complete") redirect("/bag");

  const order = await getOrderBySession(session.id);
  if (!order) notFound();

  const processing = session.payment_status === "unpaid";
  const needsReview = order.status === "needs_review";
  const reference = order.id.slice(0, 8).toUpperCase();
  const email = session.customer_details?.email ?? order.email;
  const address = order.shippingAddress;
  const total = session.amount_total ?? order.subtotal;

  return (
    <main className="flex-1">
      <div className="shell pb-section">
        <header className="flex flex-col items-center gap-4 py-section text-center">
          <p className="type-label text-muted">
            {processing ? "Payment processing" : "Order confirmed"}
          </p>
          <h1 className="type-heading">Thank you</h1>
          <p className="max-w-prose-narrow text-body text-muted">
            {processing
              ? "Your payment is being processed. We'll confirm your order as soon as it clears."
              : "Your order has been received and is being prepared in our signature packaging."}
            {email && (
              <>
                {" "}
                Updates will be sent to{" "}
                <span className="text-ink">{email}</span>.
              </>
            )}
          </p>
          <p className="type-label">Order {reference}</p>
        </header>

        {needsReview && (
          <p
            role="status"
            className="mx-auto mb-block max-w-prose-narrow border border-line p-6 text-center text-body-sm text-sale"
          >
            One of your pieces sold out moments before your order was placed.
            Client services will contact you shortly to arrange an alternative
            or a refund.
          </p>
        )}

        <div className="divider grid gap-block lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] xl:gap-section">
          <section aria-labelledby="order-items">
            <h2 id="order-items" className="sr-only">
              Items in your order
            </h2>
            <ul>
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[6rem_minmax(0,1fr)] gap-5 border-b border-line py-6 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6"
                >
                  <div className="media aspect-product">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="(width >= 40rem) 8rem, 6rem"
                    />
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="flex min-w-0 flex-col gap-1">
                      <h3 className="text-body-sm">
                        <Link
                          href={`/products/${item.slug}`}
                          className="link-quiet"
                        >
                          {item.name}
                        </Link>
                      </h3>
                      <p className="text-body-sm text-muted">
                        {item.color}
                        {item.size !== "One size" && <> · Size {item.size}</>}
                      </p>
                      <p className="type-caption">Quantity {item.quantity}</p>
                    </div>
                    <p className="type-price shrink-0">
                      {formatPrice(fromCents(item.unitPrice * item.quantity))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <aside
            aria-labelledby="order-summary"
            className="lg:sticky lg:top-[calc(var(--header-height)+4rem)] lg:self-start lg:pt-6"
          >
            <div className="flex flex-col gap-6 bg-surface p-6 sm:p-8">
              <h2 id="order-summary" className="type-label">
                Order summary
              </h2>
              <dl className="flex flex-col gap-3 text-body-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="type-price">
                    {formatPrice(fromCents(order.subtotal))}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Shipping</dt>
                  <dd>Complimentary</dd>
                </div>
                <div className="rule-strong mt-3 flex items-baseline justify-between gap-4 pt-5">
                  <dt className="type-label">Total</dt>
                  <dd className="type-price text-lead">
                    {formatPrice(fromCents(total))}
                  </dd>
                </div>
              </dl>

              {address && (
                <div className="divider flex flex-col gap-2 pt-6">
                  <h3 className="type-label">Delivering to</h3>
                  <address className="text-body-sm text-muted not-italic">
                    {[
                      address.name,
                      address.line1,
                      address.line2,
                      [address.city, address.state, address.postalCode]
                        .filter(Boolean)
                        .join(", "),
                      address.country,
                    ]
                      .filter(Boolean)
                      .map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                  </address>
                  <p className="type-caption">
                    Complimentary express delivery in 2–4 business days.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link href="/new" className="btn btn-primary flex-1">
                Shop new arrivals
              </Link>
              <Link href="/" className="btn btn-secondary flex-1">
                Continue shopping
                <ArrowRightIcon />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
