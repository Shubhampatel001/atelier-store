import type { ReactNode } from "react";

/** Eyebrow label, serif page title and optional description, with an aside
 *  (count, action) that sits beside the title from `sm`. */
export function PageHeader({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  aside?: ReactNode;
}) {
  return (
    <header className="mb-block flex flex-col gap-4 pt-block sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-prose-narrow flex-col gap-3">
        <p className="type-label text-muted">{eyebrow}</p>
        <h1 className="type-heading">{title}</h1>
        {description && <p className="text-body-sm text-muted">{description}</p>}
      </div>
      {aside}
    </header>
  );
}
