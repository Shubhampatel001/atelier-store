import type { ReactNode } from "react";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";

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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: current }]} />
      <div className="shell">
        <PageHeader eyebrow="My account" title={title} aside={aside} />
      </div>
    </>
  );
}
