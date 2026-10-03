"use server";

import { unstable_rethrow } from "next/navigation";
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
};

export async function registerForEvent(
  _prev: RegisterState,
  form: FormData,
): Promise<RegisterState> {
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
  if (errors) return { errors, values };

  try {
    const result = await addRegistration({ event: slug, name, email, company });
    if (!result.ok) return { message: result.errors ? undefined : result.message, errors: result.errors, values };
    return { done: { name, email, existing: result.existing } };
  } catch (err) {
    unstable_rethrow(err);
    console.error(err);
    return {
      message: "We couldn't save your registration just now. Please try again.",
      values,
    };
  }
}
