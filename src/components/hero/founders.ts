import { FOUNDERS } from "../portfolio/data";

/**
 * Cards for the hero's "Featured founders" panel, in two marquee rows.
 *
 * The five founders from portfolio/data.ts (also used on /demo-day) keep their
 * headshots and startup logos. The three marked `placeholder` come from the
 * hero handoff and show initials plus an inline mark — replace them with real
 * founders (add a `photo` and `logo`) when there are more to feature.
 */

export type PanelMark = "bolt" | "kernel" | "orbit";

export type PanelFounder = {
  name: string;
  role: string;
  company: string;
  sector: string;
  /** Headshot in /public; without one the card shows `initials`. */
  photo?: string;
  initials?: string;
  /** Startup logo in /public; without one the card draws `mark`. */
  logo?: string;
  mark?: PanelMark;
  placeholder?: boolean;
};

const fromPortfolio = (slug: string): PanelFounder => {
  const f = FOUNDERS.find((x) => x.slug === slug);
  if (!f) throw new Error(`Unknown featured founder: ${slug}`);
  return {
    name: f.name,
    role: f.role,
    company: f.company,
    sector: f.sector,
    photo: `/images/founders/${f.slug}.webp`,
    logo: `/images/startups/${f.startup}-logo.webp`,
  };
};

const PLACEHOLDERS = {
  omar: {
    name: "Omar Haddad",
    role: "Co-founder & CEO",
    company: "GreenGrid",
    sector: "CleanTech",
    initials: "OH",
    mark: "bolt",
    placeholder: true,
  },
  lucas: {
    name: "Lucas Weber",
    role: "Co-founder & CEO",
    company: "Kernel",
    sector: "DevTools",
    initials: "LW",
    mark: "kernel",
    placeholder: true,
  },
  mei: {
    name: "Mei Tanaka",
    role: "Founder & CEO",
    company: "Orbit Labs",
    sector: "SpaceTech",
    initials: "MT",
    mark: "orbit",
    placeholder: true,
  },
} satisfies Record<string, PanelFounder>;

/** Row 1 scrolls left, row 2 scrolls right. */
export const PANEL_ROWS: PanelFounder[][] = [
  [
    fromPortfolio("sarah-mitchell"),
    fromPortfolio("daniel-kim"),
    PLACEHOLDERS.omar,
    fromPortfolio("priya-sharma"),
  ],
  [
    fromPortfolio("alex-carter"),
    fromPortfolio("elena-rossi"),
    PLACEHOLDERS.lucas,
    PLACEHOLDERS.mei,
  ],
];
