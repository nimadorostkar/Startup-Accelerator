"use client";

import { useId, useState } from "react";

export type QA = { q: string; a: string };

export default function Accordion({ items }: { items: QA[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();

  return (
    <div className="card overflow-hidden">
      {items.map(({ q, a }, i) => {
        const isOpen = open === i;
        const btn = `${base}-q${i}`;
        const panel = `${base}-a${i}`;
        return (
          <div key={q} className="border-b border-line-soft last:border-b-0">
            <h3>
              <button
                id={btn}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors duration-200 hover:bg-cream/60"
              >
                <span className="text-[16px] font-semibold text-ink sm:text-[17px]">
                  {q}
                </span>
                <span
                  aria-hidden="true"
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-[rotate,background-color,border-color,color] duration-300 ${
                    isOpen
                      ? "rotate-180 border-gold bg-gold text-gold-ink"
                      : "border-line-soft text-muted group-hover:border-gold group-hover:text-gold-deep"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={panel}
              role="region"
              aria-labelledby={btn}
              className={`grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <p className="px-6 pb-6 text-[15px] leading-[1.7] text-ink-soft/75">
                  {a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
