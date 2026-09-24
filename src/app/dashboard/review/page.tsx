import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AlertIcon, CheckIcon } from "@/components/icons";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { SubmitPanel, WithdrawButton } from "@/components/dashboard/SubmitPanel";
import { FeedbackNotice, PageHeader, Panel, statusBlurb, Timeline } from "@/components/dashboard/ui";
import { canEdit, getMyApplication } from "@/lib/application/dal";
import { progress, SECTIONS, type Missing } from "@/lib/application/progress";
import {
  COMMITMENTS,
  formatMoney,
  formatNumber,
  stageLabel,
  STATUSES,
  type Application,
} from "@/lib/application/types";

export const metadata: Metadata = { title: "Review & submit" };

const dateOnly = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

export default async function ReviewPage() {
  const app = await getMyApplication();
  const p = progress(app);
  const editable = canEdit(app);

  return (
    <>
      <PageHeader
        eyebrow="Final step"
        title={editable ? "Review & submit" : "Your application"}
        description={
          editable
            ? "Check everything reads the way you want. This is exactly what the review team will see."
            : statusBlurb(app.status)
        }
      >
        <StatusBadge status={app.status} className="self-start sm:self-auto" />
      </PageHeader>

      <FeedbackNotice app={app} />

      {editable ? (
        <MissingList missing={p.missing} />
      ) : (
        <section className="card mb-5 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="font-display text-[18px] font-bold text-ink">{STATUSES[app.status].label}</p>
            {app.submittedAt && (
              <p className="mt-1 text-[14px] text-muted">Submitted {dateOnly.format(new Date(app.submittedAt))}</p>
            )}
          </div>
          {app.status === "submitted" && <WithdrawButton />}
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="flex flex-col gap-5">
          <Summary app={app} editable={editable} />
          {editable && (
            <SubmitPanel
              ready={p.ready}
              missingCount={p.missing.length}
              resubmission={app.status === "changes_requested"}
            />
          )}
        </div>

        <Panel title="Activity" className="lg:sticky lg:top-10">
          <Timeline events={app.events} />
        </Panel>
      </div>
    </>
  );
}

function MissingList({ missing }: { missing: Missing[] }) {
  if (!missing.length)
    return (
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-green/25 bg-green-light/40 p-4 sm:p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green text-white">
          <CheckIcon className="h-4 w-4" />
        </span>
        <p className="text-[14px] leading-[1.55] text-ink">
          <span className="font-semibold">Everything required is answered.</span> Give it a last read, then submit
          below.
        </p>
      </div>
    );

  return (
    <section className="card mb-5 p-5 sm:p-6" aria-labelledby="missing-title">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff1e0] text-[#8f4700]">
          <AlertIcon className="h-[18px] w-[18px]" />
        </span>
        <div>
          <h2 id="missing-title" className="font-display text-[16px] font-bold text-ink">
            {missing.length} {missing.length === 1 ? "answer" : "answers"} needed before you can submit
          </h2>
          <p className="mt-0.5 text-[14px] text-muted">Each link takes you straight to the question.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        {SECTIONS.map((section) => {
          const items = missing.filter((m) => m.section === section.id);
          return (
            <div key={section.id}>
              <p className="text-[12px] font-semibold tracking-[0.06em] text-muted uppercase">{section.label}</p>
              {items.length ? (
                <ul className="mt-2 flex flex-col gap-1.5">
                  {items.map((m) => (
                    <li key={m.field}>
                      <Link
                        href={`${section.href}#field-${m.field}`}
                        className="group flex items-baseline justify-between gap-2 text-[14px] font-semibold text-ink hover:text-gold-deep"
                      >
                        <span className="underline decoration-line underline-offset-4 group-hover:decoration-gold">
                          {m.label}
                        </span>
                        {m.reason && <span className="shrink-0 text-[12px] font-normal text-muted">{m.reason}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 flex items-center gap-1.5 text-[14px] text-green">
                  <CheckIcon className="h-3.5 w-3.5" /> Complete
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Read-only summary ---------- */

function Value({ children, long = false }: { children: ReactNode; long?: boolean }) {
  const empty = children === "" || children === null || children === undefined || children === "—";
  if (empty) return <span className="text-muted italic">Not answered</span>;
  return <span className={long ? "whitespace-pre-line" : ""}>{children}</span>;
}

function LinkValue({ href }: { href: string }) {
  if (!href) return <Value>{""}</Value>;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="break-all font-semibold text-gold-deep hover:underline">
      {href.replace(/^https?:\/\//, "")}
    </a>
  );
}

function Rows({ rows }: { rows: { label: string; value: ReactNode; wide?: boolean }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.label} className={`min-w-0 ${r.wide ? "sm:col-span-2" : ""}`}>
          <dt className="text-[12px] font-semibold text-muted">{r.label}</dt>
          <dd className="mt-1 text-[14px] leading-[1.6] break-words text-ink">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SummaryBlock({
  title,
  href,
  editable,
  children,
}: {
  title: string;
  href: string;
  editable: boolean;
  children: ReactNode;
}) {
  return (
    <Panel
      title={title}
      action={
        editable && (
          <Link href={href} className="text-[13px] font-semibold text-gold-deep hover:underline">
            Edit
          </Link>
        )
      }
    >
      {children}
    </Panel>
  );
}

function Summary({ app, editable }: { app: Application; editable: boolean }) {
  const { profile: pr, startup: s, team: t } = app;
  const commitment = (id: string) => COMMITMENTS.find((c) => c.id === id)?.label ?? "";

  return (
    <>
      <SummaryBlock title="Profile" href="/dashboard/profile" editable={editable}>
        <Rows
          rows={[
            { label: "Name", value: <Value>{pr.fullName}</Value> },
            { label: "Role", value: <Value>{pr.title}</Value> },
            { label: "Email", value: <Value>{pr.email}</Value> },
            { label: "Phone", value: <Value>{pr.phone}</Value> },
            { label: "Based in", value: <Value>{[pr.city, pr.country].filter(Boolean).join(", ")}</Value> },
            { label: "LinkedIn", value: <LinkValue href={pr.linkedin} /> },
            { label: "Experience", value: <Value>{pr.experienceYears !== null ? `${pr.experienceYears} years` : ""}</Value> },
            { label: "Commitment", value: <Value>{commitment(pr.commitment)}</Value> },
            { label: "Bio", value: <Value long>{pr.bio}</Value>, wide: true },
          ]}
        />
      </SummaryBlock>

      <SummaryBlock title="Startup" href="/dashboard/startup" editable={editable}>
        <Rows
          rows={[
            { label: "Name", value: <Value>{s.name}</Value> },
            { label: "Website", value: <LinkValue href={s.website} /> },
            { label: "One-line pitch", value: <Value>{s.tagline}</Value>, wide: true },
            { label: "Industry", value: <Value>{s.industry}</Value> },
            { label: "Business model", value: <Value>{s.businessModel}</Value> },
            { label: "Stage", value: <Value>{s.stage ? stageLabel(s.stage) : ""}</Value> },
            { label: "Headquarters", value: <Value>{s.country}</Value> },
            { label: "Founded", value: <Value>{s.foundedOn}</Value> },
            { label: "Incorporated", value: <Value>{s.incorporated === "yes" ? "Yes" : s.incorporated === "no" ? "Not yet" : ""}</Value> },
            { label: "Problem", value: <Value long>{s.problem}</Value>, wide: true },
            { label: "Solution", value: <Value long>{s.solution}</Value>, wide: true },
            { label: "Target customer", value: <Value long>{s.targetCustomer}</Value>, wide: true },
            { label: "Market size", value: <Value long>{s.marketSize}</Value>, wide: true },
            { label: "Competitors", value: <Value long>{s.competitors}</Value>, wide: true },
            { label: "Unfair advantage", value: <Value long>{s.advantage}</Value>, wide: true },
          ]}
        />

        <h3 className="mt-7 mb-3 text-[12px] font-semibold tracking-[0.06em] text-muted uppercase">Traction & funding</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "Active users", value: formatNumber(s.activeUsers) },
            { label: "Paying customers", value: formatNumber(s.payingCustomers) },
            { label: "Monthly revenue", value: formatMoney(s.monthlyRevenue) },
            { label: "Monthly growth", value: s.growthRate !== null ? `${s.growthRate}%` : "—" },
            { label: "Raised to date", value: formatMoney(s.raisedToDate) },
            { label: "Raising now", value: formatMoney(s.seeking) },
          ].map((m) => (
            <div key={m.label} className="rounded-xl bg-cream p-3.5">
              <p className="text-[12px] font-semibold text-muted">{m.label}</p>
              <p className="mt-1 font-display text-[18px] font-bold text-ink tabular-nums">{m.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Rows
            rows={[
              { label: "Key metric", value: <Value>{s.keyMetric}</Value>, wide: true },
              { label: "Use of funds", value: <Value long>{s.useOfFunds}</Value>, wide: true },
              { label: "Pitch deck", value: <LinkValue href={s.deckUrl} /> },
              { label: "Product / demo", value: <LinkValue href={s.demoUrl} /> },
              { label: "Founder video", value: <LinkValue href={s.videoUrl} /> },
            ]}
          />
        </div>
      </SummaryBlock>

      <SummaryBlock title="Team" href="/dashboard/team" editable={editable}>
        <ul className="grid gap-3 sm:grid-cols-2">
          {t.members.map((m) => (
            <li key={m.id} className="rounded-xl border border-line-soft p-3.5">
              <p className="flex flex-wrap items-center gap-2 text-[14px] font-bold text-ink">
                {m.name}
                {m.isFounder && <span className="chip">Founder</span>}
              </p>
              <p className="mt-0.5 text-[13px] text-ink-soft">{m.role || "Role not set"}</p>
              <p className="mt-1 text-[12px] text-muted">
                {[m.equity !== null ? `${m.equity}% equity` : "", commitment(m.commitment)].filter(Boolean).join(" · ") ||
                  "No equity or commitment given"}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-5">
          <Rows
            rows={[
              { label: "Worked together", value: <Value>{t.workedTogether}</Value> },
              { label: "Why this team", value: <Value long>{t.whyUs}</Value>, wide: true },
              { label: "Hiring next", value: <Value long>{t.hiringNeeds}</Value>, wide: true },
            ]}
          />
        </div>
      </SummaryBlock>
    </>
  );
}
