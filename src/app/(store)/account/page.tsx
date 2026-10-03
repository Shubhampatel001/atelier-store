import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/app/(store)/account/actions";
import { AccountPageHeader } from "@/components/account/account-page";
import { getOrdersForUser } from "@/db/queries/orders";
import { formatPrice, services } from "@/lib/catalog";
import { getSession } from "@/lib/session";

// Reads the session cookie, so this page always renders per request.
export const metadata: Metadata = {
  title: "My account",
  robots: { index: false },
};

const fromCents = (cents: number) => cents / 100;

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(date);

const MAX_THUMBNAILS = 4;

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const { user } = session;
  const orders = await getOrdersForUser(user.id);
  const firstName = user.name.split(" ")[0] || user.name;

  return (
    <main className="flex-1">
      <AccountPageHeader
        title={`Welcome, ${firstName}`}
        current="My account"
        aside={
          <div className="flex items-center gap-8">
            {user.role === "admin" && (
              <Link href="/admin" className="btn btn-ghost">
                Admin
              </Link>
            )}
            <form action={signOut}>
              <button type="submit" className="btn btn-ghost">
                Sign out
              </button>
            </form>
          </div>
        }
      />

      <div className="shell pb-section">
        <div className="divider grid gap-block lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] xl:gap-section">
          <section aria-labelledby="order-history" className="pt-6">
            <h2 id="order-history" className="type-label mb-2">
              Order history
            </h2>

            {orders.length === 0 ? (
              <div className="flex flex-col items-start gap-6 border-b border-line py-block">
                <p className="type-title">You haven&rsquo;t placed an order yet</p>
                <p className="max-w-prose-narrow text-body-sm text-muted">
                  Orders you place while signed in will appear here.
                </p>
                <Link href="/new" className="btn btn-primary w-full sm:w-auto">
                  Shop new arrivals
                </Link>
              </div>
            ) : (
              <ul>
                {orders.map((order) => {
                  const pieces = order.items.reduce(
                    (count, item) => count + item.quantity,
                    0,
                  );
                  const hidden = order.items.length - MAX_THUMBNAILS;
                  return (
                    <li
                      key={order.id}
                      className="flex flex-col gap-4 border-b border-line py-6"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3 className="type-label">
                          Order {order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <p className="type-price">
                          {formatPrice(fromCents(order.total ?? order.subtotal))}
                        </p>
                      </div>
                      <p className="text-body-sm text-muted">
                        {formatDate(order.createdAt)} · {pieces}{" "}
                        {pieces === 1 ? "piece" : "pieces"} ·{" "}
                        {order.status === "needs_review" ? (
                          <span className="text-sale">
                            Client services will contact you
                          </span>
                        ) : (
                          <span className="text-ink">Confirmed</span>
                        )}
                      </p>
                      <ul aria-label="Pieces" className="flex gap-2">
                        {order.items.slice(0, MAX_THUMBNAILS).map((item) => (
                          <li key={item.id} className="media aspect-product w-16">
                            <Image src={item.image} alt={item.name} fill sizes="4rem" />
                          </li>
                        ))}
                        {hidden > 0 && (
                          <li className="flex aspect-product w-16 items-center justify-center bg-surface type-label">
                            +{hidden}
                          </li>
                        )}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <aside
            aria-labelledby="account-details"
            className="lg:sticky lg:top-[calc(var(--header-height)+4rem)] lg:self-start lg:pt-6"
          >
            <div className="flex flex-col gap-6 bg-surface p-6 sm:p-8">
              <h2 id="account-details" className="type-label">
                Account details
              </h2>
              <dl className="flex flex-col gap-3 text-body-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Name</dt>
                  <dd className="min-w-0 truncate">{user.name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Email</dt>
                  <dd className="min-w-0 truncate">{user.email}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Member since</dt>
                  <dd>{formatDate(user.createdAt)}</dd>
                </div>
              </dl>
            </div>

            <ul className="mt-6 flex flex-col gap-4 px-6 sm:px-8">
              {services.slice(0, 2).map((service) => (
                <li key={service.title} className="flex flex-col gap-1">
                  <h3 className="type-label">{service.title}</h3>
                  <p className="text-body-sm text-muted">{service.description}</p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </main>
  );
}
