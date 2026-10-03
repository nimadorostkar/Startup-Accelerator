import { LOCALE_INFO, type Locale } from "./config";

/* Small helpers for translated strings. Dictionaries hold plain strings only
   (they're passed to client components), with {name} placeholders. */

/** "Hello {name}" + { name: "Ada" } → "Hello Ada". Unknown placeholders are left as they are. */
export function format(template: string, values: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole,
  );
}

/** Picks the plural form for `count` ({ one, other }; Turkish and Persian use `other` for counts). */
export function plural(locale: Locale, count: number, forms: { one: string; other: string }) {
  const rule = new Intl.PluralRules(LOCALE_INFO[locale].intl).select(count);
  return format(rule === "one" ? forms.one : forms.other, { count: formatNumber(locale, count) });
}

/** 1,200 / 1.200 / ۱٬۲۰۰, as each language writes numbers. */
export function formatNumber(locale: Locale, value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(LOCALE_INFO[locale].intl, options).format(value);
}
