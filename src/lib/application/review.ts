import "server-only";
import { notFound } from "next/navigation";
import { cache } from "react";
import { api } from "@/lib/api";
import { getCurrentUser, isReviewer, redirectToSignIn, type SessionUser } from "@/lib/auth";
import type { Filters } from "./queue";
import {
  SCORE_AREAS,
  type Recommendation,
  type ReviewData,
  type Scorecard,
  type StageId,
  type Status,
  type StoredApplication,
} from "./types";

/* Data access for the admin panel. The API checks the reviewer role on every
   call and answers 404 to anyone else, so the panel can't be reached by
   skipping a page check; the checks here just send people to the right page.
   Changes go through the panel's Server Actions (app/admin/actions.ts). */

/** Signed out → sign in. Signed in but not a reviewer → 404, so the panel isn't advertised. */
export const requireReviewer = cache(async (): Promise<SessionUser> => {
  const user = await getCurrentUser();
  if (!user) return redirectToSignIn();
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

export type QueuePage = {
  rows: QueueRow[];
  /** Per status tab, respecting the search and filters. */
  counts: Record<Filters["status"], number>;
  /** Across everything, ignoring filters. */
  summary: { waiting: number; overdue: number; mineInReview: number };
  page: number;
  pages: number;
  pageSize: number;
  total: number;
};

/** One page of the queue: filtered, counted, sorted and paged by the API. */
export async function getQueue(filters: Filters): Promise<QueuePage> {
  await requireReviewer();
  const params = new URLSearchParams({ status: filters.status, sort: filters.sort, page: String(filters.page) });
  if (filters.q) params.set("q", filters.q);
  if (filters.stage) params.set("stage", filters.stage);
  if (filters.industry) params.set("industry", filters.industry);
  if (filters.mine) params.set("mine", "1");
  const result = await api<QueuePage>(`/admin/applications?${params}`, { auth: true });
  if (result.status === 401) return redirectToSignIn();
  if (result.status === 404) notFound();
  if (!result.ok) throw new Error(`Couldn't load the review queue (${result.status}).`);
  return result.data;
}

/** Full record for the review page, reviewer data included. */
export const getForReview = cache(async (id: string): Promise<StoredApplication> => {
  await requireReviewer();
  const result = await api<{ application: StoredApplication }>(
    `/admin/applications/${encodeURIComponent(id)}`,
    { auth: true },
  );
  if (result.status === 401) return redirectToSignIn();
  if (result.status === 404) notFound();
  if (!result.ok) throw new Error(`Couldn't load the application (${result.status}).`);
  return result.data.application;
});
