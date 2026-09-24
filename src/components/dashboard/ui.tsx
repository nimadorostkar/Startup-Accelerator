import Link from "next/link";
import type { ReactNode } from "react";
import { STAGES, STATUSES, type Application, type Status, type TimelineEvent } from "@/lib/application/types";
import { ArrowRight, CheckIcon } from "../icons";
import { ChatIcon, ClockIcon, LockIcon } from "./icons";

/* Server-rendered building blocks shared by the dashboard pages. */

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="type-wide text-[11px] font-semibold tracking-[0.18em] text-gold-deep uppercase">{eyebrow}</p>
        )}
        <h1 className="mt-2 font-display text-[28px] leading-[1.1] font-bold tracking-[-0.02em] text-ink sm:text-[34px]">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-[620px] text-[15px] leading-[1.6] text-ink-soft/80">{description}</p>}
      </div>
      {children}
    </header>
  );
}

/** Shown on the section pages while the application can't be edited. */
export function LockedNotice({ status }: { status: Status }) {
  const final = status === "accepted" || status === "declined";
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-line-soft bg-white p-4 sm:p-5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-ink-soft">
        <LockIcon className="h-[18px] w-[18px]" />
      </span>
      <div className="text-[14px] leading-[1.55]">
        <p className="font-semibold text-ink">
          {final ? "This application has been decided" : "Editing is paused while we review"}
        </p>
        <p className="mt-0.5 text-ink-soft/80">
          {final
            ? "Your answers are kept here for reference."
            : "Your answers are with the review team. If they need anything else, this page reopens for edits."}{" "}
          <Link href="/dashboard/review" className="font-semibold text-gold-deep hover:underline">
            See status
          </Link>
        </p>
      </div>
    </div>
  );
}

/** The newest message from the review team, when they've asked for changes. */
export function latestFeedback(app: Application) {
  return [...app.events].reverse().find((e) => e.by === "support" && e.body);
}

export function FeedbackNotice({ app, compact = false }: { app: Application; compact?: boolean }) {
  const note = latestFeedback(app);
  if (app.status !== "changes_requested") return null;
  return (
    <div className="mb-6 rounded-2xl border border-[#f3cfa0] bg-[#fff8ef] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff1e0] text-[#8f4700]">
          <ChatIcon className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 text-[14px] leading-[1.6]">
          <p className="font-semibold text-ink">The review team asked for changes</p>
          {note?.body && (
            <p className={`mt-1 whitespace-pre-line text-ink-soft ${compact ? "line-clamp-2" : ""}`}>{note.body}</p>
          )}
          {compact && (
            <Link href="/dashboard/review" className="mt-1.5 inline-block font-semibold text-gold-deep hover:underline">
              Read feedback and resubmit
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function NextStep({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-8 flex justify-end">
      <Link
        href={href}
        className="group inline-flex items-center gap-2 text-[14px] font-semibold text-ink transition-colors hover:text-gold-deep"
      >
        {label}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

/** Size it with className (e.g. "h-28 w-28"). */
export function ProgressRing({ percent, className = "h-28 w-28" }: { percent: number; className?: string }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className={`@container relative shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line-soft)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={percent === 100 ? "var(--green)" : "var(--gold)"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - percent / 100)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[23cqw] leading-none font-extrabold text-ink tabular-nums">{percent}%</span>
        <span className="mt-1 text-[max(9px,10cqw)] font-semibold text-muted">complete</span>
      </span>
    </div>
  );
}

/** The six programme stages with the startup's current one highlighted. */
export function StageTrack({ current }: { current: string }) {
  const index = STAGES.findIndex((s) => s.id === current);
  return (
    <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {STAGES.map((stage, i) => {
        const state = index === -1 ? "todo" : i < index ? "past" : i === index ? "now" : "todo";
        return (
          <li
            key={stage.id}
            aria-current={state === "now" ? "step" : undefined}
            className={`relative rounded-xl border p-3 ${
              state === "now"
                ? "border-gold bg-chip"
                : state === "past"
                  ? "border-line-soft bg-white"
                  : "border-dashed border-line bg-transparent"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full font-display text-[11px] font-bold ${
                state === "now"
                  ? "bg-gold text-gold-ink"
                  : state === "past"
                    ? "bg-green text-white"
                    : "bg-line-soft text-muted"
              }`}
            >
              {state === "past" ? <CheckIcon className="h-3 w-3" /> : i + 1}
            </span>
            <span className={`mt-2 block text-[13px] leading-tight font-semibold ${state === "todo" ? "text-muted" : "text-ink"}`}>
              {stage.label}
            </span>
            {state === "now" && <span className="mt-0.5 block text-[11px] font-semibold text-gold-deep">You are here</span>}
          </li>
        );
      })}
    </ol>
  );
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

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const list = [...events].reverse();
  return (
    <ol className="relative flex flex-col gap-5 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-line-soft">
      {list.map((e) => (
        <li key={e.id} className="relative flex gap-3.5">
          <span
            className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
              e.by === "support" ? "bg-navy text-gold" : "bg-cream text-ink-soft"
            }`}
          >
            {e.by === "support" ? <ChatIcon className="h-4 w-4" /> : <ClockIcon className="h-4 w-4" />}
          </span>
          <div className="min-w-0 pt-1">
            <p className="text-[14px] leading-snug font-semibold text-ink">
              {e.title}
              {e.by === "support" && <span className="ml-2 chip align-middle">Review team</span>}
            </p>
            <p className="mt-0.5 text-[12px] text-muted">{when.format(new Date(e.at))}</p>
            {e.body && <p className="mt-2 rounded-xl bg-cream px-3.5 py-2.5 text-[14px] leading-[1.6] whitespace-pre-line text-ink-soft">{e.body}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Plain card with an optional heading row. */
export function Panel({
  title,
  action,
  className = "",
  children,
}: {
  title?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-[16px] font-bold tracking-[-0.01em] text-ink">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function statusBlurb(status: Status) {
  return STATUSES[status].blurb;
}
