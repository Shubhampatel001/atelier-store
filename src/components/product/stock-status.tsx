import { getStockState, type StockState } from "@/lib/catalog";

const tone: Record<StockState, string> = {
  in_stock: "bg-success",
  low_stock: "bg-sale",
  out_of_stock: "bg-subtle",
};

export function stockLabel(quantity: number) {
  const state = getStockState(quantity);
  if (state === "out_of_stock") return "Sold out";
  if (state === "low_stock") return `Only ${quantity} left`;
  return "In stock";
}

export function StockStatus({
  quantity,
  className = "",
}: {
  quantity: number;
  className?: string;
}) {
  const state = getStockState(quantity);

  return (
    <p
      className={`flex items-center gap-2 text-body-sm ${
        state === "low_stock" ? "text-sale" : "text-muted"
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${tone[state]}`}
      />
      {stockLabel(quantity)}
    </p>
  );
}
