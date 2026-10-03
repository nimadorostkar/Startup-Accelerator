import type { StartupCardData } from "@/lib/application/directory";

/**
 * Who the landing page features: the hero's "Featured founders" panel, the
 * faces beside its headline, the Demo Day band and /demo-day. All of it comes
 * from the API's public directory (lib/application/public.ts), so a startup
 * appears here once it is accepted, with the logo and photo its founder
 * uploaded (their initials until they do).
 */

export type PanelFounder = {
  slug: string;
  name: string;
  role: string;
  company: string;
  sector: string;
  /** "" until uploaded: the card then shows the founder's initials. */
  photo: string;
  /** "" until uploaded: the card then shows just the startup's name. */
  logo: string;
};

/** Short labels for the cards, where the application's industry names are too long. */
const SECTORS: Record<string, string> = {
  "AI & machine learning": "AI",
  "B2B software / SaaS": "SaaS",
  "Climate & energy": "CleanTech",
  "Deep tech & hardware": "Deep tech",
  "E-commerce & retail": "Retail",
  Education: "EdTech",
  "Health & biotech": "HealthTech",
  "Mobility & logistics": "Logistics",
};

export function sectorLabel(industry: string) {
  return SECTORS[industry] ?? industry;
}

const MAX_CARDS = 12;

/**
 * The startups to feature, best first: the cohort before those still in
 * review or newly applied, founders with a photo before those without, and
 * the most recent first within each. Startups that weren't selected, or whose
 * founder has no name yet, are left out.
 */
export function featured(all: StartupCardData[], limit = MAX_CARDS): PanelFounder[] {
  const rank = (s: StartupCardData) => (s.status === "cohort" ? 0 : 2) + (s.founder.photo ? 0 : 1);
  return all
    .filter((s) => s.status !== "passed" && s.founder.name)
    .toSorted((a, b) => rank(a) - rank(b) || (b.appliedAt ?? "").localeCompare(a.appliedAt ?? ""))
    .slice(0, limit)
    .map((s) => ({
      slug: s.slug,
      name: s.founder.name,
      role: s.founder.role || "Founder",
      company: s.name,
      sector: sectorLabel(s.industry),
      photo: s.founder.photo,
      logo: s.logo,
    }));
}

/** Two marquee rows (row 1 scrolls left, row 2 right); one row when there are few. */
export function panelRows(founders: PanelFounder[]): PanelFounder[][] {
  if (founders.length < 6) return founders.length ? [founders] : [];
  return [founders.filter((_, i) => i % 2 === 0), founders.filter((_, i) => i % 2 === 1)];
}
