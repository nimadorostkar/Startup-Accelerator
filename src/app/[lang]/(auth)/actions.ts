"use server";

import { redirect } from "next/navigation";
import { formLocale, translateErrors, translateMessage } from "@/i18n/form-messages";
import {
  createAccount,
  requestPasswordReset,
  resetPassword,
  signInWithPassword,
  startGoogleOAuth,
  verifyEmail,
} from "@/lib/auth";
import {
  checkEmail,
  checkName,
  checkNewPassword,
  collect,
  readString,
  type FieldErrors,
} from "@/lib/validation";

/* Every form here sends its language in a hidden `lang` field; what the
   actions answer with (theirs, lib/validation.ts's and the API's words) is
   passed through translateMessage/translateErrors (i18n/form-messages.ts). */

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
  const locale = formLocale(form);
  const email = readString(form, "email");
  const password = readString(form, "password");
  const remember = form.get("remember") === "on";
  // Checkboxes too: React resets the form after an action, so they'd come back unticked.
  const values = { email, remember: remember ? "on" : "" };

  const errors = collect([
    ["email", checkEmail(email)],
    ["password", password ? null : "Enter your password."],
  ]);
  if (errors) return { errors: translateErrors(locale, errors), values };

  // `next`: the page they were on (e.g. a link in an email); checked in lib/auth.ts.
  const result = await signInWithPassword({ email, password, remember }, readString(form, "next"));
  if (result.ok) redirect(result.redirectTo);

  return {
    message: translateMessage(locale, result.message),
    errors: translateErrors(locale, result.fieldErrors),
    values,
  };
}

export async function register(
  _prev: AuthFormState,
  form: FormData,
): Promise<AuthFormState> {
  const locale = formLocale(form);
  const name = readString(form, "name");
  const email = readString(form, "email");
  const password = readString(form, "password");
  const terms = form.get("terms") === "on";
  const values = { name, email, terms: terms ? "on" : "" };

  const errors = collect([
    ["name", checkName(name)],
    ["email", checkEmail(email)],
    ["password", checkNewPassword(password)],
    [
      "terms",
      terms ? null : "Please accept the terms to continue.",
    ],
  ]);
  if (errors) return { errors: translateErrors(locale, errors), values };

  const result = await createAccount({ name, email, password });
  if (result.ok) redirect(result.redirectTo);

  return {
    message: translateMessage(locale, result.message),
    errors: translateErrors(locale, result.fieldErrors),
    values,
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
  const locale = formLocale(form);
  const email = readString(form, "email");

  const errors = collect([["email", checkEmail(email)]]);
  if (errors) return { errors: translateErrors(locale, errors), values: { email } };

  const result = await requestPasswordReset({ email });
  if (result.ok) return { sent: true, email };

  return {
    message: translateMessage(locale, result.message),
    errors: translateErrors(locale, result.fieldErrors),
    values: { email },
  };
}

export async function continueWithGoogle(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const result = await startGoogleOAuth(readString(form, "next"), formLocale(form));
  if (result.ok) redirect(result.redirectTo);

  return { message: translateMessage(formLocale(form), result.message) };
}

/** Sets the new password from the emailed link; success signs the user in. */
export async function chooseNewPassword(
  _prev: AuthFormState,
  form: FormData,
): Promise<AuthFormState> {
  const locale = formLocale(form);
  const token = readString(form, "token");
  const password = readString(form, "password");

  const errors = collect([["password", checkNewPassword(password)]]);
  if (errors) return { errors: translateErrors(locale, errors) };
  if (!token)
    return { message: translateMessage(locale, "This reset link is incomplete. Request a new one below.") };

  const result = await resetPassword({ token, password });
  if (result.ok) redirect(result.redirectTo);
  return {
    message: translateMessage(locale, result.message),
    errors: translateErrors(locale, result.fieldErrors),
  };
}

export type VerifyState = { ok?: boolean; message?: string };

/* A button press rather than the page load confirms the address, so mail
   scanners that open every link can't use the token up first. */
export async function confirmEmail(
  _prev: VerifyState,
  form: FormData,
): Promise<VerifyState> {
  const result = await verifyEmail(readString(form, "token"));
  return result.ok
    ? { ok: true }
    : { ok: false, message: translateMessage(formLocale(form), result.message ?? "That link didn't work.") };
}
