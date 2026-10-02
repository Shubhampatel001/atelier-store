import { formatPrice } from "@/lib/catalog";

type PriceProps = {
  price: number;
  compareAtPrice?: number;
  className?: string;
};

export function Price({ price, compareAtPrice, className = "" }: PriceProps) {
  const onSale = compareAtPrice !== undefined && compareAtPrice > price;

  return (
    <p className={`type-price flex flex-wrap gap-x-2 ${className}`}>
      {onSale && <span className="sr-only">Sale price </span>}
      <span className={onSale ? "text-sale" : ""}>{formatPrice(price)}</span>
      {onSale && (
        <s className="text-muted">
          <span className="sr-only">Original price </span>
          {formatPrice(compareAtPrice)}
        </s>
      )}
    </p>
  );
}
