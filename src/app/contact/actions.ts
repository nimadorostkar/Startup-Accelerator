"use server";

import { CONTACT_TOPICS, saveContactMessage } from "@/lib/contact";
import {
  checkEmail,
  checkName,
  collect,
  maxLength,
  oneOf,
  readString,
  type FieldErrors,
} from "@/lib/validation";

export type ContactFormState = {
  message?: string;
  errors?: FieldErrors;
  values?: Record<string, string>;
  sent?: { name: string; email: string };
};

export async function sendContactMessage(
  _prev: ContactFormState,
  form: FormData,
): Promise<ContactFormState> {
  const name = readString(form, "name");
  const email = readString(form, "email");
  const company = readString(form, "company");
  const topic = readString(form, "topic");
  const message = readString(form, "message");
  const values = { name, email, company, topic, message };

  // Honeypot: hidden from people, filled in by most bots. Pretend it worked.
  if (readString(form, "website")) return { sent: { name, email } };

  const errors = collect([
    ["name", checkName(name)],
    ["email", checkEmail(email)],
    ["company", maxLength(company, 120)],
    [
      "topic",
      oneOf(topic, CONTACT_TOPICS) ? null : "Choose what this is about.",
    ],
    [
      "message",
      !message
        ? "Write a short message."
        : message.length < 10
          ? "Tell us a little more (at least 10 characters)."
          : maxLength(message, 2000),
    ],
  ]);
  if (errors || !oneOf(topic, CONTACT_TOPICS))
    return { errors: errors ?? {}, values };

  try {
    await saveContactMessage({ name, email, company, topic, message });
  } catch {
    return {
      message: "We couldn't send your message just now. Please try again.",
      values,
    };
  }
  return { sent: { name, email } };
}
