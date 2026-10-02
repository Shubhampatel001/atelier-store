import Image from "next/image";
import Link from "next/link";

import { Price } from "@/components/product/price";
import {
  getStockQuantity,
  getStockState,
  type Product,
} from "@/lib/catalog";

const sizes = "(width >= 80rem) 25vw, (width >= 48rem) 33vw, 50vw";

export function ProductCard({ product }: { product: Product }) {
  const state = getStockState(getStockQuantity(product));
  const soldOut = state === "out_of_stock";
  const badge = soldOut ? "Sold out" : product.badge;

  return (
    <article className="group relative flex flex-col gap-4">
      <div className="media aspect-product">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          className={`transition-[scale,opacity] duration-700 ease-luxe group-hover:scale-[1.03] ${
            soldOut ? "opacity-60" : ""
          }`}
        />
        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            alt=""
            fill
            sizes={sizes}
            className="opacity-0 transition-opacity duration-700 ease-luxe group-hover:opacity-100"
          />
        )}
        {badge && (
          <span
            className={`type-label absolute top-3 left-3 bg-paper px-2 py-1 ${
              badge === "Sale" ? "text-sale" : ""
            } ${soldOut ? "text-muted" : ""}`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <p className="type-label text-muted">{product.category}</p>
        <h3 className="text-body-sm">
          <Link
            href={`/products/${product.slug}`}
            className="after:absolute after:inset-0"
          >
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} />
        {state === "low_stock" ? (
          <p className="type-caption text-sale">Low stock</p>
        ) : (
          product.colors > 1 && (
            <p className="type-caption">{product.colors} colours</p>
          )
        )}
      </div>
    </article>
  );
}
