import type { Metadata } from "next";
import Link from "next/link";
import { AlertIcon, CheckIcon } from "@/components/icons";
import ApplicationSummary from "@/components/dashboard/ApplicationSummary";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { SubmitPanel, WithdrawButton } from "@/components/dashboard/SubmitPanel";
import { FeedbackNotice, PageHeader, Panel, statusBlurb, Timeline } from "@/components/dashboard/ui";
import { canEdit, getMyApplication } from "@/lib/application/dal";
import { progress, SECTIONS, type Missing } from "@/lib/application/progress";
import { STATUSES } from "@/lib/application/types";

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
          <ApplicationSummary app={app} editable={editable} />
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
