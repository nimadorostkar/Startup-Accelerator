import Link from "next/link";
import type { ReactNode } from "react";
import {
  COMMITMENTS,
  formatMoney,
  formatNumber,
  stageLabel,
  type Application,
} from "@/lib/application/types";
import { Panel } from "./ui";

/* The whole application, read-only. Founders see it on their review page
   (with Edit links); reviewers see the same thing in the admin panel. */

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

export default function ApplicationSummary({ app, editable }: { app: Application; editable: boolean }) {
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
