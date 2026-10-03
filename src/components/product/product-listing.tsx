import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: title }]} />

      <div className="shell pb-section">
        <PageHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          aside={
            products.length > 0 && (
              <p className="type-label text-muted">
                {products.length} {products.length === 1 ? "piece" : "pieces"}
              </p>
            )
          }
        />

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
