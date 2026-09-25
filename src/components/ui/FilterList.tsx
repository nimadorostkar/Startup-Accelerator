"use client";

import { useState, type ReactNode } from "react";

/* Filter chips over a list of server-rendered items: only the filter state
   ships as JavaScript, not the items themselves. */
export default function FilterList({
  label,
  allLabel,
  categories,
  items,
  hideOnAll,
  noun,
  emptyText,
  listClassName,
}: {
  /** Accessible name for the chip group, e.g. "Filter by topic". */
  label: string;
  allLabel: string;
  categories: readonly string[];
  items: { key: string; category: string; node: ReactNode }[];
  /** Item already featured elsewhere: left out of the "all" view only. */
  hideOnAll?: string;
  /** Singular and plural, for the screen-reader count. */
  noun: [string, string];
  emptyText: string;
  listClassName: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const shown = active
    ? items.filter((i) => i.category === active)
    : items.filter((i) => i.key !== hideOnAll);

  return (
    <>
      <div
        role="group"
        aria-label={label}
        className="snap-row mt-8 [--bleed:16px] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      >
        {[null, ...categories].map((c) => {
          const on = active === c;
          return (
            <button
              key={c ?? "all"}
              type="button"
              aria-pressed={on}
              onClick={() => setActive(c)}
              className={`h-10 rounded-full border px-5 font-display text-[13px] font-semibold whitespace-nowrap transition-colors duration-200 ${
                on
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-ink-soft hover:border-gold hover:text-gold-deep"
              }`}
            >
              {c ?? allLabel}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="sr-only">
        {shown.length} {shown.length === 1 ? noun[0] : noun[1]}
      </p>

      <ul className={listClassName}>
        {shown.map((i) => (
          <li key={i.key}>{i.node}</li>
        ))}
      </ul>
      {shown.length === 0 && (
        <p className="mt-10 text-[15px] text-muted">{emptyText}</p>
      )}
    </>
  );
}
