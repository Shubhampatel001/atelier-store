// Shopping bag cookie format and pure helpers. Client-safe: the header count
// reads the cookie in the browser, so this module must never import `@/db`.
//
// The cookie only holds references (slug, size, quantity). Prices and stock
// are always re-read from the database, so a tampered cookie can change what
// is in the bag but never what it costs.

export const BAG_COOKIE = "atelier_bag";
export const BAG_MAX_AGE = 60 * 60 * 24 * 30;
export const MAX_LINE_QUANTITY = 10;
export const MAX_BAG_LINES = 30;

/** Fired on `window` after a bag action so the header count re-reads. */
export const BAG_CHANGE_EVENT = "atelier:bag-change";

export type BagLine = {
  slug: string;
  size: string;
  quantity: number;
};

export const isSameLine = (a: BagLine, slug: string, size: string) =>
  a.slug === slug && a.size === size;

/** Lenient parser: anything malformed is dropped rather than thrown. */
export function parseBag(value: string | undefined): BagLine[] {
  if (!value) return [];
  let data: unknown;
  try {
    data = JSON.parse(value);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const lines: BagLine[] = [];
  for (const entry of data) {
    if (!Array.isArray(entry)) continue;
    const [slug, size, quantity] = entry as unknown[];
    if (
      typeof slug !== "string" ||
      typeof size !== "string" ||
      !Number.isInteger(quantity) ||
      (quantity as number) < 1 ||
      lines.some((line) => isSameLine(line, slug, size))
    ) {
      continue;
    }
    lines.push({
      slug,
      size,
      quantity: Math.min(quantity as number, MAX_LINE_QUANTITY),
    });
    if (lines.length === MAX_BAG_LINES) break;
  }
  return lines;
}

/** Compact tuple form keeps the cookie well under the 4 KB limit. */
export const serializeBag = (lines: BagLine[]) =>
  JSON.stringify(lines.map((line) => [line.slug, line.size, line.quantity]));

export const countBagItems = (lines: BagLine[]) =>
  lines.reduce((total, line) => total + line.quantity, 0);

/** Item count from a `document.cookie` string. */
export function readBagCount(cookieHeader: string) {
  const prefix = `${BAG_COOKIE}=`;
  const pair = cookieHeader
    .split("; ")
    .find((cookie) => cookie.startsWith(prefix));
  if (!pair) return 0;
  try {
    return countBagItems(
      parseBag(decodeURIComponent(pair.slice(prefix.length))),
    );
  } catch {
    return 0;
  }
}
