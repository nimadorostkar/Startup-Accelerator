"use server";

import { formLocale, translateMessage } from "@/i18n/form-messages";
import { MESSAGES } from "@/i18n/messages";
import { BackendUnavailable, UNAVAILABLE } from "@/lib/api";
import { unsubscribe } from "@/lib/newsletter";
import { readString } from "@/lib/validation";

export type UnsubscribeState = { email?: string; message?: string };

export async function leaveNewsletter(_prev: UnsubscribeState, form: FormData): Promise<UnsubscribeState> {
  // Shown in the form's language (its hidden `lang` field).
  const locale = formLocale(form);
  try {
    const result = await unsubscribe(readString(form, "token"));
    return result.ok
      ? { email: result.email }
      : { message: translateMessage(locale, result.message) ?? MESSAGES[locale].newsletter.unsubscribe.failed };
  } catch (err) {
    if (err instanceof BackendUnavailable) return { message: translateMessage(locale, UNAVAILABLE) };
    throw err;
  }
}
