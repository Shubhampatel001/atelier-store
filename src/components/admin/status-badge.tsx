import type { ReactNode } from "react";

export type StatusTone = "success" | "warning" | "neutral";

const dot: Record<StatusTone, string> = {
  success: "bg-success",
  warning: "bg-sale",
  neutral: "bg-subtle",
};

/** Dot and label, in the same style as the storefront's `StockStatus`. */
export function StatusBadge({
  tone,
  children,
}: {
  tone: StatusTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap ${
        tone === "warning" ? "text-sale" : "text-ink"
      }`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${dot[tone]}`} />
      {children}
    </span>
  );
}
