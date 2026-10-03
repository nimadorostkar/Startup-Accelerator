"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/i18n/client";
import { formatNumber } from "@/i18n/format";
import type { Messages } from "@/i18n/messages";
import {
  PUBLIC_STATUS_ORDER,
  type StartupCardData,
} from "@/lib/application/directory";
import { INDUSTRIES, STAGES } from "@/lib/application/types";
import {
  optionLabel,
  pluralForm,
  rich,
  stageName,
  type StartupOptions,
} from "./i18n";
import StartupCard from "./StartupCard";

export type DirectoryQuery = {
  q: string;
  status: string;
  industry: string;
  stage: string;
  sort: string;
};

const SORTS = [
  { id: "newest", label: "sortNewest" },
  { id: "cohort", label: "sortCohort" },
  { id: "name", label: "sortName" },
] as const;

const SORT_IDS = SORTS.map((s) => s.id);
const STAGE_IDS = STAGES.map((s) => s.id);

const STATUS_RANK = Object.fromEntries(
  PUBLIC_STATUS_ORDER.map((s, i) => [s, i]),
);

/** A filter from the URL as one of the known values (any case), or "" if it
    isn't one: an unknown value would only show "0 startups". */
function known(value: string, allowed: readonly string[]) {
  const v = value.trim().toLowerCase();
  return allowed.find((a) => a.toLowerCase() === v) ?? "";
}

/** What a search looks through: the English values and the shown labels. */
function haystack(s: StartupCardData, options: StartupOptions) {
  return [
    s.name,
    s.tagline,
    s.industry,
    optionLabel(options.industries, s.industry),
    s.country,
    s.stageLabel,
    stageName(options, s.stage),
    ...s.founders,
  ]
    .join(" ")
    .toLocaleLowerCase();
}

/* Instant search and filters over the server-rendered list. The query lives
   in the URL too, so a filtered view can be shared. */
export default function Directory({
  startups,
  initial,
  t,
}: {
  startups: StartupCardData[];
  initial: DirectoryQuery;
  t: Pick<Messages["startups"], "filters" | "card" | "options">;
}) {
  const locale = useLocale();
  const f = t.filters;
  const [q, setQ] = useState(initial.q);
  const [status, setStatus] = useState(() =>
    known(initial.status, PUBLIC_STATUS_ORDER),
  );
  const [industry, setIndustry] = useState(() =>
    known(initial.industry, INDUSTRIES),
  );
  const [stage, setStage] = useState(() => known(initial.stage, STAGE_IDS));
  const [sort, setSort] = useState(
    () => known(initial.sort, SORT_IDS) || "newest",
  );

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

  const words = q.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const matches = (
    s: StartupCardData,
    ignore?: "status" | "industry" | "stage",
  ) =>
    (words.length === 0 || words.every((w) => haystack(s, t.options).includes(w))) &&
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
      label: f.all,
      n: startups.filter((s) => matches(s, "status")).length,
    },
    ...PUBLIC_STATUS_ORDER.map((id) => ({
      id,
      label: t.options.statuses[id],
      n: count((s) => s.status === id, "status"),
    })),
  ];
  const present = new Set(startups.map((s) => s.industry));
  const industryOptions = [
    {
      id: "",
      label: f.allIndustries,
      n: startups.filter((s) => matches(s, "industry")).length,
    },
    ...INDUSTRIES.filter((i) => present.has(i)).map((id) => ({
      id,
      label: optionLabel(t.options.industries, id),
      n: count((s) => s.industry === id, "industry"),
    })),
  ];
  const presentStages = new Set(startups.map((s) => s.stage));
  const stageOptions = [
    {
      id: "",
      label: f.allStages,
      n: startups.filter((s) => matches(s, "stage")).length,
    },
    ...STAGES.filter((st) => presentStages.has(st.id)).map((st) => ({
      id: st.id,
      label: t.options.stages[st.id],
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
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[272px_minmax(0,1fr)] lg:gap-12">
      <aside className="min-w-0 lg:sticky lg:top-8 lg:self-start">
        <label className="relative block">
          <span className="sr-only">{f.searchLabel}</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
            className="pointer-events-none absolute start-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4.2-4.2" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={f.searchPlaceholder}
            className="field-input h-12 rounded-full ps-11 shadow-[0_18px_40px_-28px_rgba(20,26,34,0.35)]"
          />
        </label>

        <FilterGroup
          label={f.status}
          value={status}
          onChange={setStatus}
          options={statusOptions}
        />
        <FilterGroup
          label={f.industry}
          value={industry}
          onChange={setIndustry}
          options={industryOptions}
        />
        <FilterGroup
          label={f.stage}
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
            {f.clearAll}
          </button>
        )}
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-[14px] text-muted">
            {rich(pluralForm(locale, shown.length, f.count), {
              count: (
                <span className="font-semibold text-ink">
                  {formatNumber(locale, shown.length)}
                </span>
              ),
            })}
            {active && (
              <>
                {" "}
                ·{" "}
                <button
                  type="button"
                  onClick={clear}
                  className="font-semibold text-brand-strong underline-offset-4 hover:underline"
                >
                  {f.clear}
                </button>
              </>
            )}
          </p>
          <label className="flex items-center gap-2 text-[13px] text-muted">
            {f.sort}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="field-input h-10 w-auto rounded-full ps-4 pe-10 text-[13px] font-semibold text-ink"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {f[s.label]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {shown.length > 0 ? (
          <ul className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {shown.map((s) => (
              <li key={s.slug} className="min-w-0">
                <StartupCard s={s} t={t} locale={locale} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-[18px] border border-dashed border-line px-6 py-16 text-center">
            <p className="font-display text-[20px] font-bold text-ink">
              {f.noMatchTitle}
            </p>
            <p className="mt-2 text-[14px] text-muted">
              {f.noMatchBody}
            </p>
            <button
              type="button"
              onClick={clear}
              className="mt-6 h-11 rounded-full border border-line bg-white px-6 font-display text-[12px] font-bold tracking-[0.06em] text-ink uppercase transition-colors hover:border-brand"
            >
              {f.showAll}
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
  const locale = useLocale();
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
                  : "border-line bg-white text-ink-soft hover:border-brand hover:text-brand-strong lg:border-transparent lg:bg-transparent lg:hover:bg-white"
              }`}
            >
              <span className="truncate">{o.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] leading-none tabular-nums ${
                  on ? "bg-white/15 text-white" : "bg-cream text-muted"
                }`}
              >
                {formatNumber(locale, o.n)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
