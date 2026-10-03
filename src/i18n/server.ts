import { lang } from "next/root-params";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";
import { MESSAGES, type Messages } from "./messages";

/* The current page's language and its dictionary, for Server Components and
   server utilities (next/root-params reads the URL's language). Outside the
   public site (the English-only dashboard and review panel) it's English.
   Server Actions and route handlers can't use this: forms send their language
   in a hidden `lang` field instead. */

export async function getLocale(): Promise<Locale> {
  const value = await lang();
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getDictionary(): Promise<Messages> {
  return MESSAGES[await getLocale()];
}
