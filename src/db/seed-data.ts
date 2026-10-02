// Initial catalogue loaded by `npm run db:seed` (src/db/seed.ts).
// Prices are in whole dollars here; the seed stores them in cents.
// `category` refers to a category by name.

import { type Product, type SizeOption, unsplash } from "@/lib/catalog";

export const seedCategories = [
  {
    slug: "women",
    name: "Women",
    image: unsplash("1485968579580-b6d095142e6e"),
    featured: true,
  },
  {
    slug: "men",
    name: "Men",
    image: unsplash("1617137968427-85924c800a22"),
    featured: true,
  },
  { slug: "bags", name: "Bags" },
  { slug: "shoes", name: "Shoes" },
  { slug: "jewellery", name: "Jewellery" },
];

const sizes = (labels: string[], stock: number[]): SizeOption[] =>
  labels.map((label, index) => ({ label, stock: stock[index] ?? 0 }));

export const seedProducts: Product[] = [
  {
    slug: "tailored-wool-trousers",
    sku: "AT-26W-0142",
    name: "Tailored wool trousers",
    category: "Women",
    price: 980,
    color: "Blush",
    colors: 3,
    image: unsplash("1594633312681-425c7b97ccd1"),
    gallery: [
      {
        src: unsplash("1594633312681-425c7b97ccd1"),
        alt: "Tailored wool trousers in blush, front view",
      },
      {
        src: unsplash("1594633312681-425c7b97ccd1"),
        alt: "Close-up of the patch pockets and waistband",
        focus: "50% 22%",
        zoom: 2,
      },
      {
        src: unsplash("1594633312681-425c7b97ccd1"),
        alt: "Close-up of the gathered ankle cuff",
        focus: "50% 82%",
        zoom: 2,
      },
    ],
    badge: "New",
    description:
      "A relaxed tailored trouser cut from fluid virgin wool, with patch pockets, a high waist and softly gathered cuffs that sit just above the ankle.",
    details: [
      "100% virgin wool, viscose lining",
      "High waist with concealed hook-and-zip fastening",
      "Front patch pockets",
      "Elasticated ankle cuffs",
      "Made in Italy",
      "Dry clean only",
    ],
    sizes: sizes(
      ["IT 36", "IT 38", "IT 40", "IT 42", "IT 44", "IT 46"],
      [2, 5, 0, 4, 1, 0],
    ),
  },
  {
    slug: "leather-satchel",
    sku: "AT-26B-0318",
    name: "Leather satchel",
    category: "Bags",
    price: 3100,
    color: "Dove grey",
    colors: 2,
    image: unsplash("1605733513597-a8f8341084e6"),
    gallery: [
      {
        src: unsplash("1605733513597-a8f8341084e6"),
        alt: "Leather satchel in dove grey",
      },
      {
        src: unsplash("1605733513597-a8f8341084e6"),
        alt: "Close-up of the buckle straps and gold hardware",
        focus: "55% 62%",
        zoom: 2,
      },
      {
        src: unsplash("1605733513597-a8f8341084e6"),
        alt: "Close-up of the top handle",
        focus: "50% 28%",
        zoom: 2.2,
      },
    ],
    badge: "New",
    description:
      "A structured satchel in pebbled calf leather, finished with twin buckle straps, a rolled top handle and a detachable shoulder strap.",
    details: [
      "Pebbled calf leather, cotton-linen lining",
      "Gold-toned hardware",
      "Twin buckle closure, interior zip pocket",
      "Detachable, adjustable shoulder strap",
      "W 28 × H 21 × D 10 cm",
      "Made in Italy",
    ],
    sizes: sizes(["One size"], [2]),
  },
  {
    slug: "wool-suit-jacket",
    sku: "AT-26M-0207",
    name: "Wool suit jacket",
    category: "Men",
    price: 2850,
    color: "Midnight navy",
    colors: 1,
    image: unsplash("1507679799987-c73779587ccf"),
    gallery: [
      {
        src: unsplash("1507679799987-c73779587ccf"),
        alt: "Wool suit jacket in midnight navy",
      },
      {
        src: unsplash("1617137968427-85924c800a22"),
        alt: "The suit jacket styled with a white shirt",
        focus: "50% 30%",
      },
      {
        src: unsplash("1507679799987-c73779587ccf"),
        alt: "Close-up of the buttoning and cuff",
        focus: "62% 55%",
        zoom: 2,
      },
    ],
    description:
      "A single-breasted jacket in fine Super 120s wool, with a soft natural shoulder, notch lapels and a lightly fitted waist.",
    details: [
      "100% wool Super 120s, cupro lining",
      "Half-canvas construction",
      "Two-button fastening, notch lapels",
      "Working buttonholes at the cuff",
      "Made in Italy",
      "Dry clean only",
    ],
    sizes: sizes(
      ["IT 46", "IT 48", "IT 50", "IT 52", "IT 54", "IT 56"],
      [3, 6, 8, 4, 0, 2],
    ),
  },
  {
    slug: "printed-satin-pump",
    sku: "AT-26S-0455",
    name: "Printed satin pump",
    category: "Shoes",
    price: 950,
    color: "Azure floral",
    colors: 2,
    image: unsplash("1543163521-1bf539c55dd2"),
    gallery: [
      {
        src: unsplash("1543163521-1bf539c55dd2"),
        alt: "Printed satin pumps in azure floral",
      },
      {
        src: unsplash("1543163521-1bf539c55dd2"),
        alt: "Close-up of the floral print and pointed toe",
        focus: "62% 80%",
        zoom: 2,
      },
    ],
    description:
      "A pointed-toe pump wrapped in floral-printed silk satin and set on a slender 100mm stiletto heel.",
    details: [
      "Silk satin upper, leather lining and sole",
      "100mm stiletto heel",
      "Pointed toe",
      "Made in Italy",
    ],
    sizes: sizes(
      ["EU 36", "EU 37", "EU 38", "EU 39", "EU 40", "EU 41"],
      [0, 3, 5, 2, 1, 0],
    ),
  },
  {
    slug: "leather-biker-jacket",
    sku: "AT-26M-0560",
    name: "Leather biker jacket",
    category: "Men",
    price: 4200,
    compareAtPrice: 5200,
    color: "Black",
    colors: 1,
    image: unsplash("1551028719-00167b16eac5"),
    hoverImage: unsplash("1520975954732-35dd22299614"),
    gallery: [
      {
        src: unsplash("1551028719-00167b16eac5"),
        alt: "Leather biker jacket in black",
      },
      {
        src: unsplash("1520975954732-35dd22299614"),
        alt: "The biker jacket worn open",
        focus: "50% 30%",
      },
      {
        src: unsplash("1551028719-00167b16eac5"),
        alt: "Close-up of the zips and lapel snaps",
        focus: "40% 45%",
        zoom: 2,
      },
    ],
    badge: "Sale",
    description:
      "A classic biker silhouette in supple lambskin, with an asymmetric zip, snap-down lapels and zipped cuffs.",
    details: [
      "100% lambskin leather, cupro lining",
      "Asymmetric front zip",
      "Three zip pockets",
      "Zipped cuffs, belted hem",
      "Made in Italy",
      "Specialist leather clean only",
    ],
    sizes: sizes(["IT 46", "IT 48", "IT 50", "IT 52", "IT 54"], [1, 0, 2, 0, 0]),
  },
  {
    slug: "fringed-knit-poncho",
    sku: "AT-26W-0621",
    name: "Fringed knit poncho",
    category: "Women",
    price: 1780,
    color: "Ecru",
    colors: 2,
    image: unsplash("1434389677669-e08b4cac3105"),
    gallery: [
      {
        src: unsplash("1434389677669-e08b4cac3105"),
        alt: "Fringed knit poncho in ecru",
      },
      {
        src: unsplash("1434389677669-e08b4cac3105"),
        alt: "Close-up of the open-knit texture and fringe",
        focus: "50% 80%",
        zoom: 2,
      },
    ],
    description:
      "An open-knit poncho in a soft cashmere and silk blend, finished with a deep V-neck and a hand-knotted fringe.",
    details: [
      "70% cashmere, 30% silk",
      "Open crochet-style knit",
      "Hand-knotted fringe",
      "Made in Italy",
      "Hand wash cold, dry flat",
    ],
    sizes: sizes(["One size"], [7]),
  },
  {
    slug: "crystal-drop-earrings",
    sku: "AT-26J-0730",
    name: "Crystal drop earrings",
    category: "Jewellery",
    price: 1350,
    color: "Silver / sapphire",
    colors: 1,
    image: unsplash("1535632066927-ab7c9ab60908"),
    gallery: [
      {
        src: unsplash("1535632066927-ab7c9ab60908"),
        alt: "Crystal drop earrings with sapphire-blue stones",
      },
      {
        src: unsplash("1535632066927-ab7c9ab60908"),
        alt: "Close-up of the pear-cut centre stone",
        focus: "62% 38%",
        zoom: 2.2,
      },
    ],
    description:
      "Statement drop earrings set with baguette-cut crystals around a pear-shaped sapphire-blue centre stone.",
    details: [
      "Palladium-plated brass",
      "Glass crystals",
      "Post-back fastening",
      "Length 6 cm",
      "Made in Italy",
    ],
    sizes: sizes(["One size"], [0]),
  },
  {
    slug: "suede-bomber-jacket",
    sku: "AT-26M-0814",
    name: "Suede bomber jacket",
    category: "Men",
    price: 2650,
    color: "Terracotta",
    colors: 2,
    image: unsplash("1591047139829-d91aecb6caea"),
    gallery: [
      {
        src: unsplash("1591047139829-d91aecb6caea"),
        alt: "Suede bomber jacket in terracotta",
      },
      {
        src: unsplash("1591047139829-d91aecb6caea"),
        alt: "Close-up of the ribbed collar and zip",
        focus: "50% 22%",
        zoom: 2,
      },
    ],
    description:
      "A lightweight bomber in brushed goat suede, with ribbed trims, a two-way zip and a utility sleeve pocket.",
    details: [
      "100% goat suede, cupro lining",
      "Ribbed collar, cuffs and hem",
      "Two-way front zip",
      "Zipped sleeve pocket",
      "Made in Italy",
      "Specialist leather clean only",
    ],
    sizes: sizes(["S", "M", "L", "XL"], [4, 6, 3, 2]),
  },
];
