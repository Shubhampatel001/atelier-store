"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

import {
  removeFromBag,
  updateBagQuantity,
  type BagActionResult,
} from "@/app/(store)/bag/actions";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { notifyBagChange } from "@/components/layout/bag-link";
import { Price } from "@/components/product/price";
import { StockStatus } from "@/components/product/stock-status";
import { MAX_LINE_QUANTITY } from "@/lib/bag";
import { LOW_STOCK_THRESHOLD, formatPrice } from "@/lib/catalog";

export type BagLineItemProps = {
  slug: string;
  name: string;
  category: string;
  color: string;
  image: string;
  /** Omitted for one-size products. */
  size?: string;
  sizeKey: string;
  quantity: number;
  requested: number;
  available: number;
  price: number;
  compareAtPrice?: number;
};

export function BagLineItem({
  slug,
  name,
  category,
  color,
  image,
  size,
  sizeKey,
  quantity,
  requested,
  available,
  price,
  compareAtPrice,
}: BagLineItemProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const href = `/products/${slug}`;
  const soldOut = available <= 0;
  const reduced = !soldOut && quantity < requested;
  const max = Math.min(available, MAX_LINE_QUANTITY);

  // Setting the bag cookie re-renders this page with fresh props, so the
  // quantity and totals update in the same round trip as the action.
  const run = (action: () => Promise<BagActionResult>) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.ok) setError(result.error);
      } catch {
        setError("Something went wrong. Please try again.");
      }
      notifyBagChange();
    });
  };

  return (
    <li
      aria-busy={pending}
      className={`grid grid-cols-[6rem_minmax(0,1fr)] gap-5 border-b border-line py-6 transition-opacity sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6 ${
        pending ? "opacity-60" : ""
      }`}
    >
      <Link href={href} tabIndex={-1} aria-hidden="true">
        <div className="media aspect-product">
          <Image
            src={image}
            alt=""
            fill
            sizes="(width >= 40rem) 8rem, 6rem"
            className={soldOut ? "opacity-60" : ""}
          />
        </div>
      </Link>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="type-label text-muted">{category}</p>
            <h2 className="text-body-sm">
              <Link href={href} className="link-quiet">
                {name}
              </Link>
            </h2>
            <p className="text-body-sm text-muted">
              {color}
              {size && <> · Size {size}</>}
            </p>
            {quantity > 1 && (
              <p className="type-caption tabular-nums">
                {formatPrice(price)} each
              </p>
            )}
          </div>
          <Price
            price={price * Math.max(quantity, 1)}
            compareAtPrice={
              compareAtPrice === undefined
                ? undefined
                : compareAtPrice * Math.max(quantity, 1)
            }
            className={`shrink-0 sm:justify-end sm:text-right ${
              soldOut ? "text-muted line-through" : ""
            }`}
          />
        </div>

        {(soldOut || available <= LOW_STOCK_THRESHOLD) && (
          <StockStatus quantity={available} />
        )}
        {reduced && (
          <p className="text-body-sm text-sale">
            Quantity reduced to {quantity} to match available stock.
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
          {soldOut ? (
            <p className="text-body-sm text-muted">
              No longer available in this size.
            </p>
          ) : (
            <div className="flex items-center border border-line">
              <button
                type="button"
                className="btn btn-icon"
                aria-label={`Decrease quantity of ${name}`}
                disabled={pending || quantity <= 1}
                onClick={() =>
                  run(() => updateBagQuantity(slug, sizeKey, quantity - 1))
                }
              >
                <MinusIcon />
              </button>
              <span
                aria-live="polite"
                className="type-price w-8 text-center"
              >
                <span className="sr-only">Quantity </span>
                {quantity}
              </span>
              <button
                type="button"
                className="btn btn-icon"
                aria-label={`Increase quantity of ${name}`}
                disabled={pending || quantity >= max}
                onClick={() =>
                  run(() => updateBagQuantity(slug, sizeKey, quantity + 1))
                }
              >
                <PlusIcon />
              </button>
            </div>
          )}
          <button
            type="button"
            className="btn btn-ghost type-label text-muted hover:text-ink"
            disabled={pending}
            onClick={() => run(() => removeFromBag(slug, sizeKey))}
          >
            Remove<span className="sr-only"> {name}</span>
          </button>
        </div>

        {error && (
          <p role="alert" className="text-body-sm text-sale">
            {error}
          </p>
        )}
      </div>
    </li>
  );
}
