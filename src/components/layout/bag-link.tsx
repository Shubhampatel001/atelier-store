"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { BagIcon } from "@/components/icons";
import { BAG_CHANGE_EVENT, readBagCount } from "@/lib/bag";

// The count is read from the bag cookie in the browser. Reading it on the
// server would make every page that renders the header dynamic and opt the
// ISR pages out of static rendering.
function subscribe(onChange: () => void) {
  window.addEventListener(BAG_CHANGE_EVENT, onChange);
  window.addEventListener("focus", onChange);
  return () => {
    window.removeEventListener(BAG_CHANGE_EVENT, onChange);
    window.removeEventListener("focus", onChange);
  };
}

const getSnapshot = () => readBagCount(document.cookie);
const getServerSnapshot = () => 0;

/** Tell the header the bag cookie changed. Call after a bag action. */
export function notifyBagChange() {
  window.dispatchEvent(new Event(BAG_CHANGE_EVENT));
}

export function BagLink() {
  const count = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <Link
      href="/bag"
      aria-label={`Shopping bag, ${count} ${count === 1 ? "item" : "items"}`}
      className="btn btn-icon relative -mr-3"
    >
      <BagIcon />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[0.625rem] leading-none tracking-normal text-paper tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
