// Replaces all catalogue data with src/db/seed-data.ts.
// Run with `npm run db:seed` (loads .env.local). Safe to re-run.

import { sql } from "drizzle-orm";

import { db } from "@/db";
import { categories, products, productStock } from "@/db/schema";
import { seedCategories, seedProducts } from "@/db/seed-data";

const toCents = (amount: number) => Math.round(amount * 100);

const categoryId = (name: string) =>
  sql`(select ${categories.id} from ${categories} where ${categories.name} = ${name})`;

const productId = (slug: string) =>
  sql`(select ${products.id} from ${products} where ${products.slug} = ${slug})`;

async function main() {
  const now = Date.now();

  // neon-http has no interactive transactions; a batch runs atomically.
  await db.batch([
    db.delete(productStock),
    db.delete(products),
    db.delete(categories),
    db.insert(categories).values(
      seedCategories.map((category, index) => ({
        ...category,
        sortOrder: index,
      })),
    ),
    db.insert(products).values(
      seedProducts.map((product, index) => ({
        categoryId: categoryId(product.category),
        slug: product.slug,
        sku: product.sku,
        name: product.name,
        description: product.description,
        price: toCents(product.price),
        compareAtPrice:
          product.compareAtPrice === undefined
            ? null
            : toCents(product.compareAtPrice),
        color: product.color,
        colorCount: product.colors,
        badge: product.badge ?? null,
        image: product.image,
        hoverImage: product.hoverImage ?? null,
        gallery: product.gallery,
        details: product.details,
        // Keep the seed order as the "new arrivals" order.
        createdAt: new Date(now - index * 60_000),
      })),
    ),
    db.insert(productStock).values(
      seedProducts.flatMap((product) =>
        product.sizes.map((size, position) => ({
          productId: productId(product.slug),
          size: size.label,
          quantity: size.stock,
          position,
        })),
      ),
    ),
  ]);

  const [counts] = await db.execute<{
    categories: number;
    products: number;
    stock: number;
  }>(sql`
    select
      (select count(*)::int from ${categories}) as categories,
      (select count(*)::int from ${products}) as products,
      (select count(*)::int from ${productStock}) as stock
  `).then((result) => result.rows);

  console.log(
    `Seeded ${counts.categories} categories, ${counts.products} products, ${counts.stock} stock rows.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
