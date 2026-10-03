import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Price } from "@/components/product/price";
import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  getProduct,
  getProductSlugs,
  getRelatedProducts,
} from "@/db/queries/catalog";
import { categoryHref, getStockQuantity, getStockState } from "@/lib/catalog";

// Prerender every product at build time and refresh stock every minute.
// Products added later render on demand; unknown slugs 404 via notFound().
export const revalidate = 60;

export async function generateStaticParams() {
  return getProductSlugs();
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image, alt: product.name }],
    },
  };
}

const schemaAvailability = {
  in_stock: "https://schema.org/InStock",
  low_stock: "https://schema.org/LimitedAvailability",
  out_of_stock: "https://schema.org/OutOfStock",
} as const;

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const quantity = getStockQuantity(product);
  const related = await getRelatedProducts(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.description,
    image: product.gallery.map((image) => image.src),
    category: product.category,
    color: product.color,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: schemaAvailability[getStockState(quantity)],
    },
  };

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: product.category, href: categoryHref(product.categorySlug) },
          { label: product.name },
        ]}
      />

      <div className="lg:shell lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-block xl:gap-section">
        <ProductGallery images={product.gallery} />

        <div className="px-gutter pt-block lg:sticky lg:top-[calc(var(--header-height)+4rem)] lg:self-start lg:px-0 lg:pt-0">
          <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <Link
                  href={categoryHref(product.categorySlug)}
                  className="type-label link-quiet text-muted"
                >
                  {product.category}
                </Link>
                {product.badge && quantity > 0 && (
                  <span
                    className={`type-label ${
                      product.badge === "Sale" ? "text-sale" : ""
                    }`}
                  >
                    {product.badge}
                  </span>
                )}
              </div>
              <h1 className="type-heading">{product.name}</h1>
              <Price
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                className="text-lead"
              />
            </header>

            <p className="divider type-label pt-6">
              Colour: <span className="text-muted">{product.color}</span>
            </p>

            <PurchasePanel
              slug={product.slug}
              productName={product.name}
              sizes={product.sizes}
              stock={quantity}
            />

            <ul className="flex flex-col gap-2 text-body-sm text-muted">
              <li>Complimentary express shipping and returns</li>
              <li>Signature packaging on every order</li>
            </ul>

            <div className="divider">
              <ProductDisclosure title="Description" defaultOpen>
                <p>{product.description}</p>
                <p className="type-caption mt-4">Style {product.sku}</p>
              </ProductDisclosure>
              <ProductDisclosure title="Details & care">
                <ul className="flex list-disc flex-col gap-1.5 pl-4 marker:text-subtle">
                  {product.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </ProductDisclosure>
              <ProductDisclosure title="Shipping & returns">
                <p>
                  Complimentary express delivery in 2–4 business days. Returns
                  and exchanges are free within 30 days of delivery.
                </p>
              </ProductDisclosure>
            </div>
          </div>
        </div>
      </div>

      <section className="shell section">
        <div className="mb-block flex flex-col gap-3">
          <p className="type-label text-muted">Discover more</p>
          <h2 className="type-heading">You may also like</h2>
        </div>
        <div className="product-grid">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
      </section>
    </main>
  );
}

function ProductDisclosure({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-line">
      <summary className="type-label flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
        {title}
        <span
          aria-hidden="true"
          className="relative size-3 before:absolute before:inset-x-0 before:top-1/2 before:h-px before:bg-current after:absolute after:inset-y-0 after:left-1/2 after:w-px after:bg-current after:transition-transform group-open:after:scale-y-0"
        />
      </summary>
      <div className="pb-6 text-body-sm text-muted">{children}</div>
    </details>
  );
}
