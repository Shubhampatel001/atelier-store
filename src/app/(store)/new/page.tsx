import type { Metadata } from "next";

import { ProductListing } from "@/components/product/product-listing";
import { getNewArrivals } from "@/db/queries/catalog";

// Latest products from the database, refreshed every minute.
export const revalidate = 60;

const NEW_ARRIVALS_LIMIT = 24;

const description =
  "The latest ready-to-wear, leather goods and accessories, newly arrived from the atelier.";

export const metadata: Metadata = {
  title: "New arrivals",
  description,
  openGraph: { title: "New arrivals", description },
};

export default async function NewArrivalsPage() {
  const products = await getNewArrivals(NEW_ARRIVALS_LIMIT);

  return (
    <ProductListing
      eyebrow="Just in"
      title="New arrivals"
      description={description}
      products={products}
    />
  );
}
