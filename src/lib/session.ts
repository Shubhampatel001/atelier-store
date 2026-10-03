import "server-only";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";

/** The signed-in session for this request, or null. Deduped per render. */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

/**
 * The signed-in admin, or no return. Signed-out visitors go to sign-in and
 * come back to `next`; everyone else gets a 404, so the admin area doesn't
 * reveal it exists.
 *
 * Call it in every admin page, Server Action and query: layouts don't guard
 * Server Actions or nested segments.
 */
export async function requireAdmin(next = "/admin") {
  const session = await getSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(safeNext(next))}`);
  if (session.user.role !== "admin") notFound();
  return session.user;
}

/**
 * Where to send someone after signing in. Only same-site paths are allowed,
 * so `?next=` can't be used to bounce people to another site.
 */
export function safeNext(value: unknown, fallback = "/account") {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
