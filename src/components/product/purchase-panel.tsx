"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { addToBag } from "@/app/(store)/bag/actions";
import { notifyBagChange } from "@/components/layout/bag-link";
import { StockStatus } from "@/components/product/stock-status";
import type { SizeOption } from "@/lib/catalog";

type PurchasePanelProps = {
  slug: string;
  productName: string;
  sizes?: SizeOption[];
  stock: number;
};

// Size selection, live stock state and the primary action. Stock shown here
// can be up to a minute old (ISR); `addToBag` re-checks it live.
export function PurchasePanel({
  slug,
  productName,
  sizes,
  stock,
}: PurchasePanelProps) {
  const singleSize = sizes?.length === 1 ? sizes[0].label : null;
  const [selected, setSelected] = useState<string | null>(singleSize);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);
  const [bagError, setBagError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedSize = sizes?.find((size) => size.label === selected);
  const quantity = selectedSize ? selectedSize.stock : stock;
  const soldOut = stock <= 0;
  const needsSize = Boolean(sizes && sizes.length > 1);

  const add = () => {
    if (needsSize && !selectedSize) {
      setError(true);
      return;
    }
    const size = selectedSize?.label ?? sizes?.[0]?.label;
    if (!size) return;

    setError(false);
    setAdded(false);
    setBagError(null);
    startTransition(async () => {
      try {
        const result = await addToBag(slug, size);
        if (result.ok) {
          setAdded(true);
          notifyBagChange();
        } else {
          setBagError(result.error);
        }
      } catch {
        setBagError("Something went wrong. Please try again.");
      }
    });
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
                    setBagError(null);
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
            onClick={add}
            disabled={pending}
          >
            {pending ? "Adding…" : "Add to bag"}
          </button>
          <p role="status" className="min-h-5 text-body-sm text-muted">
            {added && (
              <>
                {`${productName}${selectedSize && needsSize ? `, ${selectedSize.label},` : ""} added to your bag. `}
                <Link href="/bag" className="link text-ink">
                  View bag
                </Link>
              </>
            )}
          </p>
          {bagError && (
            <p role="alert" className="-mt-3 text-body-sm text-sale">
              {bagError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
