import type { Metadata } from "next";
import Link from "next/link";

import { StatusBadge } from "@/components/admin/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { getDashboardStats, getLowStock } from "@/db/queries/admin";
import { formatPrice } from "@/lib/catalog";
import { requireAdmin } from "@/lib/session";

// The layout's title template applies to nested segments, not this one.
export const metadata: Metadata = {
  title: { absolute: "Dashboard | Atelier Admin" },
};

const fromCents = (cents: number) => cents / 100;

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const [stats, lowStock] = await Promise.all([
    getDashboardStats(),
    getLowStock(),
  ]);

  const tiles = [
    { label: "Revenue, last 30 days", value: formatPrice(fromCents(stats.revenue)) },
    { label: "Orders, last 30 days", value: stats.orders.toLocaleString("en-US") },
    {
      label: "Orders needing review",
      value: stats.needsReview.toLocaleString("en-US"),
      warning: stats.needsReview > 0,
    },
    {
      label: "Sizes low or sold out",
      value: stats.lowStock.toLocaleString("en-US"),
      warning: stats.lowStock > 0,
    },
  ];

  return (
    <main className="shell-bleed flex-1 pb-section lg:px-block">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome, ${admin.name.split(" ")[0] || admin.name}`}
      />

      <section aria-labelledby="stats-heading" className="divider pt-6">
        <h2 id="stats-heading" className="sr-only">
          Store performance
        </h2>
        <dl className="grid grid-cols-1 gap-grid sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="flex flex-col justify-between gap-3 bg-surface p-6"
            >
              <dt className="type-label text-muted">{tile.label}</dt>
              <dd
                className={`type-title tabular-nums ${tile.warning ? "text-sale" : ""}`}
              >
                {tile.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="low-stock-heading" className="mt-block">
        <h2 id="low-stock-heading" className="type-label mb-2">
          Low stock
        </h2>
        {lowStock.length === 0 ? (
          <p className="border-t border-line-strong py-6 text-body-sm text-muted">
            Every size has more than a few pieces in stock.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Size</th>
                  <th scope="col" className="text-right">
                    In stock
                  </th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((row) => (
                  <tr key={`${row.slug}:${row.size}`}>
                    <td>
                      <Link href={`/products/${row.slug}`} className="link-quiet">
                        {row.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap text-muted">{row.size}</td>
                    <td className="type-price text-right">{row.quantity}</td>
                    <td>
                      {row.quantity === 0 ? (
                        <StatusBadge tone="warning">Sold out</StatusBadge>
                      ) : (
                        <StatusBadge tone="neutral">Low</StatusBadge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
