import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/catalog";

/** Listing page body: breadcrumb, page heading and product grid. */
export function ProductListing({
  eyebrow,
  title,
  description,
  products,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  products: Product[];
}) {
  return (
    <main className="flex-1">
      <nav aria-label="Breadcrumb" className="shell py-4 lg:py-6">
        <ol className="type-label flex flex-wrap items-center gap-2 text-muted">
          <li>
            <Link href="/" className="link-quiet">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {title}
          </li>
        </ol>
      </nav>

      <div className="shell pb-section">
        <header className="mb-block flex flex-col gap-4 pt-block sm:flex-row sm:items-end sm:justify-between">
          <div className="flex max-w-prose-narrow flex-col gap-3">
            <p className="type-label text-muted">{eyebrow}</p>
            <h1 className="type-heading">{title}</h1>
            {description && (
              <p className="text-body-sm text-muted">{description}</p>
            )}
          </div>
          {products.length > 0 && (
            <p className="type-label text-muted">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </p>
          )}
        </header>

        {products.length > 0 ? (
          <div className="product-grid divider pt-block">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="divider flex flex-col items-center gap-6 py-section text-center">
            <p className="type-title">Nothing here just yet</p>
            <p className="max-w-prose-narrow text-body-sm text-muted">
              New pieces are on their way. Explore the current collections in
              the meantime.
            </p>
            <Link href="/" className="btn btn-ghost">
              Continue shopping
              <ArrowRightIcon />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
