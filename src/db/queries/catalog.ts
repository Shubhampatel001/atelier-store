import "server-only";

import { and, asc, eq, isNotNull, ne, sql } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { categories, products } from "@/db/schema";
import type { Category, Product } from "@/lib/catalog";

// Server-side catalogue reads. Rows are mapped to the `Product` shape the
// storefront components already use; prices are stored in cents.

const withCategoryAndStock = {
  category: { columns: { name: true } },
  stock: {
    columns: { size: true, quantity: true },
    orderBy: (stock, { asc }) => [asc(stock.position)],
  },
} satisfies NonNullable<
  Parameters<typeof db.query.products.findMany>[0]
>["with"];

type ProductRow = typeof products.$inferSelect & {
  category: { name: string };
  stock: { size: string; quantity: number }[];
};

const fromCents = (cents: number) => cents / 100;

function toProduct(row: ProductRow): Product {
  return {
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    category: row.category.name,
    price: fromCents(row.price),
    compareAtPrice:
      row.compareAtPrice === null ? undefined : fromCents(row.compareAtPrice),
    color: row.color,
    colors: row.colorCount,
    image: row.image,
    hoverImage: row.hoverImage ?? undefined,
    gallery: row.gallery,
    badge: row.badge ?? undefined,
    description: row.description,
    details: row.details,
    sizes: row.stock.map((entry) => ({
      label: entry.size,
      stock: entry.quantity,
    })),
  };
}

export const getProduct = cache(async (slug: string) => {
  const row = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: withCategoryAndStock,
  });
  return row ? toProduct(row) : undefined;
});

export const getNewArrivals = cache(async (limit: number = 8) => {
  const rows = await db.query.products.findMany({
    orderBy: (product, { asc, desc }) => [
      desc(product.createdAt),
      asc(product.id),
    ],
    limit,
    with: withCategoryAndStock,
  });
  return rows.map(toProduct);
});

export const getCategory = cache(async (slug: string) => {
  const [category] = await db
    .select({ id: categories.id, slug: categories.slug, name: categories.name })
    .from(categories)
    .where(eq(categories.slug, slug));
  return category;
});

/** Every product in a category, newest first. */
export const getCategoryProducts = cache(async (categoryId: number) => {
  const rows = await db.query.products.findMany({
    where: eq(products.categoryId, categoryId),
    orderBy: (product, { asc, desc }) => [
      desc(product.createdAt),
      asc(product.id),
    ],
    with: withCategoryAndStock,
  });
  return rows.map(toProduct);
});

export async function getCategorySlugs() {
  return db.select({ category: categories.slug }).from(categories);
}

/** Same-category products first, then the rest of the catalogue. */
export async function getRelatedProducts(product: Product, limit = 4) {
  // Plain identifiers on purpose: the relational query builder rewrites
  // column references in `orderBy` to the root `products` alias, which would
  // turn `categories.id` into `products.id` inside this subquery.
  const sameCategory = sql`(
    select "id" from "categories" where "name" = ${product.category}
  )`;
  const rows = await db.query.products.findMany({
    where: ne(products.slug, product.slug),
    orderBy: (row, { asc, desc }) => [
      desc(sql`${row.categoryId} = ${sameCategory}`),
      desc(row.createdAt),
      asc(row.id),
    ],
    limit,
    with: withCategoryAndStock,
  });
  return rows.map(toProduct);
}

export const getFeaturedCategories = cache(async (): Promise<Category[]> => {
  const rows = await db
    .select({
      slug: categories.slug,
      title: categories.name,
      image: categories.image,
    })
    .from(categories)
    .where(and(eq(categories.featured, true), isNotNull(categories.image)))
    .orderBy(asc(categories.sortOrder), asc(categories.id));
  return rows.map((row) => ({ ...row, image: row.image! }));
});

export async function getProductSlugs() {
  return db.select({ slug: products.slug }).from(products);
}
