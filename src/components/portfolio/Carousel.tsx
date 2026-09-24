"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight } from "../icons";

export default function Carousel({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const n = max > 2 ? Math.ceil(max / el.clientWidth) + 1 : 1;
    setPages(n);
    setPage(max > 0 ? Math.round((el.scrollLeft / max) * (n - 1)) : 0);
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", measure);
    };
  }, [measure]);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const w = card ? card.getBoundingClientRect().width + gap : el.clientWidth;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: (max * i) / Math.max(1, pages - 1), behavior: "smooth" });
  };

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-4">
        <p className="type-wide hidden text-[11px] font-semibold tracking-[0.26em] text-ink-soft uppercase sm:block">
          {label}
        </p>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden items-center gap-1.5 sm:flex">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to page ${i + 1}`}
                aria-current={i === page}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                  i === page ? "w-5 bg-gold" : "w-1.5 bg-ink/15 hover:bg-ink/30"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Previous founders"
            disabled={atStart}
            onClick={() => step(-1)}
            className="group flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink transition-[border-color,opacity] duration-200 hover:border-gold disabled:opacity-40 disabled:hover:border-line"
          >
            <ArrowRight className="h-[18px] w-[18px] rotate-180 transition-transform duration-200 group-enabled:group-hover:-translate-x-0.5" />
          </button>
          <button
            type="button"
            aria-label="Next founders"
            disabled={atEnd}
            onClick={() => step(1)}
            className="group flex h-11 w-11 items-center justify-center rounded-full bg-gold-btn text-gold-ink shadow-[0_10px_24px_-10px_rgba(214,150,67,0.9)] transition-[filter,opacity] duration-200 hover:brightness-105 disabled:opacity-40"
          >
            <ArrowRight className="h-[18px] w-[18px] transition-transform duration-200 group-enabled:group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      <ul
        ref={track}
        aria-label={label}
        tabIndex={0}
        style={{
          maskImage: `linear-gradient(90deg, ${atStart ? "#000" : "transparent"}, #000 ${atStart ? "0%" : "6%"}, #000 ${atEnd ? "100%" : "88%"}, ${atEnd ? "#000" : "transparent"})`,
        }}
        className="-mx-3 mt-6 flex snap-x snap-mandatory scroll-px-3 gap-4 overflow-x-auto px-3 pt-2 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
    </div>
  );
}
