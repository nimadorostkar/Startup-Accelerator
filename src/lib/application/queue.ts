import { INDUSTRIES, STAGES, type Status } from "./types";

/* Review-queue options. Pure, so the server page and the client filter bar
   share one definition of every option. The filtering, counting, sorting and
   paging happen in the API (backend/apps/applications/queue.py), in SQL. */

export const TABS: { id: Status | "all"; label: string }[] = [
  { id: "submitted", label: "Needs review" },
  { id: "in_review", label: "In review" },
  { id: "changes_requested", label: "Changes requested" },
  { id: "accepted", label: "Accepted" },
  { id: "declined", label: "Declined" },
  { id: "draft", label: "Drafts" },
  { id: "all", label: "All" },
];

export const SORTS = [
  { id: "waiting", label: "Longest wait" },
  { id: "recent", label: "Most recent" },
  { id: "score", label: "Top score" },
  { id: "name", label: "Name A–Z" },
] as const;
export type SortId = (typeof SORTS)[number]["id"];

export type Filters = {
  status: Status | "all";
  q: string;
  stage: string;
  industry: string;
  mine: boolean;
  sort: SortId;
  /** 1-based; the API serves 50 rows per page. */
  page: number;
};

type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Reads filters from the URL, ignoring anything that isn't a known option. */
export function parseFilters(params: Params): Filters {
  const status = one(params.status);
  const sort = one(params.sort);
  const stage = one(params.stage);
  const industry = one(params.industry);
  const tab = TABS.find((t) => t.id === status)?.id ?? "submitted";
  return {
    status: tab,
    q: one(params.q).trim().slice(0, 100),
    stage: STAGES.some((s) => s.id === stage) ? stage : "",
    industry: (INDUSTRIES as readonly string[]).includes(industry) ? industry : "",
    mine: one(params.mine) === "1",
    // The work queue reads oldest-first; everything else, most recent first.
    sort: SORTS.find((s) => s.id === sort)?.id ?? (tab === "submitted" ? "waiting" : "recent"),
    page: Math.max(1, Math.min(10_000, Number.parseInt(one(params.page), 10) || 1)),
  };
}

/** Builds a queue URL, keeping the current filters unless overridden.
    Any change other than the page itself starts again from page 1. */
export function queueHref(f: Filters, change: Partial<Filters> = {}) {
  const next = { ...f, page: 1, ...change };
  const params = new URLSearchParams();
  params.set("status", next.status);
  if (next.q) params.set("q", next.q);
  if (next.stage) params.set("stage", next.stage);
  if (next.industry) params.set("industry", next.industry);
  if (next.mine) params.set("mine", "1");
  params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  return `/admin?${params}`;
}
