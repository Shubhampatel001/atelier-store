import Link from "next/link";

import { SearchIcon, UserIcon } from "@/components/icons";
import { BagLink } from "@/components/layout/bag-link";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { navigation } from "@/lib/catalog";

export function AnnouncementBar() {
  return (
    <div className="theme-inverse">
      <p className="shell type-label py-2.5 text-center">
        Complimentary shipping and returns
      </p>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper">
      <div className="shell grid h-header grid-cols-[1fr_auto_1fr] items-center">
        <div className="flex items-center gap-2">
          <MobileMenu items={navigation} />
          <Link
            href="/search"
            aria-label="Search"
            className="btn btn-icon max-lg:hidden lg:-ml-3"
          >
            <SearchIcon />
          </Link>
        </div>

        <Link
          href="/"
          className="font-serif text-2xl tracking-[0.3em] uppercase lg:text-3xl"
        >
          Atelier
        </Link>

        <div className="flex items-center justify-end">
          <Link
            href="/search"
            aria-label="Search"
            className="btn btn-icon lg:hidden"
          >
            <SearchIcon />
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="btn btn-icon max-sm:hidden"
          >
            <UserIcon />
          </Link>
          <BagLink />
        </div>
      </div>

      <nav aria-label="Primary" className="max-lg:hidden">
        <ul className="shell flex justify-center gap-10 pb-4">
          {navigation.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="type-label link-quiet">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
