"use client";

import { useActionState, useId, type ComponentProps } from "react";

import { signIn, signUp, type AuthFormState } from "@/app/account/actions";

type FieldProps = ComponentProps<"input"> & {
  label: string;
  hint?: string;
};

function Field({ label, hint, ...input }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="type-label">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={hintId}
        className="min-h-12 w-full border-b border-line-strong bg-transparent px-0 text-body placeholder:text-subtle"
        {...input}
      />
      {hint && (
        <p id={hintId} className="type-caption">
          {hint}
        </p>
      )}
    </div>
  );
}

function FormError({ state }: { state: AuthFormState }) {
  if (!state) return null;
  return (
    <p role="alert" className="text-body-sm text-sale">
      {state.error}
    </p>
  );
}

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
      <FormError state={state} />
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
      <FormError state={state} />
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
