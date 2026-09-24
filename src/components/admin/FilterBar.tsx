"use client";

import Form from "next/form";
import Link from "next/link";
import { useRef } from "react";
import { SORTS, type Filters } from "@/lib/application/queue";
import { INDUSTRIES, STAGES } from "@/lib/application/types";

/* Filters live in the URL (a GET form), so a filtered view can be shared or
   bookmarked. Selects apply as soon as they change; search applies on Enter. */
export default function FilterBar({ filters }: { filters: Filters }) {
  const form = useRef<HTMLFormElement>(null);
  const apply = () => form.current?.requestSubmit();
  const active = filters.q || filters.stage || filters.industry || filters.mine;

  return (
    <Form
      ref={form}
      action="/admin"
      className="card flex flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-center"
    >
      <input type="hidden" name="status" value={filters.status} />

      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search startups, founders or emails</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-muted"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-4.2-4.2" />
        </svg>
        <input
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="Search startup, founder or email"
          className="field-input h-11 pl-10"
        />
      </label>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex lg:items-center">
        <Select name="stage" label="Stage" value={filters.stage} onChange={apply}>
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
        <Select name="industry" label="Industry" value={filters.industry} onChange={apply}>
          <option value="">All industries</option>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </Select>
        <Select name="sort" label="Sort" value={filters.sort} onChange={apply}>
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
        <label className="flex h-11 items-center gap-2.5 rounded-xl border border-line bg-white px-3 text-[14px] whitespace-nowrap text-ink-soft">
          <input type="checkbox" name="mine" value="1" defaultChecked={filters.mine} onChange={apply} className="field-check" />
          Assigned to me
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="h-11 flex-1 rounded-full bg-ink px-5 text-[13px] font-semibold text-white hover:bg-ink-soft lg:flex-none"
        >
          Search
        </button>
        {active && (
          <Link
            href={`/admin?status=${filters.status}`}
            className="flex h-11 items-center rounded-full px-4 text-[13px] font-semibold text-muted hover:text-ink"
          >
            Clear
          </Link>
        )}
      </div>
    </Form>
  );
}

function Select({
  name,
  label,
  value,
  onChange,
  children,
}: {
  name: string;
  label: string;
  value: string;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className="min-w-0">
      <span className="sr-only">{label}</span>
      <select name={name} defaultValue={value} onChange={onChange} className="field-input h-11 text-[14px] lg:w-44">
        {children}
      </select>
    </label>
  );
}
