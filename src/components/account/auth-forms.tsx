"use client";

import { useActionState } from "react";

import { signIn, signUp } from "@/app/(store)/account/actions";
import { Field, FormError } from "@/components/ui/form";

export function SignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="next" value={next} />
      <Field
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state?.fields.email}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <FormError message={state?.error} />
      <button
        type="submit"
        className="btn btn-primary btn-lg w-full"
        disabled={pending}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function SignUpForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signUp, null);

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="next" value={next} />
      <Field
        label="Full name"
        name="name"
        autoComplete="name"
        required
        maxLength={100}
        defaultValue={state?.fields.name}
      />
      <Field
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        maxLength={254}
        defaultValue={state?.fields.email}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        hint="At least 8 characters."
      />
      <FormError message={state?.error} />
      <button
        type="submit"
        className="btn btn-primary btn-lg w-full"
        disabled={pending}
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
