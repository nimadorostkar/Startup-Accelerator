import type { Application } from "./types";

/* What "complete" means for each section. Drafts can be saved with gaps;
   these rules decide the progress numbers and gate submission. The same
   rules run on the server in submitApplication, so they can't be skipped. */

export type SectionId = "profile" | "startup" | "team";

export type Missing = {
  section: SectionId;
  /** Matches the form field's `name`, used to deep-link to it. */
  field: string;
  label: string;
  /** Set when the field has content but not enough of it. */
  reason?: string;
};

type Rule = {
  field: string;
  label: string;
  /** Minimum characters for free-text answers, so "tbd" doesn't count. */
  min?: number;
  get: (a: Application) => unknown;
};

const RULES: Record<SectionId, Rule[]> = {
  profile: [
    { field: "fullName", label: "Full name", get: (a) => a.profile.fullName },
    { field: "title", label: "Your role", get: (a) => a.profile.title },
    { field: "country", label: "Country", get: (a) => a.profile.country },
    { field: "linkedin", label: "LinkedIn", get: (a) => a.profile.linkedin },
    { field: "commitment", label: "Commitment", get: (a) => a.profile.commitment },
    { field: "bio", label: "Short bio", min: 60, get: (a) => a.profile.bio },
  ],
  startup: [
    { field: "name", label: "Startup name", get: (a) => a.startup.name },
    { field: "tagline", label: "One-line pitch", get: (a) => a.startup.tagline },
    { field: "industry", label: "Industry", get: (a) => a.startup.industry },
    { field: "stage", label: "Current stage", get: (a) => a.startup.stage },
    { field: "country", label: "Headquarters", get: (a) => a.startup.country },
    { field: "businessModel", label: "Business model", get: (a) => a.startup.businessModel },
    { field: "problem", label: "Problem", min: 80, get: (a) => a.startup.problem },
    { field: "solution", label: "Solution", min: 80, get: (a) => a.startup.solution },
    { field: "targetCustomer", label: "Target customer", get: (a) => a.startup.targetCustomer },
    { field: "competitors", label: "Competitors", get: (a) => a.startup.competitors },
    { field: "advantage", label: "Unfair advantage", min: 40, get: (a) => a.startup.advantage },
    { field: "deckUrl", label: "Pitch deck link", get: (a) => a.startup.deckUrl },
  ],
  team: [
    { field: "members", label: "At least one founder", get: (a) => a.team.members.some((m) => m.isFounder) || null },
    { field: "workedTogether", label: "Time working together", get: (a) => a.team.workedTogether },
    { field: "whyUs", label: "Why this team", min: 60, get: (a) => a.team.whyUs },
  ],
};

export const SECTIONS: { id: SectionId; label: string; href: string }[] = [
  { id: "profile", label: "Your profile", href: "/dashboard/profile" },
  { id: "startup", label: "Startup details", href: "/dashboard/startup" },
  { id: "team", label: "Team", href: "/dashboard/team" },
];

function check(app: Application, section: SectionId, rule: Rule): Missing | null {
  const v = rule.get(app);
  const empty = v === null || v === undefined || v === "" || v === false;
  if (empty) return { section, field: rule.field, label: rule.label };
  if (rule.min && typeof v === "string" && v.length < rule.min)
    return {
      section,
      field: rule.field,
      label: rule.label,
      reason: `${rule.min - v.length} more characters needed`,
    };
  return null;
}

export function missingFields(app: Application): Missing[] {
  return (Object.keys(RULES) as SectionId[]).flatMap((section) =>
    RULES[section].map((rule) => check(app, section, rule)).filter((m) => m !== null),
  );
}

export function progress(app: Application) {
  const missing = missingFields(app);
  const sections = SECTIONS.map((s) => {
    const total = RULES[s.id].length;
    const left = missing.filter((m) => m.section === s.id).length;
    return { ...s, total, done: total - left, complete: left === 0 };
  });
  const total = sections.reduce((n, s) => n + s.total, 0);
  const done = sections.reduce((n, s) => n + s.done, 0);
  return {
    sections,
    missing,
    percent: Math.round((done / total) * 100),
    ready: missing.length === 0,
  };
}

/** Which fields each section rule-set treats as required — used to mark labels. */
export function requiredFields(section: SectionId) {
  return new Set(RULES[section].map((r) => r.field));
}
