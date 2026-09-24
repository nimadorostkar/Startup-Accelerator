import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AssignButton, DecisionPanel, NoteForm, ScorecardForm } from "@/components/admin/ReviewTools";
import ApplicationSummary from "@/components/dashboard/ApplicationSummary";
import { ArrowRight } from "@/components/icons";
import { initials } from "@/components/dashboard/initials";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Timeline } from "@/components/dashboard/ui";
import { availableDecisions, daysWaiting, REVIEW_SLA_DAYS } from "@/lib/application/decisions";
import { progress } from "@/lib/application/progress";
import {
  getForReview,
  requireReviewer,
  reviewOf,
  scorecardAverage,
  teamAverage,
} from "@/lib/application/review";
import { RECOMMENDATIONS, SCORE_AREAS, stageLabel } from "@/lib/application/types";

export async function generateMetadata({ params }: PageProps<"/admin/applications/[id]">): Promise<Metadata> {
  const app = await getForReview((await params).id);
  return { title: app.startup.name || "Unnamed startup" };
}

const when = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});
const dateOnly = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

export default async function ApplicationReviewPage({ params }: PageProps<"/admin/applications/[id]">) {
  const reviewer = await requireReviewer();
  const { id } = await params;
  const app = await getForReview(id);
  const review = reviewOf(app);
  const p = progress(app);
  const waiting = daysWaiting(app.submittedAt);
  const overdue = app.status === "submitted" && waiting !== null && waiting >= REVIEW_SLA_DAYS;
  const mine = review.scorecards.find((c) => c.reviewerId === reviewer.id) ?? null;
  const others = review.scorecards.filter((c) => c.reviewerId !== reviewer.id);
  const avg = teamAverage(review);

  return (
    <>
      <Link href="/admin" className="group mb-5 inline-flex items-center gap-2 text-[13px] font-semibold text-muted hover:text-ink">
        <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
        Review queue
      </Link>

      <header className="card mb-5 p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={app.status} />
          {app.startup.stage && <span className="chip">{stageLabel(app.startup.stage)}</span>}
          {app.startup.industry && <span className="chip">{app.startup.industry}</span>}
          {p.percent < 100 && <span className="chip">{p.percent}% complete</span>}
        </div>
        <h1 className="mt-3 font-display text-[28px] leading-[1.1] font-bold tracking-[-0.02em] text-ink sm:text-[34px]">
          {app.startup.name || "Unnamed startup"}
        </h1>
        {app.startup.tagline && <p className="mt-1.5 text-[16px] text-ink-soft/80">{app.startup.tagline}</p>}
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line-soft pt-5 text-[14px] sm:grid-cols-4">
          <Meta label="Founder">
            {app.profile.fullName}
            <a href={`mailto:${app.profile.email}`} className="block truncate text-[13px] font-normal text-gold-deep hover:underline">
              {app.profile.email}
            </a>
          </Meta>
          <Meta label="Submitted">
            {app.submittedAt ? dateOnly.format(new Date(app.submittedAt)) : "Not yet"}
            {waiting !== null && app.status === "submitted" && (
              <span className={`block text-[13px] font-normal ${overdue ? "font-semibold text-[#8f4700]" : "text-muted"}`}>
                Waiting {waiting} {waiting === 1 ? "day" : "days"}
              </span>
            )}
          </Meta>
          <Meta label="Team score">
            {avg === null ? (
              <span className="font-normal text-muted">Not scored</span>
            ) : (
              <>
                {avg.toFixed(1)} <span className="font-normal text-muted">/ 5</span>
                <span className="block text-[13px] font-normal text-muted">
                  {review.scorecards.length} {review.scorecards.length === 1 ? "scorecard" : "scorecards"}
                </span>
              </>
            )}
          </Meta>
          <Meta label="Pitch deck">
            {app.startup.deckUrl ? (
              <a href={app.startup.deckUrl} target="_blank" rel="noreferrer" className="text-gold-deep hover:underline">
                Open deck ↗
              </a>
            ) : (
              <span className="font-normal text-muted">Not provided</span>
            )}
          </Meta>
        </dl>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        {/* Tools first on phones; the right-hand column from lg up */}
        <aside className="flex flex-col gap-5 lg:order-2">
          <Box title="Decision">
            <DecisionPanel id={id} available={availableDecisions(app.status)} />
          </Box>

          <Box title="Reviewer">
            <div className="flex flex-wrap items-center gap-3">
              {review.assigneeName ? (
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-navy font-display text-[12px] font-bold text-gold"
                >
                  {initials(review.assigneeName)}
                </span>
              ) : null}
              <span className="min-w-0 flex-1 text-[14px] font-semibold text-ink">
                {review.assigneeName ?? <span className="font-normal text-muted">Nobody yet</span>}
                {review.assigneeId === reviewer.id && <span className="font-normal text-muted"> (you)</span>}
              </span>
              <AssignButton
                id={id}
                assigned={review.assigneeId !== null}
                assignedToMe={review.assigneeId === reviewer.id}
              />
            </div>
          </Box>

          <Box title="Your scorecard" note="Only the review team sees scores.">
            <ScorecardForm id={id} mine={mine} />
          </Box>

          {others.length > 0 && (
            <Box title="Other reviewers">
              <ul className="flex flex-col gap-4">
                {others.map((c) => {
                  const cardAvg = scorecardAverage(c);
                  return (
                    <li key={c.reviewerId} className="rounded-xl bg-cream p-3.5">
                      <p className="flex items-baseline justify-between gap-2 text-[14px] font-semibold text-ink">
                        {c.reviewerName}
                        <span className="tabular-nums">{cardAvg === null ? "—" : `${cardAvg.toFixed(1)} / 5`}</span>
                      </p>
                      <p className="mt-1 text-[12px] text-muted">
                        {SCORE_AREAS.map((a) => `${a.label} ${c.scores[a.id] ?? "–"}`).join(" · ")}
                      </p>
                      {c.recommendation && (
                        <p className="mt-1.5 text-[13px] font-semibold text-gold-deep">
                          Recommends: {RECOMMENDATIONS.find((r) => r.id === c.recommendation)?.label}
                        </p>
                      )}
                      {c.summary && <p className="mt-1.5 text-[13px] leading-[1.55] whitespace-pre-line text-ink-soft">{c.summary}</p>}
                    </li>
                  );
                })}
              </ul>
            </Box>
          )}

          <Box title="Internal notes" note="Never shown to the founder.">
            {review.notes.length > 0 && (
              <ol className="mb-4 flex flex-col gap-3">
                {review.notes.map((n) => (
                  <li key={n.id} className="rounded-xl bg-cream p-3.5">
                    <p className="text-[12px] text-muted">
                      <span className="font-semibold text-ink-soft">{n.authorName}</span> · {when.format(new Date(n.at))}
                    </p>
                    <p className="mt-1 text-[14px] leading-[1.55] whitespace-pre-line text-ink">{n.body}</p>
                  </li>
                ))}
              </ol>
            )}
            <NoteForm id={id} />
          </Box>

          <Box title="Founder-visible activity">
            <Timeline events={app.events} />
          </Box>
        </aside>

        <div className="flex flex-col gap-5 lg:order-1">
          {p.missing.length > 0 && (
            <p className="rounded-2xl border border-line-soft bg-white p-4 text-[14px] text-ink-soft">
              <span className="font-semibold text-ink">Incomplete:</span>{" "}
              {p.missing.map((m) => m.label).join(", ")}.
            </p>
          )}
          <ApplicationSummary app={app} editable={false} />
        </div>
      </div>
    </>
  );
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[12px] font-semibold text-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold text-ink">{children}</dd>
    </div>
  );
}

function Box({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="card p-5">
      <div className="mb-4">
        <h2 className="font-display text-[16px] font-bold text-ink">{title}</h2>
        {note && <p className="mt-0.5 text-[12px] text-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}
