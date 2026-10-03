"use server";

import { unstable_rethrow } from "next/navigation";
import { formLocale, translateErrors, translateMessage } from "@/i18n/form-messages";
import { MESSAGES } from "@/i18n/messages";
import { addRegistration } from "@/lib/events";
import {
  checkEmail,
  checkName,
  collect,
  maxLength,
  readString,
  type FieldErrors,
} from "@/lib/validation";

export type RegisterState = {
  message?: string;
  errors?: FieldErrors;
  values?: Record<string, string>;
  done?: { name: string; email: string; existing: boolean };
  /** Why registration is closed (the event ended or filled up meanwhile). */
  closed?: string;
};

export async function registerForEvent(
  _prev: RegisterState,
  form: FormData,
): Promise<RegisterState> {
  // Shown in the form's language (its hidden `lang` field).
  const locale = formLocale(form);
  const t = MESSAGES[locale].events.register;
  const slug = readString(form, "event");
  const name = readString(form, "name");
  const email = readString(form, "email");
  const company = readString(form, "company");
  const values = { name, email, company };

  // Unknown, ended and full events are refused by the API, whatever the page showed.

  // Honeypot: hidden from people, filled in by most bots. Pretend it worked.
  if (readString(form, "website"))
    return { done: { name, email, existing: false } };

  const errors = collect([
    ["name", checkName(name)],
    ["email", checkEmail(email)],
    ["company", maxLength(company, 120)],
  ]);
  if (errors) return { errors: translateErrors(locale, errors), values };

  try {
    const result = await addRegistration({ event: slug, name, email, company });
    if (!result.ok && result.closed)
      return { closed: translateMessage(locale, result.message) ?? t.closedFallback };
    if (!result.ok)
      return {
        // A refusal without a message of its own (an HTML 400 from a proxy) still says something
        message: result.errors ? undefined : (translateMessage(locale, result.message) ?? t.failed),
        errors: translateErrors(locale, result.errors),
        values,
      };
    return { done: { name, email, existing: result.existing } };
  } catch (err) {
    unstable_rethrow(err);
    console.error(err);
    return {
      message: t.saveFailed,
      values,
    };
  }
}
