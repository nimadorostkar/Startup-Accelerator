import type { Status } from "./types";

/* What a reviewer can do to an application, and from which states. The
   decision panel reads this to show only valid buttons; the server action
   reads it again to refuse anything else. Every decision adds a
   founder-visible entry to the application's activity feed. */

export const DECISIONS = {
  start_review: {
    label: "Start review",
    from: ["submitted"],
    to: "in_review",
    title: "Review started",
    message: "optional",
  },
  request_changes: {
    label: "Request changes",
    from: ["submitted", "in_review"],
    to: "changes_requested",
    title: "Changes requested",
    message: "required",
  },
  accept: {
    label: "Accept",
    from: ["submitted", "in_review"],
    to: "accepted",
    title: "Application accepted",
    message: "optional",
  },
  decline: {
    label: "Decline",
    from: ["submitted", "in_review"],
    to: "declined",
    title: "Application not selected",
    message: "optional",
  },
  reopen: {
    label: "Reopen review",
    from: ["accepted", "declined"],
    to: "in_review",
    title: "Review reopened",
    message: "optional",
  },
} as const satisfies Record<
  string,
  { label: string; from: readonly Status[]; to: Status; title: string; message: "optional" | "required" }
>;

export type Decision = keyof typeof DECISIONS;

export function availableDecisions(status: Status): Decision[] {
  return (Object.keys(DECISIONS) as Decision[]).filter((d) =>
    (DECISIONS[d].from as readonly Status[]).includes(status),
  );
}

/** Days an application has waited since submission (whole days). */
export function daysWaiting(submittedAt: string | null, now = Date.now()) {
  if (!submittedAt) return null;
  return Math.floor((now - new Date(submittedAt).getTime()) / 86_400_000);
}

/** Founders are told reviews start within 5 working days; flag anything close to missing it. */
export const REVIEW_SLA_DAYS = 5;
