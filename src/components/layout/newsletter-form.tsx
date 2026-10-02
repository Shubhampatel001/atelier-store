"use client";

import { useState, type FormEvent } from "react";

// Front-end only for now: confirms locally until a mailing provider is wired up.
export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p role="status" className="type-body text-muted">
        Thank you — you&rsquo;re on the list.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="Email address"
        className="min-h-12 flex-1 border-b border-line-strong bg-transparent px-0 text-body placeholder:text-subtle"
      />
      <button type="submit" className="btn btn-secondary">
        Subscribe
      </button>
    </form>
  );
}
