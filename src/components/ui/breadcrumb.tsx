import Link from "next/link";
import { Fragment } from "react";

export type Crumb = { label: string; href?: string };

/** Trail of links ending at the current page (the last item, unlinked). */
export function Breadcrumb({
  items,
  className = "shell py-4 lg:py-6",
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="type-label flex flex-wrap items-center gap-2 text-muted">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <Fragment key={`${index}-${item.label}`}>
              {index > 0 && <li aria-hidden="true">/</li>}
              {current ? (
                <li aria-current="page" className="text-ink">
                  {item.label}
                </li>
              ) : (
                <li>
                  {item.href ? (
                    <Link href={item.href} className="link-quiet">
                      {item.label}
                    </Link>
                  ) : (
                    item.label
                  )}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
