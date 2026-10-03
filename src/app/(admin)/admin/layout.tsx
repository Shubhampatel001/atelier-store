import type { Metadata } from "next";
import Link from "next/link";

import { signOut } from "@/app/(store)/account/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Atelier Admin" },
  robots: { index: false, follow: false },
};

// Redirects early for a better experience only. Every admin page, action and
// query still calls `requireAdmin()` itself: layouts don't guard actions or
// nested segments.
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="theme-inverse lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="flex flex-col gap-5 px-gutter py-5 lg:h-full lg:gap-block lg:px-8 lg:py-8">
          <div className="flex items-baseline justify-between gap-4 lg:flex-col lg:items-start lg:gap-1">
            <Link
              href="/admin"
              className="font-serif text-2xl tracking-[0.3em] uppercase"
            >
              Atelier
            </Link>
            <p className="type-label text-muted">Admin</p>
          </div>

          <AdminNav />

          <div className="flex flex-col gap-4 border-t border-line pt-4 lg:mt-auto lg:pt-6">
            <div className="flex min-w-0 flex-col gap-1 max-lg:hidden">
              <p className="truncate text-body-sm">{admin.name}</p>
              <p className="truncate type-caption">{admin.email}</p>
            </div>
            <div className="flex items-center gap-6 lg:flex-col lg:items-start lg:gap-3">
              <Link href="/" className="type-label link-quiet">
                View store
              </Link>
              <form action={signOut}>
                <button type="submit" className="type-label link-quiet cursor-pointer">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <div id="main" className="flex min-w-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
