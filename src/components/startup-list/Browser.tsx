"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  compact,
  PUBLIC_STATUSES,
  type PublicStatus,
} from "@/lib/application/directory";
import { ArrowRight } from "../icons";
import Reveal from "../motion/Reveal";
import Monogram from "../startups/Monogram";

/* The landing page's startup list: status filters, a ranked two-column list
   that grows with "Load more", and a link through to the full directory.
   Data comes from StartupList (server). */

export type ListItem = {
  slug: string;
  name: string;
  logo: string;
  tagline: string;
  industry: string;
  stageLabel: string;
  country: string;
  status: PublicStatus;
  users: number | null;
  /** Applied within the last week */
  isNew: boolean;
};

const PAGE = 8;
const FILTERS: { id: PublicStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "cohort", label: PUBLIC_STATUSES.cohort.label },
  { id: "review", label: PUBLIC_STATUSES.review.label },
  { id: "applied", label: PUBLIC_STATUSES.applied.label },
];

function TagIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1 1 0 0 1 0 1.4l-7.3 7.3a1 1 0 0 1-1.4 0Z" />
      <circle cx="8" cy="8" r="1.4" />
    </svg>
  );
}

function Pill({ s }: { s: ListItem }) {
  if (s.status === "cohort")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-light/70 px-2 py-[3px] text-[11px] leading-none font-semibold text-green-deep">
        <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
          <span className="motion-only absolute inset-0 animate-ping rounded-full bg-green opacity-60" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-green" />
        </span>
        In the cohort
      </span>
    );
  if (s.status === "review")
    return (
      <span className="inline-flex items-center rounded-full bg-chip px-2 py-[3px] text-[11px] leading-none font-semibold text-brand-strong">
        In review
      </span>
    );
  if (s.isNew)
    return (
      <span className="inline-flex items-center rounded-full bg-ink px-2 py-[3px] text-[11px] leading-none font-semibold text-white">
        New
      </span>
    );
  return null;
}

function Row({ s, rank }: { s: ListItem; rank: number }) {
  // Country only from sm up: on phones it would wrap onto a line of its own
  const tags = [
    { text: s.industry, wide: false },
    { text: s.stageLabel !== "Not set" ? s.stageLabel : "", wide: false },
    { text: s.country, wide: true },
  ].filter((t) => t.text);

  return (
    <article className="group relative flex h-full items-start gap-4 rounded-2xl p-3 transition-colors duration-300 hover:bg-cream has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-brand sm:gap-5 sm:p-4">
      {/* Accent bar that grows on hover */}
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-0 h-0 w-[3px] -translate-y-1/2 rounded-full bg-brand transition-[height] duration-300 ease-out group-hover:h-10"
      />

      <span className="relative mt-0.5 shrink-0">
        <Monogram
          name={s.name}
          logo={s.logo}
          className="relative h-12 w-12 overflow-hidden rounded-[14px] text-[16px] transition-transform duration-500 ease-[cubic-bezier(0.34,1.8,0.64,1)] group-hover:scale-[1.06] group-hover:-rotate-6 sm:h-14 sm:w-14 sm:text-[18px]"
        />
        {/* Light sweep across the tile on hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[14px]"
        >
          <span className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent transition-[left] duration-700 ease-out group-hover:left-[130%]" />
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <h3 className="font-display text-[16px] leading-snug font-bold tracking-[-0.01em] text-ink sm:text-[17px]">
            <Link
              href={`/startups/${s.slug}`}
              className="transition-colors duration-200 group-hover:text-brand-strong after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none!"
            >
              <span className="text-ink/35 tabular-nums transition-colors duration-200 group-hover:text-brand">
                {rank}.
              </span>{" "}
              {s.name}
            </Link>
          </h3>
          <Pill s={s} />
        </div>
        <p className="mt-1 line-clamp-2 text-[14px] leading-snug text-ink-soft/80 sm:text-[15px]">
          {s.tagline || "One-line pitch coming soon."}
        </p>
        {tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[13px] text-ink-soft/85 sm:text-[13.5px]">
            <TagIcon className="h-4 w-4 shrink-0 text-muted transition-colors duration-300 group-hover:text-brand" />
            {tags.map((t, i) => (
              <span
                key={t.text}
                className={`flex items-center gap-2.5 ${t.wide ? "max-sm:hidden" : ""}`}
              >
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="h-[3px] w-[3px] rounded-full bg-muted/50"
                  />
                )}
                {t.text}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Traction, swapped for an arrow on hover */}
      <span className="relative hidden h-9 shrink-0 items-center self-center sm:flex">
        {s.users !== null && (
          <span className="text-right text-[12px] leading-tight text-muted transition-opacity duration-300 group-hover:opacity-0">
            <span className="block font-display text-[15px] font-bold text-ink tabular-nums">
              {compact(s.users)}
            </span>
            users
          </span>
        )}
        <span
          aria-hidden="true"
          className="absolute right-0 flex h-9 w-9 -translate-x-2 items-center justify-center rounded-full border border-brand bg-white text-brand-strong opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100"
        >
          <ArrowRight className="h-4 w-4" />
        </span>
      </span>
    </article>
  );
}

export default function Browser({ items }: { items: ListItem[] }) {
  const [filter, setFilter] = useState<PublicStatus | "all">("all");
  const [shown, setShown] = useState(PAGE);
  const firstNew = useRef<number | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    for (const s of items) c[s.status] = (c[s.status] ?? 0) + 1;
    return c;
  }, [items]);
  const list = useMemo(
    () => (filter === "all" ? items : items.filter((s) => s.status === filter)),
    [items, filter],
  );
  const visible = list.slice(0, shown);
  const left = list.length - visible.length;
  const browseHref = filter === "all" ? "/startups" : `/startups?status=${filter}`;

  // After "Load more", move keyboard focus to the first new startup
  useEffect(() => {
    if (firstNew.current === null) return;
    const link = listRef.current?.querySelector<HTMLAnchorElement>(
      `[data-row="${firstNew.current}"] a`,
    );
    link?.focus({ preventScroll: true });
    firstNew.current = null;
  }, [shown]);

  return (
    <>
      {/* Filters */}
      <div
        role="group"
        aria-label="Filter startups"
        className="snap-row gap-2 pb-1 [--bleed:16px] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      >
        {FILTERS.filter((f) => f.id === "all" || counts[f.id]).map((f) => {
          const on = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setFilter(f.id);
                setShown(PAGE);
              }}
              className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold whitespace-nowrap transition-[background-color,border-color,color] duration-200 ${
                on
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-ink-soft hover:border-brand hover:text-brand-strong"
              }`}
            >
              {f.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] leading-none tabular-nums ${
                  on ? "bg-white/15 text-white" : "bg-cream text-muted"
                }`}
              >
                {counts[f.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="relative mt-5">
        <div
          aria-hidden="true"
          className="absolute -inset-x-10 -top-10 -bottom-6 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(239,111,35,0.12),transparent)] blur-2xl"
        />
        <div className="rounded-[24px] border border-line-soft bg-white p-2 shadow-[0_1px_2px_rgba(20,26,34,0.03),0_30px_70px_-45px_rgba(20,26,34,0.3)] sm:p-3">
          {visible.length > 0 ? (
            <ol
              key={filter}
              ref={listRef}
              className="grid gap-1 lg:grid-cols-2 lg:gap-x-6 lg:bg-[linear-gradient(var(--line-soft),var(--line-soft))] lg:bg-[length:1px_calc(100%-32px)] lg:bg-center lg:bg-no-repeat"
            >
              {visible.map((s, i) => (
                <Reveal
                  key={s.slug}
                  as="li"
                  // Each batch staggers from its own first row
                  delay={(i % PAGE) * 55}
                  y={18}
                >
                  <div data-row={i} className="h-full">
                    <Row s={s} rank={i + 1} />
                  </div>
                </Reveal>
              ))}
            </ol>
          ) : (
            <p className="px-6 py-12 text-center text-[15px] text-ink-soft/75">
              No startups here yet.
            </p>
          )}

          {/* Progress + actions */}
          {list.length > 0 && (
            <div className="mt-2 flex flex-col items-center gap-4 border-t border-line-soft px-3 pt-5 pb-3 sm:flex-row sm:justify-between sm:px-4">
              <div className="w-full sm:max-w-[260px]">
                <p
                  aria-live="polite"
                  className="text-[13px] text-muted tabular-nums"
                >
                  Showing{" "}
                  <span className="font-semibold text-ink">
                    {visible.length}
                  </span>{" "}
                  of {list.length}{" "}
                  {list.length === 1 ? "startup" : "startups"}
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-cream">
                  <div
                    className="h-full rounded-full bg-brand transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ width: `${(visible.length / list.length) * 100}%` }}
                  />
                </div>
              </div>

              {left > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    firstNew.current = visible.length;
                    setShown((n) => n + PAGE);
                  }}
                  className="group inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-line bg-white px-6 text-[14px] font-semibold text-ink transition-[border-color,color,translate] duration-200 hover:-translate-y-0.5 hover:border-brand hover:text-brand-strong sm:w-auto"
                >
                  Load more
                  <span className="rounded-full bg-cream px-2 py-0.5 text-[12px] text-muted tabular-nums transition-colors duration-200 group-hover:bg-chip group-hover:text-brand-strong">
                    {Math.min(PAGE, left)} of {left}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              ) : (
                <Link
                  href={browseHref}
                  className="group inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-line bg-white px-6 text-[14px] font-semibold text-ink transition-[border-color,color,translate] duration-200 hover:-translate-y-0.5 hover:border-brand hover:text-brand-strong sm:w-auto"
                >
                  {list.length > PAGE
                    ? "That's everyone. Search the directory"
                    : "Search the full directory"}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
