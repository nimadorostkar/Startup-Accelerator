import "server-only";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { getCurrentUser, isReviewer, type SessionUser } from "@/lib/auth";
import { daysWaiting, REVIEW_SLA_DAYS } from "./decisions";
import { progress } from "./progress";
import { findApplication, listApplications, updateApplication } from "./store";
import {
  SCORE_AREAS,
  type Recommendation,
  type ReviewData,
  type Scorecard,
  type StageId,
  type Status,
  type StoredApplication,
} from "./types";

/* Data access for the admin panel. Every function checks the reviewer role
   itself — pages and actions can be reached directly, so a check in the
   layout alone wouldn't protect anything. */

/** Signed out → sign in. Signed in but not a reviewer → 404, so the panel isn't advertised. */
export const requireReviewer = cache(async (): Promise<SessionUser> => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isReviewer(user)) notFound();
  return user;
});

export function reviewOf(app: StoredApplication): ReviewData {
  return app.review ?? { assigneeId: null, assigneeName: null, scorecards: [], notes: [] };
}

/** Mean of one scorecard's filled-in areas, or null if none are scored. */
export function scorecardAverage(card: Scorecard) {
  const values = SCORE_AREAS.map((a) => card.scores[a.id]).filter((n): n is number => typeof n === "number");
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

/** Mean across every reviewer's scorecard. */
export function teamAverage(review: ReviewData) {
  const avgs = review.scorecards.map(scorecardAverage).filter((n): n is number => n !== null);
  return avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : null;
}

/** One row of the review queue — only what the list needs. */
export type QueueRow = {
  id: string;
  startup: string;
  tagline: string;
  founder: string;
  email: string;
  stage: StageId | "";
  industry: string;
  country: string;
  status: Status;
  percent: number;
  submittedAt: string | null;
  updatedAt: string;
  waiting: number | null;
  overdue: boolean;
  assigneeId: string | null;
  assigneeName: string | null;
  score: number | null;
  scorecards: number;
  recommendations: Recommendation[];
  monthlyRevenue: number | null;
  seeking: number | null;
  teamSize: number;
};

export function toQueueRow(app: StoredApplication, now = Date.now()): QueueRow {
  const review = reviewOf(app);
  const waiting = daysWaiting(app.submittedAt, now);
  return {
    id: app.userId,
    startup: app.startup.name,
    tagline: app.startup.tagline,
    founder: app.profile.fullName,
    email: app.profile.email,
    stage: app.startup.stage,
    industry: app.startup.industry,
    country: app.startup.country,
    status: app.status,
    percent: progress(app).percent,
    submittedAt: app.submittedAt,
    updatedAt: app.updatedAt,
    waiting,
    overdue: app.status === "submitted" && waiting !== null && waiting >= REVIEW_SLA_DAYS,
    assigneeId: review.assigneeId,
    assigneeName: review.assigneeName,
    score: teamAverage(review),
    scorecards: review.scorecards.length,
    recommendations: review.scorecards.map((c) => c.recommendation).filter((r): r is Recommendation => r !== ""),
    monthlyRevenue: app.startup.monthlyRevenue,
    seeking: app.startup.seeking,
    teamSize: app.team.members.length,
  };
}

export async function listForReview(): Promise<QueueRow[]> {
  await requireReviewer();
  const now = Date.now();
  return (await listApplications()).map((a) => toQueueRow(a, now));
}

/** Full record for the review page, reviewer data included. */
export async function getForReview(id: string): Promise<StoredApplication> {
  await requireReviewer();
  const app = await findApplication(id);
  if (!app) notFound();
  return app;
}

export class ReviewRejected extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
  }
}

/** Atomic change to any application, by a reviewer. Never creates one. */
export async function mutateForReview(
  id: string,
  fn: (app: StoredApplication, reviewer: SessionUser) => StoredApplication,
): Promise<StoredApplication> {
  const reviewer = await requireReviewer();
  return updateApplication(
    id,
    () => {
      throw new ReviewRejected("That application no longer exists.");
    },
    (current) => ({ ...fn(current, reviewer), updatedAt: new Date().toISOString() }),
  );
}
