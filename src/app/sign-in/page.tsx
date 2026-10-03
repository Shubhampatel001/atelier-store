import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountPageHeader } from "@/components/account/account-page";
import { SignInForm } from "@/components/account/auth-forms";
import { getSession, safeNext } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

const benefits = [
  "Follow your orders from checkout to delivery",
  "See every piece you've bought in one place",
  "Check out faster with your details ready",
];

export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next);

  const signUpHref =
    next === "/account" ? "/sign-up" : `/sign-up?next=${encodeURIComponent(next)}`;

  return (
    <main className="flex-1">
      <AccountPageHeader title="Sign in" current="Sign in" />

      <div className="shell pb-section">
        <div className="divider grid gap-block pt-block lg:grid-cols-2 xl:gap-section">
          <section aria-labelledby="sign-in-heading" className="max-w-prose-narrow">
            <h2 id="sign-in-heading" className="type-title mb-2">
              Welcome back
            </h2>
            <p className="mb-8 text-body-sm text-muted">
              Sign in with your email address and password.
            </p>
            <SignInForm next={next} />
          </section>

          <aside aria-labelledby="new-customer-heading" className="lg:self-start">
            <div className="flex flex-col gap-6 bg-surface p-6 sm:p-8">
              <h2 id="new-customer-heading" className="type-title">
                New to Atelier?
              </h2>
              <ul className="flex flex-col gap-3 text-body-sm text-muted">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3">
                    <span aria-hidden="true" className="text-ink">
                      —
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link href={signUpHref} className="btn btn-secondary w-full sm:w-auto sm:self-start">
                Create an account
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
