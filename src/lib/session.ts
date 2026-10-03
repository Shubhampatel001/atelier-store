import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { auth } from "@/lib/auth";

/** The signed-in session for this request, or null. Deduped per render. */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

/**
 * Where to send someone after signing in. Only same-site paths are allowed,
 * so `?next=` can't be used to bounce people to another site.
 */
export function safeNext(value: unknown, fallback = "/account") {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
