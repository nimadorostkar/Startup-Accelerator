import type { QueueRow } from "./review";
import { INDUSTRIES, STAGES, type Status } from "./types";

/* Review-queue filtering and sorting. Pure, so the server page and the
   client filter bar share one definition of every option. */

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
  { id: "waiting", label: "Waiting longest" },
  { id: "recent", label: "Recently active" },
  { id: "score", label: "Highest score" },
  { id: "name", label: "Startup A–Z" },
] as const;
export type SortId = (typeof SORTS)[number]["id"];

export type Filters = {
  status: Status | "all";
  q: string;
  stage: string;
  industry: string;
  mine: boolean;
  sort: SortId;
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
  };
}

export function applyFilters(rows: QueueRow[], f: Filters, reviewerId: string) {
  const q = f.q.toLowerCase();
  const matches = rows.filter(
    (r) =>
      (!q || [r.startup, r.founder, r.email, r.tagline].some((t) => t.toLowerCase().includes(q))) &&
      (!f.stage || r.stage === f.stage) &&
      (!f.industry || r.industry === f.industry) &&
      (!f.mine || r.assigneeId === reviewerId),
  );

  // Counts per tab respect the search filters, so the tabs tell you where results are.
  const counts = Object.fromEntries(
    TABS.map((t) => [t.id, t.id === "all" ? matches.length : matches.filter((r) => r.status === t.id).length]),
  ) as Record<Filters["status"], number>;

  const inTab = f.status === "all" ? matches : matches.filter((r) => r.status === f.status);
  const byTime = (s: string | null) => (s ? new Date(s).getTime() : Infinity);
  const sorted = [...inTab].sort((a, b) => {
    switch (f.sort) {
      case "waiting":
        return byTime(a.submittedAt) - byTime(b.submittedAt);
      case "score":
        return (b.score ?? -1) - (a.score ?? -1);
      case "name":
        return (a.startup || "~").localeCompare(b.startup || "~");
      default:
        return byTime(b.updatedAt) - byTime(a.updatedAt);
    }
  });

  return { rows: sorted, counts };
}

/** Builds a queue URL, keeping the current filters unless overridden. */
export function queueHref(f: Filters, change: Partial<Filters> = {}) {
  const next = { ...f, ...change };
  const params = new URLSearchParams();
  params.set("status", next.status);
  if (next.q) params.set("q", next.q);
  if (next.stage) params.set("stage", next.stage);
  if (next.industry) params.set("industry", next.industry);
  if (next.mine) params.set("mine", "1");
  params.set("sort", next.sort);
  return `/admin?${params}`;
}
