"use server";

import { findEvent, isPast } from "@/components/events/events";
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

  const event = findEvent(slug);
  if (!event) return { message: "We couldn't find that event.", values };
  if (isPast(event))
    return { message: "Registration for this event has closed.", values };

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
    const added = await addRegistration({ event: slug, name, email, company });
    return { done: { name, email, existing: !added } };
  } catch {
    return {
      message: "We couldn't save your registration just now. Please try again.",
      values,
    };
  }
}
