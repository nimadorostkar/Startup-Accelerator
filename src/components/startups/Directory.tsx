"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PUBLIC_STATUS_ORDER,
  PUBLIC_STATUSES,
  type StartupCardData,
} from "@/lib/application/directory";
import { INDUSTRIES, STAGES } from "@/lib/application/types";
import StartupCard from "./StartupCard";

export type DirectoryQuery = {
  q: string;
  status: string;
  industry: string;
  stage: string;
  sort: string;
};

const SORTS = [
  { id: "newest", label: "Newest first" },
  { id: "cohort", label: "Cohort first" },
  { id: "name", label: "Name A–Z" },
] as const;

const STATUS_RANK = Object.fromEntries(
  PUBLIC_STATUS_ORDER.map((s, i) => [s, i]),
);

function haystack(s: StartupCardData) {
  return [s.name, s.tagline, s.industry, s.country, s.stageLabel, ...s.founders]
    .join(" ")
    .toLowerCase();
}

/* Instant search and filters over the server-rendered list. The query lives
   in the URL too, so a filtered view can be shared. */
export default function Directory({
  startups,
  initial,
}: {
  startups: StartupCardData[];
  initial: DirectoryQuery;
}) {
  const [q, setQ] = useState(initial.q);
  const [status, setStatus] = useState(initial.status);
  const [industry, setIndustry] = useState(initial.industry);
  const [stage, setStage] = useState(initial.stage);
  const [sort, setSort] = useState(initial.sort || "newest");

  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    if (industry) p.set("industry", industry);
    if (stage) p.set("stage", stage);
    if (sort !== "newest") p.set("sort", sort);
    const qs = p.toString();
    window.history.replaceState(
      null,
      "",
      qs ? `?${qs}` : window.location.pathname,
    );
  }, [q, status, industry, stage, sort]);

  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (
    s: StartupCardData,
    ignore?: "status" | "industry" | "stage",
  ) =>
    (words.length === 0 || words.every((w) => haystack(s).includes(w))) &&
    (ignore === "status" || !status || s.status === status) &&
    (ignore === "industry" || !industry || s.industry === industry) &&
    (ignore === "stage" || !stage || s.stage === stage);

  const shown = useMemo(() => {
    const list = startups.filter((s) => matches(s));
    switch (sort) {
      case "name":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "cohort":
        return list.sort(
          (a, b) =>
            STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
            (b.appliedAt ?? "").localeCompare(a.appliedAt ?? ""),
        );
      default:
        return list.sort((a, b) =>
          (b.appliedAt ?? "").localeCompare(a.appliedAt ?? ""),
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startups, q, status, industry, stage, sort]);

  const count = (
    pred: (s: StartupCardData) => boolean,
    ignore: "status" | "industry" | "stage",
  ) => startups.filter((s) => matches(s, ignore) && pred(s)).length;

  const statusOptions = [
    {
      id: "",
      label: "All",
      n: startups.filter((s) => matches(s, "status")).length,
    },
    ...PUBLIC_STATUS_ORDER.map((id) => ({
      id,
      label: PUBLIC_STATUSES[id].label,
      n: count((s) => s.status === id, "status"),
    })),
  ];
  const present = new Set(startups.map((s) => s.industry));
  const industryOptions = [
    {
      id: "",
      label: "All industries",
      n: startups.filter((s) => matches(s, "industry")).length,
    },
    ...INDUSTRIES.filter((i) => present.has(i)).map((id) => ({
      id,
      label: id,
      n: count((s) => s.industry === id, "industry"),
    })),
  ];
  const presentStages = new Set(startups.map((s) => s.stage));
  const stageOptions = [
    {
      id: "",
      label: "All stages",
      n: startups.filter((s) => matches(s, "stage")).length,
    },
    ...STAGES.filter((st) => presentStages.has(st.id)).map((st) => ({
      id: st.id,
      label: st.label,
      n: count((s) => s.stage === st.id, "stage"),
    })),
  ];

  const active = q || status || industry || stage;
  const clear = () => {
    setQ("");
    setStatus("");
    setIndustry("");
    setStage("");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[272px_minmax(0,1fr)] lg:gap-12">
      <aside className="lg:sticky lg:top-8 lg:self-start">
        <label className="relative block">
          <span className="sr-only">Search startups</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-muted"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4.2-4.2" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search startups, founders, countries"
            className="field-input h-12 rounded-full pl-11 shadow-[0_18px_40px_-28px_rgba(0,15,22,0.35)]"
          />
        </label>

        <FilterGroup
          label="Status"
          value={status}
          onChange={setStatus}
          options={statusOptions}
        />
        <FilterGroup
          label="Industry"
          value={industry}
          onChange={setIndustry}
          options={industryOptions}
        />
        <FilterGroup
          label="Stage"
          value={stage}
          onChange={setStage}
          options={stageOptions}
        />

        {active && (
          <button
            type="button"
            onClick={clear}
            className="mt-6 hidden text-[13px] font-semibold text-muted underline-offset-4 hover:text-ink hover:underline lg:block"
          >
            Clear all filters
          </button>
        )}
      </aside>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-[14px] text-muted">
            <span className="font-semibold text-ink">{shown.length}</span>{" "}
            {shown.length === 1 ? "startup" : "startups"}
            {active && (
              <>
                {" "}
                ·{" "}
                <button
                  type="button"
                  onClick={clear}
                  className="font-semibold text-gold-deep underline-offset-4 hover:underline"
                >
                  Clear filters
                </button>
              </>
            )}
          </p>
          <label className="flex items-center gap-2 text-[13px] text-muted">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="field-input h-10 w-auto rounded-full pr-10 pl-4 text-[13px] font-semibold text-ink"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {shown.length > 0 ? (
          <ul className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {shown.map((s) => (
              <li key={s.slug}>
                <StartupCard s={s} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-[18px] border border-dashed border-line px-6 py-16 text-center">
            <p className="font-display text-[20px] font-bold text-ink">
              No startups match
            </p>
            <p className="mt-2 text-[14px] text-muted">
              Try another word, or clear the filters to see everything.
            </p>
            <button
              type="button"
              onClick={clear}
              className="mt-6 h-11 rounded-full border border-line bg-white px-6 font-display text-[12px] font-bold tracking-[0.06em] text-ink uppercase transition-colors hover:border-gold"
            >
              Show all startups
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string; n: number }[];
}) {
  return (
    <div role="group" aria-label={label} className="mt-6">
      <p className="font-display text-[11px] font-bold tracking-[0.16em] text-muted uppercase">
        {label}
      </p>
      <div className="snap-row mt-3 [--bleed:16px] lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
        {options.map((o) => {
          const on = value === o.id;
          return (
            <button
              key={o.id || "all"}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? "" : o.id)}
              className={`flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors duration-200 lg:h-10 lg:w-full lg:justify-between lg:rounded-xl lg:px-3 ${
                on
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-ink-soft hover:border-gold hover:text-gold-deep lg:border-transparent lg:bg-transparent lg:hover:bg-white"
              }`}
            >
              <span className="truncate">{o.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] leading-none tabular-nums ${
                  on ? "bg-white/15 text-white" : "bg-cream text-muted"
                }`}
              >
                {o.n}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
