"use server";

import { unstable_rethrow } from "next/navigation";
import { formLocale, translateMessage } from "@/i18n/form-messages";
import { MESSAGES } from "@/i18n/messages";
import { addSubscriber } from "@/lib/newsletter";
import { checkEmail, readString } from "@/lib/validation";

export type SubscribeState = {
  error?: string;
  email?: string;
  /** "new" on first sign-up, "existing" if the address was already on the list. */
  done?: "new" | "existing";
};

export async function subscribe(
  _prev: SubscribeState,
  form: FormData,
): Promise<SubscribeState> {
  // Shown in the form's language (its hidden `lang` field).
  const locale = formLocale(form);
  const failed = MESSAGES[locale].newsletter.subscribe.failed;
  const email = readString(form, "email");

  // Honeypot: hidden from people, filled in by most bots. Pretend it worked.
  if (readString(form, "website")) return { done: "new", email };

  const error = checkEmail(email);
  if (error) return { error: translateMessage(locale, error), email };

  const source = readString(form, "source").slice(0, 80) || "newsletter";
  try {
    const result = await addSubscriber(email, source);
    if (result.ok) return { done: result.added ? "new" : "existing", email };
    return { error: translateMessage(locale, result.message) ?? failed, email };
  } catch (err) {
    unstable_rethrow(err);
    console.error(err);
    return {
      error: failed,
      email,
    };
  }
}
