"use server";

import { redirect } from "next/navigation";
import {
  createAccount,
  requestPasswordReset,
  signInWithPassword,
  startGoogleOAuth,
} from "@/lib/auth";
import {
  checkEmail,
  checkName,
  checkNewPassword,
  collect,
  readString,
  type FieldErrors,
} from "@/lib/validation";

export type AuthFormState = {
  /** Shown in the banner above the form. */
  message?: string;
  errors?: FieldErrors;
  /** Typed-in values sent back so the form survives a failed submit. */
  values?: Record<string, string>;
};

export async function login(
  _prev: AuthFormState,
  form: FormData,
): Promise<AuthFormState> {
  const email = readString(form, "email");
  const password = readString(form, "password");
  const remember = form.get("remember") === "on";

  const errors = collect([
    ["email", checkEmail(email)],
    ["password", password ? null : "Enter your password."],
  ]);
  if (errors) return { errors, values: { email } };

  const result = await signInWithPassword({ email, password, remember });
  if (result.ok) redirect(result.redirectTo);

  return {
    message: result.message,
    errors: result.fieldErrors,
    values: { email },
  };
}

export async function register(
  _prev: AuthFormState,
  form: FormData,
): Promise<AuthFormState> {
  const name = readString(form, "name");
  const email = readString(form, "email");
  const password = readString(form, "password");

  const errors = collect([
    ["name", checkName(name)],
    ["email", checkEmail(email)],
    ["password", checkNewPassword(password)],
    [
      "terms",
      form.get("terms") === "on" ? null : "Please accept the terms to continue.",
    ],
  ]);
  if (errors) return { errors, values: { name, email } };

  const result = await createAccount({ name, email, password });
  if (result.ok) redirect(result.redirectTo);

  return {
    message: result.message,
    errors: result.fieldErrors,
    values: { name, email },
  };
}

export type ResetFormState = AuthFormState & {
  /** Flips the form over to the "check your inbox" panel. */
  sent?: boolean;
  /** The address we told the user we sent to. */
  email?: string;
};

export async function requestReset(
  _prev: ResetFormState,
  form: FormData,
): Promise<ResetFormState> {
  const email = readString(form, "email");

  const errors = collect([["email", checkEmail(email)]]);
  if (errors) return { errors, values: { email } };

  const result = await requestPasswordReset({ email });
  if (result.ok) return { sent: true, email };

  return {
    message: result.message,
    errors: result.fieldErrors,
    values: { email },
  };
}

export async function continueWithGoogle(): Promise<AuthFormState> {
  const result = await startGoogleOAuth();
  if (result.ok) redirect(result.redirectTo);

  return { message: result.message };
}
