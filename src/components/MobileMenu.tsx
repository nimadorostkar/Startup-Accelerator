"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "./nav-links";

export default function MobileMenu() {
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
        className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors duration-200 hover:border-ink/50"
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
          className="fixed inset-x-0 top-[64px] bottom-0 z-40 bg-white/95 backdrop-blur-md"
        >
          <nav className="flex flex-col px-6 pt-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-display border-b border-ink/10 py-4 text-[13px] font-semibold tracking-[0.14em] text-ink uppercase"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="#request"
              onClick={() => setOpen(false)}
              className="font-display bg-gold-btn mt-8 inline-flex h-12 items-center justify-center rounded-full text-[11.5px] font-bold tracking-[0.12em] text-gold-ink uppercase"
            >
              Request Invitation
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
