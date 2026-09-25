import "server-only";
import { cache } from "react";
import { listApplications } from "./store";
import { publicStatus, slugify, type PublicStartup } from "./directory";
import { stageLabel, type StoredApplication } from "./types";

/* ══════════════════════════════════════════════════════════════════════
   PUBLIC VIEW of an application — an allowlist, on purpose.

   Kept out: founder emails and phones, equity, money (revenue, growth,
   raised, seeking, use of funds), the deck, how they heard of us, review
   messages, and everything under `review`. Widen it here, nowhere else.
   ══════════════════════════════════════════════════════════════════════ */

function toPublic(app: StoredApplication, slug: string): PublicStartup {
  const { startup, profile, team } = app;
  return {
    slug,
    name: startup.name.trim(),
    tagline: startup.tagline,
    industry: startup.industry,
    stage: startup.stage,
    stageLabel: stageLabel(startup.stage),
    country: startup.country,
    foundedOn: startup.foundedOn,
    status: publicStatus(app.status)!,
    appliedAt: app.submittedAt,
    founders: team.members
      .filter((m) => m.isFounder && m.name.trim())
      .map((m) => m.name.trim()),
    users: startup.activeUsers,
    customers: startup.payingCustomers,

    website: startup.website,
    demoUrl: startup.demoUrl,
    videoUrl: startup.videoUrl,
    incorporated: startup.incorporated,
    businessModel: startup.businessModel,
    problem: startup.problem,
    solution: startup.solution,
    targetCustomer: startup.targetCustomer,
    marketSize: startup.marketSize,
    competitors: startup.competitors,
    advantage: startup.advantage,
    keyMetric: startup.keyMetric,
    team: team.members
      .filter((m) => m.name.trim())
      .map((m) => ({
        name: m.name.trim(),
        role: m.role,
        linkedin: m.linkedin,
        isFounder: m.isFounder,
        commitment: m.commitment,
      })),
    workedTogether: team.workedTogether,
    whyUs: team.whyUs,
    hiringNeeds: team.hiringNeeds,
    applicant: {
      name: profile.fullName,
      title: profile.title,
      city: profile.city,
      country: profile.country,
      bio: profile.bio,
      experienceYears: profile.experienceYears,
      linkedin: profile.linkedin,
    },
    timeline: app.events
      .filter((e) => e.kind === "submitted" || e.kind === "status")
      .map((e) => ({ at: e.at, title: e.title })),
  };
}

/** Every application that has been submitted, newest first. Drafts never appear. */
export const listPublicStartups = cache(async (): Promise<PublicStartup[]> => {
  const apps = (await listApplications())
    .filter((a) => publicStatus(a.status) !== null && a.startup.name.trim())
    // Oldest first, so a name clash always gives the newer startup the suffix.
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const seen = new Map<string, number>();
  const out = apps.map((a) => {
    const base = slugify(a.startup.name);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return toPublic(a, n === 1 ? base : `${base}-${n}`);
  });

  const key = (s: PublicStartup) => s.appliedAt ?? "";
  return out.sort((a, b) => key(b).localeCompare(key(a)));
});

export async function findPublicStartup(slug: string) {
  return (await listPublicStartups()).find((s) => s.slug === slug) ?? null;
}
