import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductListing } from "@/components/product/product-listing";
import {
  getCategory,
  getCategoryProducts,
  getCategorySlugs,
} from "@/db/queries/catalog";

// Prerender every category at build time and refresh every minute.
// Categories added later render on demand; unknown slugs 404 via notFound().
export const revalidate = 60;

export async function generateStaticParams() {
  return getCategorySlugs();
}

export async function generateMetadata({
  params,
}: PageProps<"/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};

  const description = `Shop the Atelier ${category.name} collection.`;
  return {
    title: category.name,
    description,
    openGraph: { title: category.name, description },
  };
}

export default async function CategoryPage({
  params,
}: PageProps<"/[category]">) {
  const { category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const products = await getCategoryProducts(category.id);

  return (
    <ProductListing
      eyebrow="The collection"
      title={category.name}
      products={products}
    />
  );
}
