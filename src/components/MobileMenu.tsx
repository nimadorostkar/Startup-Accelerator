"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { LocalLink as Link } from "@/i18n/client";
import type { Messages } from "@/i18n/messages";
import { ArrowRight } from "./icons";
import { LanguageSegments } from "./LanguageSwitcher";

export default function MobileMenu({
  buttonClassName = "text-ink",
  links,
  t,
}: {
  buttonClassName?: string;
  links: { href: string; label: string }[];
  t: Messages["common"]["header"] & { navLabel: string; languageLabel: string };
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? t.closeMenu : t.openMenu}
        className={`flex h-11 w-11 items-center justify-center rounded-full border border-current/25 transition-colors duration-200 hover:border-current/60 ${buttonClassName}`}
      >
        <span className="relative block h-3.5 w-5">
          <span
            className={`absolute start-0 block h-[1.5px] w-full bg-current transition-transform duration-200 ${
              open ? "top-1.5 rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute top-1.5 start-0 block h-[1.5px] w-full bg-current transition-opacity duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute start-0 block h-[1.5px] w-full bg-current transition-transform duration-200 ${
              open ? "top-1.5 -rotate-45" : "top-3"
            }`}
          />
        </span>
      </button>

      {open && (
        <div
          id="mobile-nav"
          className="menu-in fixed inset-x-0 top-[64px] bottom-0 z-40 overflow-y-auto overscroll-contain bg-white"
        >
          <nav
            aria-label={t.navLabel}
            className="flex min-h-full flex-col px-6 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            <ul>
              {links.map((link, i) => (
                <li
                  key={link.href}
                  className="menu-item"
                  style={{ "--i": i } as CSSProperties}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between border-b border-ink/10 py-4 font-display text-[22px] leading-tight font-bold tracking-[-0.01em] text-ink transition-colors duration-200 active:text-brand-strong"
                  >
                    {link.label}
                    <ArrowRight className="h-5 w-5 shrink-0 text-brand-strong transition-transform duration-200 group-active:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>

            <div
              className="menu-item mt-auto pt-8"
              style={{ "--i": links.length } as CSSProperties}
            >
              <div className="mb-8">
                <LanguageSegments label={t.languageLabel} />
              </div>
              <p className="flex items-center gap-2.5 text-[11px]">
                <span
                  aria-hidden="true"
                  className="h-[1em] w-[1em] shrink-0 rounded-full bg-brand"
                />
                <span className="font-display font-semibold tracking-[0.18em] text-brand-strong uppercase">
                  {t.registrationOpen}
                </span>
              </p>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="mt-4 flex h-14 items-center justify-center gap-3 rounded-full bg-brand-strong font-display text-[13px] font-bold tracking-[0.06em] text-white uppercase shadow-[0_16px_38px_-16px_rgba(194,71,10,0.85)]"
              >
                {t.applyNow}
                <ArrowRight className="h-[18px] w-[18px] shrink-0" />
              </Link>
              <p className="mt-4 text-center text-[14px] text-muted">
                {t.haveAccount}{" "}
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="font-semibold text-brand-strong"
                >
                  {t.signIn}
                </Link>
              </p>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
