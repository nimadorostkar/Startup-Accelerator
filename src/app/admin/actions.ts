"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { api, BackendUnavailable, UNAVAILABLE } from "@/lib/api";
import { SIGNED_OUT } from "@/app/dashboard/actions";
import { RETURN_TO_HEADER, signInHref } from "@/lib/session";
import { DECISIONS, type Decision } from "@/lib/application/decisions";
import { SCORE_AREAS } from "@/lib/application/types";
import { readString, type FieldErrors } from "@/lib/validation";

/* The review panel's actions. The API checks the reviewer role and every
   rule (which decisions are allowed from the stored status, so two reviewers
   can't both decide; one scorecard per reviewer; message rules) and emails
   the founder about decisions. See backend/apps/applications/services.py. */

export type ReviewState = {
  ok?: boolean;
  message?: string;
  errors?: FieldErrors;
  values?: Record<string, string>;
  /** Changes on every success, so forms can reset. */
  savedAt?: string;
  /** The application changed underneath (another reviewer decided first). */
  conflict?: boolean;
  /** The session ended: nothing was saved, and this signs in again (in a new tab, keeping the form). */
  signInHref?: string;
};

function echo(form: FormData) {
  const values: Record<string, string> = {};
  for (const [k, v] of form) if (typeof v === "string" && !k.startsWith("$")) values[k] = v;
  return values;
}

/* Sends a reviewer change and refreshes both sides: the admin pages, and the
   founder's dashboard (which shows status changes and messages). */
async function send(
  id: string,
  tail: string,
  method: "POST" | "PUT" | "DELETE",
  body: unknown,
  form: FormData | null,
  message: string,
): Promise<ReviewState> {
  const values = form ? echo(form) : undefined;
  let result;
  try {
    result = await api(`/admin/applications/${encodeURIComponent(id)}${tail}`, { method, body, auth: true });
  } catch (err) {
    if (err instanceof BackendUnavailable) {
      console.error(err);
      return { ok: false, message: UNAVAILABLE, values };
    }
    throw err;
  }
  if (result.status === 401) {
    // Not a redirect: that would throw away a half-written note or scorecard.
    return { ok: false, message: SIGNED_OUT, values, signInHref: signInHref((await headers()).get(RETURN_TO_HEADER)) };
  }
  if (!result.ok) {
    // 404 means "not a reviewer" (or no such application): show the 404 page,
    // unless the application was deleted while the page was open.
    if (result.status === 404 && !result.error.message?.includes("no longer exists")) notFound();
    const { errors, message: refusal } = result.error;
    if (result.status === 409) {
      // Someone else changed it: refresh the page so the panel shows what's true now.
      revalidatePath("/admin", "layout");
      return { ok: false, conflict: true, message: refusal };
    }
    // Field problems show under their fields, like the rest of the panel.
    return errors ? { ok: false, errors, values } : { ok: false, message: refusal, values };
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
  revalidateTag("startups", { expire: 0 });
  return { ok: true, message, savedAt: new Date().toISOString() };
}

/* ---------- Decisions ---------- */

export async function decide(id: string, _prev: ReviewState, form: FormData): Promise<ReviewState> {
  const decision = readString(form, "decision");
  const label = DECISIONS[decision as Decision]?.label ?? "Decision";
  return send(
    id,
    "/decisions",
    "POST",
    { decision, message: readString(form, "message") },
    form,
    `${label} — done. The founder can see this on their dashboard and gets an email.`,
  );
}

/* ---------- Assignment ---------- */

export async function assignToMe(id: string): Promise<ReviewState> {
  return send(id, "/assignee", "PUT", undefined, null, "Assigned to you.");
}

export async function unassign(id: string): Promise<ReviewState> {
  return send(id, "/assignee", "DELETE", undefined, null, "Unassigned.");
}

/* ---------- Scorecard ---------- */

export async function saveScorecard(id: string, _prev: ReviewState, form: FormData): Promise<ReviewState> {
  const body: Record<string, string> = {
    recommendation: readString(form, "recommendation"),
    summary: readString(form, "summary"),
  };
  for (const area of SCORE_AREAS) body[`score-${area.id}`] = readString(form, `score-${area.id}`);
  return send(id, "/scorecard", "PUT", body, form, "Scorecard saved.");
}

/* ---------- Internal notes ---------- */

export async function addNote(id: string, _prev: ReviewState, form: FormData): Promise<ReviewState> {
  return send(
    id,
    "/notes",
    "POST",
    { body: readString(form, "body") },
    form,
    "Note added. Only the review team can see it.",
  );
}
