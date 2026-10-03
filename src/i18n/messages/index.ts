import type { Locale } from "../config";
import en from "./en";
import fa from "./fa";
import tr from "./tr";

/* Every string on the public site, per language and per area of the site
   (messages/<locale>/<area>.ts). English is the source: the Turkish and Persian
   files are typed against it, so a missing or extra key fails the type check.
   Strings only (they're passed to client components); {name} placeholders,
   filled in with format() from ../format. */

export type Messages = typeof en;

export const MESSAGES: Record<Locale, Messages> = { en, tr, fa };
