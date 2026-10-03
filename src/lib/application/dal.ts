import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { api } from "@/lib/api";
import { getCurrentUser, redirectToSignIn, type SessionUser } from "@/lib/auth";
import { EDITABLE, type Application } from "./types";

/* Data access for the dashboard. The API resolves the founder from their
   session on every call — there is no user id to pass — so one founder can't
   reach another's application, and it never sends reviewer data here.
   Changes go through the dashboard's Server Actions (app/dashboard/actions.ts). */

/** For pages: no session → off to sign in. */
export const requireUser = cache(async (): Promise<SessionUser> => {
  const user = await getCurrentUser();
  if (!user) return redirectToSignIn();
  return user;
});

/** The signed-in founder's application, created as a blank draft on first visit. */
export const getMyApplication = cache(async (): Promise<Application> => {
  const user = await requireUser();
  // Staff don't apply: reading it would start a founder application in their name
  // (and put it in the review queue). Reviewers who haven't confirmed their
  // address yet can't open the panel, so they're asked to do that first.
  if (user.role === "reviewer") redirect(user.isReviewer ? "/admin" : "/verify-email");
  const result = await api<{ application: Application }>("/me/application", { auth: true });
  if (result.status === 401) return redirectToSignIn();
  if (!result.ok) throw new Error(`Couldn't load the application (${result.status}).`);
  return result.data.application;
});

export function canEdit(app: Pick<Application, "status">) {
  return EDITABLE.includes(app.status);
}
