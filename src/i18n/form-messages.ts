import { isLocale, type Locale } from "./config";
import { MESSAGES } from "./messages";

/* The forms' messages in the visitor's language. lib/validation.ts and the API
   answer in English; Server Actions pass what they'd show through these, with
   the language the form sent (a hidden `lang` field: actions can't read the
   URL's language). Messages without a translation stay in English.

   Translations live in messages/<locale>/formMessages.ts, keyed by the exact
   English text. Messages with a number in them ("Please wait 12 minutes…",
   "Keep this to 120 characters or fewer.") are matched with the number
   replaced by {n}: key "Keep this to {n} characters or fewer.". */

/** The language a form was sent in (its hidden `lang` field), English if missing or unknown. */
export function formLocale(form: FormData): Locale {
  const value = form.get("lang");
  return isLocale(value) ? value : "en";
}

export function translateMessage(locale: Locale, message: string): string;
export function translateMessage(locale: Locale, message: string | undefined): string | undefined;
export function translateMessage(locale: Locale, message: string | undefined) {
  if (!message || locale === "en") return message;
  const table = MESSAGES[locale].formMessages;
  if (message in table) return table[message];
  // One number in the message: look it up as {n}, then put the number back.
  const numbers = message.match(/\d+/g);
  if (numbers?.length === 1) {
    const translated = table[message.replace(/\d+/, "{n}")];
    if (translated) return translated.replace("{n}", numbers[0]);
  }
  return message;
}

/** Field errors ({ email: "…" }) in the visitor's language. */
export function translateErrors<T extends Record<string, string> | undefined>(locale: Locale, errors: T): T {
  if (!errors || locale === "en") return errors;
  return Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, translateMessage(locale, v)])) as T;
}
