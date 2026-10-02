"use client";

import Link from "next/link";
import { useState } from "react";

import { StockStatus } from "@/components/product/stock-status";
import type { SizeOption } from "@/lib/catalog";

type PurchasePanelProps = {
  productName: string;
  sizes?: SizeOption[];
  stock: number;
};

// Size selection, live stock state and the primary action. The bag itself is
// not implemented yet, so adding only confirms locally.
export function PurchasePanel({ productName, sizes, stock }: PurchasePanelProps) {
  const singleSize = sizes?.length === 1 ? sizes[0].label : null;
  const [selected, setSelected] = useState<string | null>(singleSize);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);

  const selectedSize = sizes?.find((size) => size.label === selected);
  const quantity = selectedSize ? selectedSize.stock : stock;
  const soldOut = stock <= 0;
  const needsSize = Boolean(sizes && sizes.length > 1);

  const addToBag = () => {
    if (needsSize && !selectedSize) {
      setError(true);
      return;
    }
    setError(false);
    setAdded(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {needsSize && sizes && (
        <fieldset className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <legend className="type-label">
              Size{selected ? `: ${selected}` : ""}
            </legend>
            <Link href="/size-guide" className="link text-caption text-muted">
              Size guide
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
            {sizes.map((size) => {
              const unavailable = size.stock <= 0;
              const active = size.label === selected;
              return (
                <button
                  key={size.label}
                  type="button"
                  disabled={unavailable}
                  aria-pressed={active}
                  aria-label={
                    unavailable ? `${size.label}, sold out` : size.label
                  }
                  onClick={() => {
                    setSelected(size.label);
                    setError(false);
                    setAdded(false);
                  }}
                  className={`min-h-11 border text-body-sm transition-colors ${
                    active
                      ? "border-line-strong bg-ink text-paper"
                      : "border-line hover:border-line-strong"
                  } disabled:cursor-not-allowed disabled:text-subtle disabled:line-through disabled:hover:border-line`}
                >
                  {size.label}
                </button>
              );
            })}
          </div>
          {error && (
            <p role="alert" className="text-body-sm text-sale">
              Please select a size.
            </p>
          )}
        </fieldset>
      )}

      <StockStatus quantity={quantity} />

      {soldOut ? (
        <div className="flex flex-col gap-3">
          <button type="button" className="btn btn-primary btn-lg w-full" disabled>
            Sold out
          </button>
          <p className="text-body-sm text-muted">
            This piece is currently unavailable.{" "}
            <Link href="/contact-us" className="link">
              Contact client services
            </Link>{" "}
            to check availability in boutique.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="btn btn-primary btn-lg w-full"
            onClick={addToBag}
          >
            Add to bag
          </button>
          <p role="status" className="min-h-5 text-body-sm text-muted">
            {added &&
              `${productName}${selectedSize && needsSize ? `, ${selectedSize.label},` : ""} added to your bag.`}
          </p>
        </div>
      )}
    </div>
  );
}
