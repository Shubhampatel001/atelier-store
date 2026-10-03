import Link from "next/link";
import type { ReactNode } from "react";

/** Breadcrumb and page header shared by the sign-in, sign-up and account pages. */
export function AccountPageHeader({
  title,
  current,
  aside,
}: {
  title: string;
  current: string;
  aside?: ReactNode;
}) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="shell py-4 lg:py-6">
        <ol className="type-label flex flex-wrap items-center gap-2 text-muted">
          <li>
            <Link href="/" className="link-quiet">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {current}
          </li>
        </ol>
      </nav>

      <header className="shell mb-block flex flex-col gap-4 pt-block sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3">
          <p className="type-label text-muted">My account</p>
          <h1 className="type-heading">{title}</h1>
        </div>
        {aside}
      </header>
    </>
  );
}
