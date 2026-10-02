// Catalogue types, pure stock/price helpers and static marketing content.
// Products, categories and stock live in Postgres — see src/db/queries/catalog.ts.
// Must stay free of `@/db` imports: client components import this module.
// Images are served from Unsplash (allowed in next.config.ts).

export type GalleryImage = {
  src: string;
  alt: string;
  /** CSS object-position, also used as the zoom origin for detail crops. */
  focus?: string;
  /** Scale factor for close-up detail shots cropped from the main image. */
  zoom?: number;
};

export type SizeOption = {
  label: string;
  stock: number;
};

export type Product = {
  slug: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  color: string;
  colors: number;
  image: string;
  hoverImage?: string;
  gallery: GalleryImage[];
  badge?: string;
  description: string;
  details: string[];
  /** Per-size stock; products without sizes have a single "One size" entry. */
  sizes: SizeOption[];
};

export type StockState = "in_stock" | "low_stock" | "out_of_stock";

/** Products at or below this quantity are flagged as low stock. */
export const LOW_STOCK_THRESHOLD = 3;

export type Collection = {
  slug: string;
  title: string;
  description: string;
  image: string;
};

export type Category = {
  slug: string;
  title: string;
  image: string;
};

export const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2000&q=80`;

export const navigation = [
  { label: "New In", href: "/new" },
  { label: "Women", href: "/women" },
  { label: "Men", href: "/men" },
  { label: "Bags", href: "/bags" },
  { label: "Shoes", href: "/shoes" },
  { label: "Jewellery", href: "/jewellery" },
  { label: "Gifts", href: "/gifts" },
];

export const hero = {
  eyebrow: "Autumn – Winter 2026",
  title: "Quiet Form",
  description:
    "Sculpted tailoring, supple leather and soft knits, cut for the season ahead.",
  image: unsplash("1539109136881-3be0616acf4b"),
  alt: "Woman in a pale blue tailored coat on a historic city square",
};

export function getStockQuantity(product: Product) {
  return product.sizes.reduce((total, size) => total + size.stock, 0);
}

export function getStockState(quantity: number): StockState {
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
}

export const categoryHref = (category: string) => `/${category.toLowerCase()}`;

export const collections: Collection[] = [
  {
    slug: "outerwear",
    title: "The Outerwear Edit",
    description: "Sculpted coats in wool, cashmere and shearling.",
    image: unsplash("1483985988355-763728e1935b"),
  },
  {
    slug: "leather-goods",
    title: "Leather Goods",
    description: "Hand-finished bags and small leather goods.",
    image: unsplash("1590874103328-eac38a683ce7"),
  },
  {
    slug: "knitwear",
    title: "Knitwear",
    description: "Soft cashmere and merino in a quiet, natural palette.",
    image: unsplash("1558769132-cb1aea458c5e"),
  },
];

export const editorial = {
  eyebrow: "The Atelier",
  title: "Made slowly, made to last",
  description:
    "Every piece begins in our workshop, where artisans cut, stitch and finish by hand using materials chosen to age beautifully.",
  image: unsplash("1445205170230-053b83016050"),
  alt: "Rail of tailored garments in a warmly lit boutique",
};

export const services = [
  {
    title: "Complimentary shipping",
    description: "Free express delivery and returns on every order.",
  },
  {
    title: "Signature packaging",
    description: "Each order arrives wrapped in our signature boxes.",
  },
  {
    title: "Book an appointment",
    description: "Shop in store or online with a personal advisor.",
  },
];

export const footerLinks = [
  {
    title: "Client services",
    links: ["Contact us", "Shipping", "Returns", "FAQ", "Track an order"],
  },
  {
    title: "The house",
    links: ["Our story", "Craftsmanship", "Sustainability", "Careers"],
  },
  {
    title: "Legal",
    links: ["Terms of sale", "Privacy policy", "Cookie settings"],
  },
];

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
