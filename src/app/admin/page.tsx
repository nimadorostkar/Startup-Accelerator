import type { Metadata } from "next";
import Link from "next/link";
import FilterBar from "@/components/admin/FilterBar";
import { AlertIcon } from "@/components/icons";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { REVIEW_SLA_DAYS } from "@/lib/application/decisions";
import { applyFilters, parseFilters, queueHref, TABS } from "@/lib/application/queue";
import { listForReview, requireReviewer, type QueueRow } from "@/lib/application/review";
import { formatMoney, stageLabel } from "@/lib/application/types";

// The layout's title template only applies to child segments, not this page.
// Generated after the reviewer check, like the layout's.
export async function generateMetadata(): Promise<Metadata> {
  await requireReviewer();
  return { title: { absolute: "Review queue — VC Summit Review" } };
}

const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export default async function QueuePage({ searchParams }: PageProps<"/admin">) {
  const reviewer = await requireReviewer();
  const filters = parseFilters(await searchParams);
  const all = await listForReview();
  const { rows, counts } = applyFilters(all, filters, reviewer.id);

  const waiting = all.filter((r) => r.status === "submitted").length;
  const overdue = all.filter((r) => r.overdue).length;
  const mine = all.filter((r) => r.assigneeId === reviewer.id && r.status === "in_review").length;

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="type-wide text-[11px] font-semibold tracking-[0.18em] text-gold-deep uppercase">Support team</p>
          <h1 className="mt-2 font-display text-[28px] leading-[1.1] font-bold tracking-[-0.02em] text-ink sm:text-[34px]">
            Review queue
          </h1>
          <p className="mt-2 text-[15px] text-ink-soft/80">
            {waiting === 0
              ? "Nothing waiting for review right now."
              : `${waiting} waiting for review · ${mine} in review with you`}
          </p>
        </div>
        <a
          href="/admin/export"
          className="inline-flex h-10 items-center self-start rounded-full border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-gold sm:self-auto"
        >
          Export all as CSV
        </a>
      </header>

      {overdue > 0 && (
        <Link
          href={queueHref(filters, { status: "submitted", sort: "waiting" })}
          className="mb-5 flex items-center gap-3 rounded-2xl border border-[#f3cfa0] bg-[#fff8ef] p-4 text-[14px] text-ink transition-colors hover:border-[#e9b877]"
        >
          <AlertIcon className="h-5 w-5 shrink-0 text-[#8f4700]" />
          <span>
            <span className="font-semibold">
              {overdue} {overdue === 1 ? "application has" : "applications have"} waited {REVIEW_SLA_DAYS}+ days.
            </span>{" "}
            Founders are told reviews start within {REVIEW_SLA_DAYS} working days.
          </span>
        </Link>
      )}

      {/* Status tabs */}
      <nav aria-label="Filter by status" className="snap-row mb-4 gap-2 [--bleed:16px] sm:[--bleed:32px] md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {TABS.map((tab) => {
          const active = filters.status === tab.id;
          return (
            <Link
              key={tab.id}
              href={queueHref(filters, { status: tab.id, sort: tab.id === "submitted" ? "waiting" : "recent" })}
              aria-current={active ? "page" : undefined}
              className={`flex h-9 items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors ${
                active ? "bg-ink text-white" : "bg-white text-ink-soft ring-1 ring-line-soft hover:text-ink"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${active ? "bg-white/15" : "bg-cream text-muted"}`}>
                {counts[tab.id]}
              </span>
            </Link>
          );
        })}
      </nav>

      <FilterBar filters={filters} />

      <p className="mt-5 mb-3 text-[13px] text-muted" aria-live="polite">
        {rows.length} {rows.length === 1 ? "application" : "applications"}
      </p>

      {rows.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <p className="font-display text-[18px] font-bold text-ink">No applications here</p>
          <p className="mt-1 text-[14px] text-muted">
            {filters.q || filters.stage || filters.industry || filters.mine
              ? "Nothing matches these filters."
              : "When founders submit, they'll show up in this list."}
          </p>
        </div>
      ) : (
        <>
          {/* Table from md up */}
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full text-left text-[14px]">
              <thead className="border-b border-line-soft bg-cream/60 text-[12px] font-semibold text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">Startup</th>
                  <th scope="col" className="px-3 py-3">Stage</th>
                  <th scope="col" className="px-3 py-3">Status</th>
                  <th scope="col" className="px-3 py-3">Score</th>
                  <th scope="col" className="hidden px-3 py-3 xl:table-cell">MRR · Raising</th>
                  <th scope="col" className="px-3 py-3">Submitted</th>
                  <th scope="col" className="hidden px-5 py-3 lg:table-cell">Reviewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {rows.map((r) => (
                  <tr key={r.id} className="group relative transition-colors hover:bg-cream/50">
                    <td className="w-[36%] max-w-0 px-5 py-4">
                      {/* The whole row is clickable via this link's overlay */}
                      <Link
                        href={`/admin/applications/${r.id}`}
                        className="block truncate font-semibold text-ink after:absolute after:inset-0 group-hover:text-gold-deep"
                      >
                        {r.startup || "Unnamed startup"}
                      </Link>
                      <span className="mt-0.5 block truncate text-[13px] text-muted">
                        {r.founder} · {r.email}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-ink-soft">{r.stage ? stageLabel(r.stage) : "—"}</td>
                    <td className="px-3 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-3 py-4">
                      <Score row={r} />
                    </td>
                    <td className="hidden px-3 py-4 whitespace-nowrap text-ink-soft tabular-nums xl:table-cell">
                      {formatMoney(r.monthlyRevenue)} · {formatMoney(r.seeking)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <Waiting row={r} />
                    </td>
                    <td className="hidden px-5 py-4 whitespace-nowrap text-ink-soft lg:table-cell">
                      {r.assigneeName ?? <span className="text-muted">Unassigned</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards on phones */}
          <ul className="flex flex-col gap-3 md:hidden">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/applications/${r.id}`} className="card block p-4">
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink">{r.startup || "Unnamed startup"}</span>
                      <span className="mt-0.5 block truncate text-[13px] text-muted">{r.founder}</span>
                    </span>
                    <StatusBadge status={r.status} />
                  </span>
                  <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-ink-soft">
                    <span>{r.stage ? stageLabel(r.stage) : "No stage"}</span>
                    <Score row={r} />
                    <Waiting row={r} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function Score({ row }: { row: QueueRow }) {
  if (row.score === null) return <span className="text-muted">Not scored</span>;
  return (
    <span className="whitespace-nowrap">
      <span className="font-display font-bold text-ink tabular-nums">{row.score.toFixed(1)}</span>
      <span className="text-muted"> / 5 · {row.scorecards}</span>
      <span className="sr-only"> scorecards</span>
    </span>
  );
}

function Waiting({ row }: { row: QueueRow }) {
  if (!row.submittedAt) return <span className="text-muted">Not submitted</span>;
  const label = row.waiting === 0 ? "today" : `${row.waiting}d ago`;
  return (
    <span className={row.overdue ? "font-semibold text-[#8f4700]" : "text-ink-soft"}>
      {date.format(new Date(row.submittedAt))} · {label}
      {row.overdue && <span className="sr-only"> (overdue)</span>}
    </span>
  );
}
