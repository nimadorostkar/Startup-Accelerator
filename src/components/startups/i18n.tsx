import { LOCALE_INFO, type Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";

/* Helpers for the startup pages in the visitor's language. Stored values
   (industries, stages, statuses…) stay English for filtering and addresses;
   these turn them into the words shown. Client-safe. */

export type StartupOptions = Messages["startups"]["options"];

/** A stored option's label in the page's language, or the value as written (an old or unknown value). */
export function optionLabel(labels: object, value: string) {
  return (labels as Record<string, string>)[value] ?? value;
}

/** The stage's label, or "" when it isn't set. */
export function stageName(options: StartupOptions, stage: string) {
  return stage ? optionLabel(options.stages, stage) : "";
}

/** "2025-06" → "Jun 2025" / "Haz 2025" / "خرداد ۱۴۰۴" */
export function monthIn(locale: Locale, ym: string) {
  if (!/^\d{4}-\d{2}$/.test(ym)) return "";
  return new Date(`${ym}-15T00:00:00Z`).toLocaleDateString(LOCALE_INFO[locale].intl, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "Jun 3, 2026" in the page's language. */
export function dayIn(locale: Locale, iso: string) {
  return new Date(iso).toLocaleDateString(LOCALE_INFO[locale].intl, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** 1500 → "1.5K" / "1,5 B" / "۱٫۵ هزار" */
export function compactIn(locale: Locale, n: number) {
  return new Intl.NumberFormat(LOCALE_INFO[locale].intl, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** The { one, other } form for `count`, placeholders left in (for rich()). */
export function pluralForm(locale: Locale, count: number, forms: { one: string; other: string }) {
  return new Intl.PluralRules(LOCALE_INFO[locale].intl).select(count) === "one" ? forms.one : forms.other;
}

export { rich } from "@/i18n/rich";
