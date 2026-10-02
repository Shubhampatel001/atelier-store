"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { CloseIcon, MenuIcon } from "@/components/icons";

type MobileMenuProps = {
  items: { label: string; href: string }[];
};

export function MobileMenu({ items }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggle = () => {
    // Pin the panel directly under the header, wherever it sits right now.
    const header = buttonRef.current?.closest("header");
    setTop(header?.getBoundingClientRect().bottom ?? 0);
    setOpen((value) => !value);
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOnDesktop = window.matchMedia("(width >= 64rem)");
    const onResize = () => closeOnDesktop.matches && setOpen(false);

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeOnDesktop.addEventListener("change", onResize);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      closeOnDesktop.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-icon -ml-3 lg:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={toggle}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      <div
        id="mobile-menu"
        hidden={!open}
        style={{ top }}
        className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto border-t border-line bg-paper lg:hidden"
      >
        <nav aria-label="Mobile" className="shell py-block">
          <ul className="flex flex-col">
            {items.map((item) => (
              <li key={item.href} className="border-b border-line">
                <Link
                  href={item.href}
                  className="type-heading block py-4"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-block flex flex-col gap-4">
            <Link href="/account" className="type-label link-quiet">
              Sign in
            </Link>
            <Link href="/stores" className="type-label link-quiet">
              Find a store
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
