"use server";

import { revalidatePath } from "next/cache";
import { event } from "@/lib/application/dal";
import { DECISIONS, type Decision } from "@/lib/application/decisions";
import { mutateForReview, reviewOf, ReviewRejected } from "@/lib/application/review";
import {
  RECOMMENDATIONS,
  SCORE_AREAS,
  STATUSES,
  type Scorecard,
  type Status,
  type StoredApplication,
} from "@/lib/application/types";
import { maxLength, oneOf, readString, type FieldErrors } from "@/lib/validation";

export type ReviewState = {
  ok?: boolean;
  message?: string;
  errors?: FieldErrors;
  values?: Record<string, string>;
  /** Changes on every success, so forms can reset. */
  savedAt?: string;
};

/* Runs a reviewer change and refreshes both sides: the admin pages, and the
   founder's dashboard (which shows status changes and messages). */
async function commit(
  id: string,
  form: FormData | null,
  change: Parameters<typeof mutateForReview>[1],
  message: string,
): Promise<ReviewState> {
  try {
    await mutateForReview(id, change);
  } catch (err) {
    if (err instanceof ReviewRejected) {
      const values = form ? echo(form) : undefined;
      return err.field
        ? { ok: false, errors: { [err.field]: err.message }, values }
        : { ok: false, message: err.message, values };
    }
    throw err; // includes Next's redirect / not-found signals
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
  return { ok: true, message, savedAt: new Date().toISOString() };
}

function echo(form: FormData) {
  const values: Record<string, string> = {};
  for (const [k, v] of form) if (typeof v === "string" && !k.startsWith("$")) values[k] = v;
  return values;
}

/* ---------- Decisions ---------- */

export async function decide(id: string, _prev: ReviewState, form: FormData): Promise<ReviewState> {
  const decision = readString(form, "decision");
  const note = readString(form, "message");
  if (!oneOf(decision, Object.keys(DECISIONS) as Decision[]))
    return { ok: false, message: "Pick a decision." };
  const rule = DECISIONS[decision];

  const tooLong = maxLength(note, 2000);
  if (tooLong) return { ok: false, errors: { message: tooLong }, values: echo(form) };
  if (rule.message === "required" && note.length < 20)
    return {
      ok: false,
      errors: { message: "Tell the founder what to change — at least a sentence or two." },
      values: echo(form),
    };

  return commit(
    id,
    form,
    (app, reviewer) => {
      // Checked against the stored status, so two reviewers can't both decide.
      if (!(rule.from as readonly Status[]).includes(app.status))
        throw new ReviewRejected(
          `Someone got there first — this application is now "${STATUSES[app.status].label}". Refresh to see the latest.`,
        );
      const review = reviewOf(app);
      const next: StoredApplication = {
        ...app,
        status: rule.to,
        events: [...app.events, event("status", rule.title, note || undefined, "support")],
        // Starting a review claims it, unless someone already has.
        review:
          decision === "start_review" && !review.assigneeId
            ? { ...review, assigneeId: reviewer.id, assigneeName: reviewer.name }
            : review,
      };
      // TODO: email the founder here (status + message) so they don't have to check the dashboard.
      return next;
    },
    `${rule.label} — done. The founder can see this on their dashboard.`,
  );
}

/* ---------- Assignment ---------- */

export async function assignToMe(id: string): Promise<ReviewState> {
  return commit(
    id,
    null,
    (app, reviewer) => ({
      ...app,
      review: { ...reviewOf(app), assigneeId: reviewer.id, assigneeName: reviewer.name },
    }),
    "Assigned to you.",
  );
}

export async function unassign(id: string): Promise<ReviewState> {
  return commit(
    id,
    null,
    (app) => ({ ...app, review: { ...reviewOf(app), assigneeId: null, assigneeName: null } }),
    "Unassigned.",
  );
}

/* ---------- Scorecard ---------- */

export async function saveScorecard(id: string, _prev: ReviewState, form: FormData): Promise<ReviewState> {
  const scores: Scorecard["scores"] = {};
  const errors: FieldErrors = {};
  for (const area of SCORE_AREAS) {
    const raw = readString(form, `score-${area.id}`);
    if (!raw) continue;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 1 || n > 5) errors[`score-${area.id}`] = "Score from 1 to 5.";
    else scores[area.id] = n;
  }
  const recommendation = readString(form, "recommendation");
  if (recommendation && !oneOf(recommendation, RECOMMENDATIONS.map((r) => r.id)))
    errors.recommendation = "Pick a recommendation.";
  const summary = readString(form, "summary");
  const tooLong = maxLength(summary, 2000);
  if (tooLong) errors.summary = tooLong;
  if (Object.keys(errors).length) return { ok: false, errors, values: echo(form) };

  return commit(
    id,
    form,
    (app, reviewer) => {
      const review = reviewOf(app);
      const card: Scorecard = {
        reviewerId: reviewer.id,
        reviewerName: reviewer.name,
        scores,
        recommendation: recommendation as Scorecard["recommendation"],
        summary,
        updatedAt: new Date().toISOString(),
      };
      // Each reviewer has exactly one scorecard; saving replaces theirs.
      const scorecards = [...review.scorecards.filter((c) => c.reviewerId !== reviewer.id), card];
      return { ...app, review: { ...review, scorecards } };
    },
    "Scorecard saved.",
  );
}

/* ---------- Internal notes ---------- */

export async function addNote(id: string, _prev: ReviewState, form: FormData): Promise<ReviewState> {
  const body = readString(form, "body");
  if (!body) return { ok: false, errors: { body: "Write a note first." } };
  const tooLong = maxLength(body, 2000);
  if (tooLong) return { ok: false, errors: { body: tooLong }, values: echo(form) };

  return commit(
    id,
    form,
    (app, reviewer) => {
      const review = reviewOf(app);
      const note = {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        authorId: reviewer.id,
        authorName: reviewer.name,
        body,
      };
      return { ...app, review: { ...review, notes: [...review.notes, note] } };
    },
    "Note added. Only the review team can see it.",
  );
}
