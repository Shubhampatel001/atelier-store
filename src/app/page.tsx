import {
  CategorySplit,
  EditorialFeature,
  FeaturedCollections,
  Hero,
  NewArrivals,
  Services,
} from "@/components/home/sections";

// Featured categories and new arrivals come from the database.
export const revalidate = 60;

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <CategorySplit />
      <NewArrivals />
      <EditorialFeature />
      <FeaturedCollections />
      <Services />
    </main>
  );
}
