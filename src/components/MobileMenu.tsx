"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { ArrowRight } from "./icons";
import { NAV_LINKS } from "./nav-links";

export default function MobileMenu({
  buttonClassName = "text-ink",
}: {
  buttonClassName?: string;
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
        aria-label={open ? "Close menu" : "Open menu"}
        className={`flex h-11 w-11 items-center justify-center rounded-full border border-current/25 transition-colors duration-200 hover:border-current/60 ${buttonClassName}`}
      >
        <span className="relative block h-3.5 w-5">
          <span
            className={`absolute left-0 block h-[1.5px] w-full bg-current transition-transform duration-200 ${
              open ? "top-1.5 rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute top-1.5 left-0 block h-[1.5px] w-full bg-current transition-opacity duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 block h-[1.5px] w-full bg-current transition-transform duration-200 ${
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
            aria-label="Mobile"
            className="flex min-h-full flex-col px-6 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            <ul>
              {NAV_LINKS.map((link, i) => (
                <li
                  key={link.label}
                  className="menu-item"
                  style={{ "--i": i } as CSSProperties}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between border-b border-ink/10 py-4 font-display text-[22px] leading-tight font-bold tracking-[-0.01em] text-ink transition-colors duration-200 active:text-gold-deep"
                  >
                    {link.label}
                    <ArrowRight className="h-5 w-5 shrink-0 text-gold-deep transition-transform duration-200 group-active:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>

            <div
              className="menu-item mt-auto pt-8"
              style={{ "--i": NAV_LINKS.length } as CSSProperties}
            >
              <p className="flex items-center gap-2.5 text-[11px]">
                <span
                  aria-hidden="true"
                  className="h-[1em] w-[1em] shrink-0 rounded-full bg-gold"
                />
                <span className="font-display font-semibold tracking-[0.18em] text-gold-deep uppercase">
                  Registration open &middot; 2026
                </span>
              </p>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="mt-4 flex h-14 items-center justify-center gap-3 rounded-full bg-gold-btn font-display text-[13px] font-bold tracking-[0.06em] text-gold-ink uppercase shadow-[0_16px_38px_-16px_rgba(214,150,67,0.85)]"
              >
                Apply Now
                <ArrowRight className="h-[18px] w-[18px] shrink-0" />
              </Link>
              <p className="mt-4 text-center text-[14px] text-muted">
                Already have an account?{" "}
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="font-semibold text-gold-deep"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
