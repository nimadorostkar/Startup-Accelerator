"use client";

import Link from "next/link";
import { createContext, useContext, type ComponentProps } from "react";
import { DEFAULT_LOCALE, localePath, type Locale } from "./config";

/* The page's language for client components (set by app/[lang]/layout.tsx).
   Strings themselves come from server components as props. */

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/** A site path in the page's language: "/events" → "/tr/events" on a Turkish page. */
export function useLocalePath() {
  const locale = useLocale();
  return (path: string) => localePath(locale, path);
}

/**
 * next/link that keeps the visitor in their language: href="/events" goes to
 * /tr/events on a Turkish page. Links to the English-only areas (/dashboard,
 * /admin) and other sites are left alone. Usable from server components too.
 */
export function LocalLink({ href, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const locale = useLocale();
  const english = /^\/(dashboard|admin|backoffice)(\/|$)/.test(href);
  return <Link href={english ? href : localePath(locale, href)} {...props} />;
}
