"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Add sections here as their pages are built.
const sections = [{ label: "Dashboard", href: "/admin" }];

const isCurrent = (pathname: string, href: string) =>
  href === "/admin" ? pathname === href : pathname.startsWith(href);

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin">
      <ul className="flex gap-6 overflow-x-auto lg:flex-col lg:gap-4">
        {sections.map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              aria-current={isCurrent(pathname, section.href) ? "page" : undefined}
              className="type-label link-quiet whitespace-nowrap"
            >
              {section.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
