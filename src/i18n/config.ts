/* The site's languages. Shared by the proxy, server and client code (no
   server-only imports). English is the default and lives at the bare paths
   (/events); the others under their prefix (/tr/events, /fa/events).
   The founder dashboard and the review panel are English only. */

export const LOCALES = ["en", "tr", "fa"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_INFO: Record<
  Locale,
  {
    /** The language's own name, as shown in the switcher. */
    label: string;
    /** Two-letter code shown on the switcher button. */
    short: string;
    dir: "ltr" | "rtl";
    /** For Intl formatting (dates, numbers). */
    intl: string;
    /** For <meta property="og:locale">. */
    og: string;
  }
> = {
  en: { label: "English", short: "EN", dir: "ltr", intl: "en-US", og: "en_US" },
  tr: { label: "Türkçe", short: "TR", dir: "ltr", intl: "tr-TR", og: "tr_TR" },
  fa: { label: "فارسی", short: "FA", dir: "rtl", intl: "fa-IR", og: "fa_IR" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** "/events" in a language: "/events", "/tr/events", "/fa/events". Only for site-relative paths. */
export function localePath(locale: Locale, path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) return path; // another site, a mailto:, a #hash
  if (locale === DEFAULT_LOCALE) return path;
  // The home page, with or without a query or #section: "/tr", "/tr#faq", "/tr?x=1".
  if (path === "/" || path.startsWith("/#") || path.startsWith("/?")) return `/${locale}${path.slice(1)}`;
  return `/${locale}${path}`;
}

/** Splits "/tr/events?x=1" into its language and the language-free path ("/events?x=1"). */
export function splitLocale(path: string): { locale: Locale; path: string } {
  const match = /^\/(tr|fa|en)(?=\/|\?|#|$)/.exec(path);
  if (!match) return { locale: DEFAULT_LOCALE, path: path || "/" };
  const rest = path.slice(match[0].length);
  return { locale: match[1] as Locale, path: rest.startsWith("/") ? rest : `/${rest}` };
}

/** Paths that are never localized: the English-only areas and everything that isn't a page. */
export function isUnlocalized(pathname: string) {
  return /^\/(dashboard|admin|api|backoffice|_next|images)(\/|$)/.test(pathname) || /\.[a-z0-9]+$/i.test(pathname);
}
