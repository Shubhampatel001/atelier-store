import "server-only";

import { cookies } from "next/headers";

import { getProductsBySlugs } from "@/db/queries/catalog";
import { BAG_COOKIE, parseBag } from "@/lib/bag";
import type { Product } from "@/lib/catalog";

export type BagItem = {
  product: Product;
  size: string;
  /** Quantity shown and charged: the saved quantity capped at live stock. */
  quantity: number;
  /** Quantity the shopper asked for before the stock cap. */
  requested: number;
  /** Live stock for this size. */
  available: number;
  /** Line total in dollars. */
  total: number;
};

export async function readBagLines() {
  const store = await cookies();
  return parseBag(store.get(BAG_COOKIE)?.value);
}

/**
 * The shopper's bag resolved against the live catalogue. Lines for products
 * or sizes that no longer exist are dropped. Sold-out lines stay visible
 * (quantity 0) so the shopper can see what happened and remove them.
 */
export async function getBag() {
  const lines = await readBagLines();
  const products = await getProductsBySlugs(lines.map((line) => line.slug));
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  const items: BagItem[] = [];
  for (const line of lines) {
    const product = bySlug.get(line.slug);
    const size = product?.sizes.find((entry) => entry.label === line.size);
    if (!product || !size) continue;

    const quantity = Math.min(line.quantity, Math.max(size.stock, 0));
    items.push({
      product,
      size: line.size,
      quantity,
      requested: line.quantity,
      available: size.stock,
      total: product.price * quantity,
    });
  }

  return {
    items,
    count: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.total, 0),
    hasUnavailable: items.some((item) => item.quantity < item.requested),
  };
}
