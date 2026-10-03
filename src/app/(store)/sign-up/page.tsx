import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountPageHeader } from "@/components/account/account-page";
import { SignUpForm } from "@/components/account/auth-forms";
import { getSession, safeNext } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false },
};

export default async function SignUpPage({
  searchParams,
}: PageProps<"/sign-up">) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next);

  const signInHref =
    next === "/account" ? "/sign-in" : `/sign-in?next=${encodeURIComponent(next)}`;

  return (
    <main className="flex-1">
      <AccountPageHeader title="Create an account" current="Create an account" />

      <div className="shell pb-section">
        <div className="divider pt-block">
          <section
            aria-labelledby="sign-up-heading"
            className="max-w-prose-narrow"
          >
            <h2 id="sign-up-heading" className="type-title mb-2">
              Your details
            </h2>
            <p className="mb-8 text-body-sm text-muted">
              Orders you place while signed in are saved to your account.
            </p>
            <SignUpForm next={next} />
            <p className="mt-8 text-body-sm text-muted">
              Already have an account?{" "}
              <Link href={signInHref} className="link text-ink">
                Sign in
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
