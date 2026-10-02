import Link from "next/link";

import { NewsletterForm } from "@/components/layout/newsletter-form";
import { footerLinks } from "@/lib/catalog";

const slugify = (label: string) => label.toLowerCase().replace(/\s+/g, "-");

export function SiteFooter() {
  return (
    <footer className="theme-inverse">
      <div className="shell grid gap-block pt-section pb-block lg:grid-cols-[2fr_3fr]">
        <div className="flex max-w-prose-narrow flex-col gap-5">
          <h2 className="type-label">Newsletter</h2>
          <p className="type-title">
            Be the first to discover new collections, private events and
            stories from the atelier.
          </p>
          <NewsletterForm />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
          {footerLinks.map((group) => (
            <div key={group.title} className="flex flex-col gap-5">
              <h2 className="type-label">{group.title}</h2>
              <ul className="flex flex-col gap-3">
                {group.links.map((label) => (
                  <li key={label}>
                    <Link
                      href={`/${slugify(label)}`}
                      className="text-body-sm text-muted transition-colors hover:text-ink"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="shell">
        <div className="divider flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <Link
            href="/"
            className="font-serif text-xl tracking-[0.3em] uppercase"
          >
            Atelier
          </Link>
          <p className="type-caption">
            © {new Date().getFullYear()} Atelier Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
