import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getCurrentUser, type SessionUser } from "@/lib/auth";
import { findApplication, updateApplication } from "./store";
import { EDITABLE, type Application, type TimelineEvent } from "./types";

/* Data access for the dashboard. Every read and write goes through here, and
   every function resolves the user from the session itself — callers never
   pass a user id in, so one founder can't reach another's application. */

/** For pages: no session → off to sign in. */
export const requireUser = cache(async (): Promise<SessionUser> => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
});

function blankApplication(user: SessionUser): Application {
  const now = new Date().toISOString();
  return {
    userId: user.id,
    status: "draft",
    profile: {
      fullName: user.name,
      email: user.email,
      phone: "",
      title: "",
      country: "",
      city: "",
      linkedin: "",
      bio: "",
      experienceYears: null,
      commitment: "",
      heardFrom: "",
    },
    startup: {
      name: "",
      tagline: "",
      website: "",
      industry: "",
      stage: "",
      foundedOn: "",
      country: "",
      incorporated: "",
      businessModel: "",
      problem: "",
      solution: "",
      targetCustomer: "",
      marketSize: "",
      competitors: "",
      advantage: "",
      activeUsers: null,
      payingCustomers: null,
      monthlyRevenue: null,
      growthRate: null,
      keyMetric: "",
      raisedToDate: null,
      seeking: null,
      useOfFunds: "",
      deckUrl: "",
      demoUrl: "",
      videoUrl: "",
    },
    team: {
      // The applicant is the first founder; they fill in the rest.
      members: [
        {
          id: crypto.randomUUID(),
          name: user.name,
          role: "",
          email: user.email,
          linkedin: "",
          equity: null,
          commitment: "",
          isFounder: true,
        },
      ],
      workedTogether: "",
      whyUs: "",
      hiringNeeds: "",
    },
    events: [
      {
        id: crypto.randomUUID(),
        at: now,
        by: "founder",
        kind: "created",
        title: "Application started",
      },
    ],
    createdAt: now,
    updatedAt: now,
    submittedAt: null,
  };
}

/** The signed-in founder's application, created on first visit. */
export const getMyApplication = cache(async (): Promise<Application> => {
  const user = await requireUser();
  const existing = await findApplication(user.id);
  if (existing) return existing;
  return updateApplication(user.id, () => blankApplication(user), (a) => a);
});

export function canEdit(app: Application) {
  return EDITABLE.includes(app.status);
}

export function event(
  kind: TimelineEvent["kind"],
  title: string,
  body?: string,
): TimelineEvent {
  return {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    by: "founder",
    kind,
    title,
    ...(body ? { body } : {}),
  };
}

export class LockedError extends Error {
  constructor() {
    super("This application is with the review team and can't be edited right now.");
  }
}

/**
 * The one way to change an application. With `editable: true` (the default)
 * the change is refused while the review team has the application — the
 * forms hide their save buttons too, but this is the check that counts.
 */
export async function mutateMyApplication(
  fn: (app: Application) => Application,
  { editable = true }: { editable?: boolean } = {},
): Promise<Application> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return updateApplication(
    user.id,
    () => blankApplication(user),
    (current) => {
      if (editable && !canEdit(current)) throw new LockedError();
      return { ...fn(current), updatedAt: new Date().toISOString() };
    },
  );
}
