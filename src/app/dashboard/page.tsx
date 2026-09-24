import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckIcon } from "@/components/icons";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  FeedbackNotice,
  PageHeader,
  Panel,
  ProgressRing,
  StageTrack,
  statusBlurb,
  Timeline,
} from "@/components/dashboard/ui";
import { canEdit, getMyApplication } from "@/lib/application/dal";
import { progress } from "@/lib/application/progress";
import { formatMoney, stageLabel, STATUSES, type Status } from "@/lib/application/types";

// The layout's title template only applies to child segments, not this page.
export const metadata: Metadata = { title: { absolute: "Overview — VC Summit" } };

/* The review pipeline, with how far along this application is. */
const PIPELINE: { title: string; body: string; reached: Status[]; current: Status[] }[] = [
  {
    title: "Complete your application",
    body: "Profile, startup details and team — save as you go.",
    reached: ["submitted", "in_review", "accepted", "declined"],
    current: ["draft", "changes_requested"],
  },
  {
    title: "Validation & analysis",
    body: "Our team checks the problem, market and traction. Usually within 5 working days.",
    reached: ["accepted", "declined"],
    current: ["submitted", "in_review"],
  },
  {
    title: "Founder interview",
    body: "Shortlisted teams meet two partners for a 30-minute call.",
    reached: ["accepted", "declined"],
    current: [],
  },
  {
    title: "Decision",
    body: "You hear back here and by email.",
    reached: [],
    current: ["accepted", "declined"],
  },
];

export default async function OverviewPage() {
  const app = await getMyApplication();
  const p = progress(app);
  const editable = canEdit(app);
  const firstName = app.profile.fullName.split(" ")[0] || "there";
  const next = p.sections.find((s) => !s.complete);

  const cta =
    editable && next
      ? { href: next.href, label: `Continue: ${next.label}` }
      : editable
        ? { href: "/dashboard/review", label: "Review & submit" }
        : { href: "/dashboard/review", label: "View your application" };

  const founders = app.team.members.filter((m) => m.isFounder).length;
  const snapshot = [
    { label: "Startup", value: app.startup.name || "Not named yet" },
    { label: "Industry", value: app.startup.industry || "—" },
    { label: "Stage", value: app.startup.stage ? stageLabel(app.startup.stage) : "—" },
    {
      label: "Team",
      value: `${app.team.members.length} ${app.team.members.length === 1 ? "person" : "people"} · ${founders} founder${founders === 1 ? "" : "s"}`,
    },
    { label: "Monthly revenue", value: formatMoney(app.startup.monthlyRevenue) },
    { label: "Raising", value: formatMoney(app.startup.seeking) },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Founder dashboard"
        title={`Welcome back, ${firstName}`}
        description="Everything the review team needs to validate and analyse your startup lives here."
      />

      <FeedbackNotice app={app} compact />

      {/* Status */}
      <section className="card flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-7">
        <ProgressRing percent={p.percent} />
        <div className="min-w-0 flex-1">
          <StatusBadge status={app.status} />
          <h2 className="mt-3 font-display text-[21px] leading-tight font-bold tracking-[-0.01em] text-ink">
            {app.status === "draft"
              ? p.ready
                ? "Ready to submit"
                : `${p.missing.length} ${p.missing.length === 1 ? "answer" : "answers"} left before you can submit`
              : STATUSES[app.status].label}
          </h2>
          <p className="mt-1.5 text-[14px] leading-[1.6] text-ink-soft/80">{statusBlurb(app.status)}</p>
        </div>
        <Link
          href={cta.href}
          className="btn-shine group flex h-12 shrink-0 items-center justify-center gap-2.5 rounded-full bg-gold-btn px-6 font-display text-[12px] font-bold tracking-[0.06em] text-gold-ink uppercase shadow-[0_16px_38px_-16px_rgba(214,150,67,0.85)] transition-[filter] hover:brightness-105"
        >
          {cta.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Your checklist">
          <ul className="flex flex-col gap-3">
            {p.sections.map((s) => (
              <li key={s.id}>
                <Link
                  href={s.href}
                  className="group flex items-center gap-4 rounded-xl border border-line-soft p-3.5 transition-colors hover:border-gold/50 hover:bg-cream/50"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      s.complete ? "bg-green text-white" : "bg-cream font-display text-[12px] font-bold text-ink-soft tabular-nums"
                    }`}
                  >
                    {s.complete ? <CheckIcon className="h-4 w-4" /> : `${s.done}/${s.total}`}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-ink">{s.label}</span>
                    <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-line-soft">
                      <span
                        className={`block h-full rounded-full ${s.complete ? "bg-green" : "bg-gold"}`}
                        style={{ width: `${Math.round((s.done / s.total) * 100)}%` }}
                      />
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-gold-deep" />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Snapshot">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-1 xl:grid-cols-2">
            {snapshot.map((row) => (
              <div key={row.label} className="min-w-0">
                <dt className="text-[12px] font-semibold text-muted">{row.label}</dt>
                <dd className="mt-0.5 truncate text-[14px] font-semibold text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      <Panel
        title="Your stage"
        className="mt-5"
        action={
          editable && (
            <Link href="/dashboard/startup#stage" className="text-[13px] font-semibold text-gold-deep hover:underline">
              {app.startup.stage ? "Change" : "Set stage"}
            </Link>
          )
        }
      >
        <StageTrack current={app.startup.stage} />
      </Panel>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="What happens next">
          <ol className="flex flex-col gap-4">
            {PIPELINE.map((step, i) => {
              const done = step.reached.includes(app.status);
              const now = step.current.includes(app.status);
              return (
                <li key={step.title} className="flex gap-3.5">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[12px] font-bold ${
                      done ? "bg-green text-white" : now ? "bg-gold text-gold-ink" : "bg-cream text-muted"
                    }`}
                  >
                    {done ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className={`text-[14px] font-semibold ${done || now ? "text-ink" : "text-muted"}`}>
                      {step.title}
                      {now && <span className="ml-2 chip align-middle">Now</span>}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-[1.55] text-muted">{step.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Panel>

        <Panel title="Activity">
          <Timeline events={app.events} />
        </Panel>
      </div>
    </>
  );
}
