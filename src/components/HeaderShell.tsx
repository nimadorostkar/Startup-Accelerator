"use client";

import { useEffect, useState, type ReactNode } from "react";

/* Below lg the bar is pinned: it gains a frosted background once the page
   scrolls, slides away while scrolling down and returns on the way back up.
   From lg up it stays absolutely positioned over the hero, as designed. */
export default function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      setPastHero(y > window.innerHeight * 0.7);
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 320);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled || undefined}
      data-past-hero={pastHero || undefined}
      data-hidden={hidden || undefined}
      className="group/header inset-x-0 top-0 z-30 transition-[translate] duration-300 ease-out max-lg:fixed max-lg:data-[hidden]:-translate-y-full max-lg:has-[[aria-expanded=true]]:translate-none lg:absolute"
    >
      {/* Frosted bar (a sibling, not an ancestor, so the fixed menu isn't clipped by backdrop-filter) */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[64px] bg-white/85 opacity-0 shadow-[0_8px_24px_-18px_rgba(0,15,22,0.35)] backdrop-blur-md transition-opacity duration-300 group-has-[[aria-expanded=true]]/header:bg-white group-has-[[aria-expanded=true]]/header:opacity-100 group-data-[scrolled]/header:opacity-100 lg:hidden"
      />
      {children}
    </header>
  );
}
