"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { safeNext } from "@/lib/session";

export type AuthFormState = {
  error: string;
  /** Echoed back so the form keeps what was typed (never the password). */
  fields: { name?: string; email?: string };
} | null;

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

// Server Actions are public POST endpoints: every field is untrusted.
const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const password = (formData: FormData) => {
  const value = formData.get("password");
  return typeof value === "string" ? value : "";
};

export async function signIn(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = text(formData, "email").slice(0, MAX_EMAIL_LENGTH);
  const fields = { email };
  const pass = password(formData);
  if (!email || !pass) {
    return { error: "Enter your email address and password.", fields };
  }

  try {
    await auth.api.signInEmail({
      body: { email, password: pass },
      headers: await headers(),
    });
  } catch (error) {
    return { error: errorMessage(error), fields };
  }

  redirect(safeNext(formData.get("next")));
}

export async function signUp(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = text(formData, "name").slice(0, MAX_NAME_LENGTH);
  const email = text(formData, "email").slice(0, MAX_EMAIL_LENGTH);
  const fields = { name, email };
  const pass = password(formData);
  if (!name || !email || !pass) {
    return { error: "Complete all fields to create your account.", fields };
  }

  try {
    await auth.api.signUpEmail({
      body: { name, email, password: pass },
      headers: await headers(),
    });
  } catch (error) {
    return { error: errorMessage(error), fields };
  }

  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (error) {
    // Already signed out (no or expired session): nothing to undo.
    if (!isAPIError(error)) throw error;
  }
  redirect("/");
}

function errorMessage(error: unknown) {
  if (!isAPIError(error)) {
    console.error("Authentication failed", error);
    return "Something went wrong. Please try again.";
  }

  switch (error.body?.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "The email address or password is incorrect.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "An account with this email address already exists. Sign in instead.";
    case "INVALID_EMAIL":
      return "Enter a valid email address.";
    case "PASSWORD_TOO_SHORT":
      return "Your password must be at least 8 characters.";
    case "PASSWORD_TOO_LONG":
      return "Your password must be 128 characters or fewer.";
  }
  if (error.statusCode === 429) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  console.error("Authentication failed", error);
  return "Something went wrong. Please try again.";
}
