import type { Metadata } from "next";
import Link from "next/link";

import { BagLineItem } from "@/components/bag/bag-line-item";
import { CheckoutButton } from "@/components/bag/checkout-button";
import { ArrowRightIcon } from "@/components/icons";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { getBag } from "@/db/queries/bag";
import { getNewArrivals } from "@/db/queries/catalog";
import { formatPrice, services } from "@/lib/catalog";
import { isStripeConfigured } from "@/lib/stripe";

// Reads the bag cookie, so this page always renders per request.
export const metadata: Metadata = {
  title: "Shopping bag",
  robots: { index: false },
};

export default async function BagPage() {
  const bag = await getBag();
  const empty = bag.items.length === 0;

  return (
    <main className="flex-1">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Shopping bag" }]}
      />

      <div className="shell pb-section">
        <PageHeader
          eyebrow="Your selection"
          title="Shopping bag"
          aside={
            !empty && (
              <p className="type-label text-muted">
                {bag.count} {bag.count === 1 ? "piece" : "pieces"}
              </p>
            )
          }
        />

        {empty ? (
          <div className="divider flex flex-col items-center gap-6 py-section text-center">
            <p className="type-title">Your bag is empty</p>
            <p className="max-w-prose-narrow text-body-sm text-muted">
              Pieces you add to your bag will appear here. Discover the latest
              arrivals or explore the collections.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href="/new" className="btn btn-primary">
                Shop new arrivals
              </Link>
              <Link href="/" className="btn btn-secondary">
                Continue shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="divider grid gap-block lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] xl:gap-section">
            <ul aria-label="Items in your bag">
              {bag.items.map((item) => (
                <BagLineItem
                  key={`${item.product.slug}:${item.size}`}
                  slug={item.product.slug}
                  name={item.product.name}
                  category={item.product.category}
                  color={item.product.color}
                  image={item.product.image}
                  size={item.product.sizes.length > 1 ? item.size : undefined}
                  sizeKey={item.size}
                  quantity={item.quantity}
                  requested={item.requested}
                  available={item.available}
                  price={item.product.price}
                  compareAtPrice={item.product.compareAtPrice}
                />
              ))}
            </ul>

            <OrderSummary
              subtotal={bag.subtotal}
              canCheckout={bag.count > 0}
              hasUnavailable={bag.hasUnavailable}
              checkoutAvailable={isStripeConfigured()}
            />
          </div>
        )}
      </div>

      {empty && <BagSuggestions />}
    </main>
  );
}

function OrderSummary({
  subtotal,
  canCheckout,
  hasUnavailable,
  checkoutAvailable,
}: {
  subtotal: number;
  canCheckout: boolean;
  hasUnavailable: boolean;
  checkoutAvailable: boolean;
}) {
  return (
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
            <dd className="type-price">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Shipping</dt>
            <dd>Complimentary</dd>
          </div>
          <div className="rule-strong mt-3 flex items-baseline justify-between gap-4 pt-5">
            <dt className="type-label">Total</dt>
            <dd className="type-price text-lead">{formatPrice(subtotal)}</dd>
          </div>
        </dl>

        {hasUnavailable && (
          <p role="status" className="text-body-sm text-sale">
            Some pieces in your bag have limited availability. Quantities have
            been adjusted.
          </p>
        )}

        <div className="flex flex-col gap-3">
          <CheckoutButton disabled={!canCheckout || !checkoutAvailable} />
          <p id="checkout-note" className="type-caption text-center">
            {!checkoutAvailable
              ? "Checkout is temporarily unavailable."
              : canCheckout
                ? "You'll complete your purchase securely with Stripe."
                : "Remove sold-out pieces to continue."}
          </p>
        </div>

        <Link href="/" className="btn btn-ghost self-center">
          Continue shopping
          <ArrowRightIcon />
        </Link>
      </div>

      <ul className="mt-6 flex flex-col gap-4 px-6 sm:px-8">
        {services.slice(0, 2).map((service) => (
          <li key={service.title} className="flex flex-col gap-1">
            <h3 className="type-label">{service.title}</h3>
            <p className="text-body-sm text-muted">{service.description}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}

async function BagSuggestions() {
  const products = await getNewArrivals(4);
  if (products.length === 0) return null;

  return (
    <section className="shell pb-section">
      <div className="mb-block flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3">
          <p className="type-label text-muted">Just in</p>
          <h2 className="type-heading">New arrivals</h2>
        </div>
        <Link href="/new" className="btn btn-ghost self-start sm:self-auto">
          View all
          <ArrowRightIcon />
        </Link>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
