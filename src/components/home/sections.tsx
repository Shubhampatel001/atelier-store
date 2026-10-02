import Image from "next/image";
import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";
import { ProductCard } from "@/components/product/product-card";
import { getFeaturedCategories, getNewArrivals } from "@/db/queries/catalog";
import { collections, editorial, hero, services } from "@/lib/catalog";

function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-block flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-3">
        <p className="type-label text-muted">{eyebrow}</p>
        <h2 className="type-heading">{title}</h2>
      </div>
      {href && linkLabel && (
        <Link href={href} className="btn btn-ghost self-start sm:self-auto">
          {linkLabel}
          <ArrowRightIcon />
        </Link>
      )}
    </div>
  );
}

export function Hero() {
  return (
    <section className="media scrim h-[calc(100svh-var(--header-height)-2.25rem)] max-h-[60rem] min-h-[34rem] lg:h-[calc(100svh-var(--header-height)-5rem)]">
      <Image
        src={hero.image}
        alt={hero.alt}
        fill
        preload
        sizes="100vw"
        className="object-[center_25%]"
      />
      <div className="on-image absolute inset-x-0 bottom-0 z-10">
        <div className="shell flex flex-col items-start gap-5 pb-block">
          <p className="type-label">{hero.eyebrow}</p>
          <h1 className="type-display">{hero.title}</h1>
          <p className="max-w-prose-narrow text-lead text-muted">
            {hero.description}
          </p>
          <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/women" className="btn btn-primary">
              Shop women
            </Link>
            <Link href="/men" className="btn btn-secondary">
              Shop men
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export async function CategorySplit() {
  const categories = await getFeaturedCategories();

  return (
    <section aria-label="Shop by category" className="split mt-grid">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/${category.slug}`}
          className="group media scrim aspect-portrait md:aspect-[4/5]"
        >
          <Image
            src={category.image}
            alt=""
            fill
            sizes="(width >= 48rem) 50vw, 100vw"
            className="transition-[scale] duration-1000 ease-luxe group-hover:scale-[1.03]"
          />
          <div className="on-image absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-4 pb-block text-center">
            <h2 className="type-heading">{category.title}</h2>
            <span className="type-label link-quiet group-hover:decoration-current">
              Discover the collection
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}

export async function NewArrivals() {
  const newArrivals = await getNewArrivals();

  return (
    <section className="shell section">
      <SectionHeading
        eyebrow="Just in"
        title="New arrivals"
        href="/new"
        linkLabel="View all"
      />
      <div className="product-grid">
        {newArrivals.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}

export function EditorialFeature() {
  return (
    <section className="theme-inverse">
      <div className="grid md:grid-cols-2">
        <div className="media aspect-portrait md:aspect-auto md:min-h-[44rem]">
          <Image
            src={editorial.image}
            alt={editorial.alt}
            fill
            sizes="(width >= 48rem) 50vw, 100vw"
          />
        </div>
        <div className="flex items-center px-gutter py-section md:px-[calc(var(--spacing-gutter)*2)]">
          <div className="flex max-w-prose-narrow flex-col items-start gap-6">
            <p className="type-label text-muted">{editorial.eyebrow}</p>
            <h2 className="type-heading">{editorial.title}</h2>
            <p className="text-lead text-muted">{editorial.description}</p>
            <Link href="/craftsmanship" className="btn btn-secondary mt-2">
              Discover our craft
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedCollections() {
  return (
    <section className="section">
      <div className="shell">
        <SectionHeading
          eyebrow="Featured"
          title="The collections"
          href="/collections"
          linkLabel="All collections"
        />
      </div>
      {/* Swipeable rail on small screens, three-up grid from lg. */}
      <ul className="flex snap-x snap-mandatory scroll-px-gutter gap-grid overflow-x-auto px-gutter pb-4 [scrollbar-width:none] lg:mx-auto lg:grid lg:max-w-page lg:grid-cols-3 lg:overflow-visible lg:pb-0">
        {collections.map((collection) => (
          <li
            key={collection.slug}
            className="w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-auto"
          >
            <Link
              href={`/collections/${collection.slug}`}
              className="group flex flex-col gap-5"
            >
              <div className="media aspect-portrait">
                <Image
                  src={collection.image}
                  alt=""
                  fill
                  sizes="(width >= 64rem) 33vw, (width >= 40rem) 45vw, 78vw"
                  className="transition-[scale] duration-1000 ease-luxe group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="type-title">{collection.title}</h3>
                <p className="text-body-sm text-muted">
                  {collection.description}
                </p>
                <span className="type-label link-quiet mt-2 self-start group-hover:decoration-current">
                  Explore
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Services() {
  return (
    <section aria-label="Client services" className="shell pb-section">
      <ul className="divider grid gap-10 pt-block sm:grid-cols-3 sm:gap-grid">
        {services.map((service) => (
          <li
            key={service.title}
            className="flex flex-col items-center gap-3 text-center"
          >
            <h2 className="type-label">{service.title}</h2>
            <p className="max-w-[18rem] text-body-sm text-muted">
              {service.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
