"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { LOCALE_INFO, LOCALES, localePath, splitLocale, type Locale } from "@/i18n/config";
import { useLocale } from "@/i18n/client";
import { CheckIcon } from "./icons";

/* Switches the public site between English, Turkish and Persian, staying on
   the same page: /events → /tr/events → /fa/events. A full page load, since
   the language changes the whole document (lang, direction, font). */

function useTargets() {
  const pathname = usePathname() || "/";
  const { path } = splitLocale(pathname);
  return (locale: Locale) => localePath(locale, path);
}

/** Keeps the query and #hash when changing language (read on click, so static pages stay static). */
function go(href: string) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    window.location.assign(href + window.location.search + window.location.hash);
  };
}

function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.7 3.9 5.7 3.9 9s-1.3 6.3-3.9 9c-2.6-2.7-3.9-5.7-3.9-9S9.4 5.7 12 3Z" strokeLinejoin="round" />
    </svg>
  );
}

/** The header's dropdown (desktop). `className` sets the text colour, like the header's links.
    A native <details>, so it opens and its links work before the page's JavaScript has loaded;
    once it has, it also closes on a click elsewhere or Escape, and keeps the query when switching. */
export default function LanguageSwitcher({ label, className = "text-ink" }: { label: string; className?: string }) {
  const locale = useLocale();
  const target = useTargets();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDetailsElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      root.current?.querySelector("summary")?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    root.current?.querySelector<HTMLAnchorElement>(`#${CSS.escape(listId)} a`)?.focus();
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, listId]);

  return (
    <details
      ref={root}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="group/lang relative"
    >
      <summary
        aria-label={`${label}: ${LOCALE_INFO[locale].label}`}
        className={`flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-full px-2.5 transition-colors duration-200 hover:text-brand focus-visible:outline-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden ${className}`}
      >
        <GlobeIcon className="h-[17px] w-[17px] shrink-0" />
        <span className="font-display text-[12px] font-bold tracking-[0.06em]">{LOCALE_INFO[locale].short}</span>
        <svg viewBox="0 0 12 12" aria-hidden="true" className="h-2.5 w-2.5 shrink-0 transition-transform duration-200 group-open/lang:rotate-180">
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      <ul
        id={listId}
        aria-label={label}
        className="menu-in absolute end-0 top-[calc(100%+8px)] z-50 w-[200px] rounded-2xl border border-line-soft bg-white p-1.5 shadow-[0_24px_60px_-24px_rgba(20,26,34,0.45)]"
      >
        {LOCALES.map((l) => {
          const current = l === locale;
          return (
            <li key={l}>
              <a
                href={target(l)}
                hrefLang={l}
                lang={l}
                dir={LOCALE_INFO[l].dir}
                aria-current={current ? "true" : undefined}
                onClick={current ? (e) => (e.preventDefault(), setOpen(false)) : go(target(l))}
                className={`flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] transition-colors duration-150 hover:bg-cream focus-visible:bg-cream focus-visible:outline-none ${
                  current ? "font-semibold text-ink" : "text-ink-soft"
                }`}
              >
                <span className="w-7 shrink-0 font-display text-[11px] font-bold tracking-[0.06em] text-muted">
                  {LOCALE_INFO[l].short}
                </span>
                <span className="flex-1">{LOCALE_INFO[l].label}</span>
                {current && <CheckIcon className="h-4 w-4 shrink-0 text-brand-strong" />}
              </a>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

/** The phone menu's version: three segments, the current one filled. */
export function LanguageSegments({ label }: { label: string }) {
  const locale = useLocale();
  const target = useTargets();
  return (
    <nav aria-label={label} className="flex rounded-full bg-cream p-1 ring-1 ring-line-soft">
      {LOCALES.map((l) => {
        const current = l === locale;
        return (
          <a
            key={l}
            href={target(l)}
            hrefLang={l}
            lang={l}
            aria-current={current ? "true" : undefined}
            onClick={current ? (e) => e.preventDefault() : go(target(l))}
            className={`flex h-10 flex-1 items-center justify-center rounded-full text-[14px] transition-colors duration-200 ${
              current ? "bg-ink font-semibold text-white shadow-[0_6px_16px_-8px_rgba(20,26,34,0.6)]" : "text-ink-soft active:bg-white"
            }`}
          >
            {LOCALE_INFO[l].label}
          </a>
        );
      })}
    </nav>
  );
}
