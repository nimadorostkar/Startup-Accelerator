/* The public startup directory: what a visitor may see of an application.
   Client-safe: types and pure helpers only. The store is read in public.ts. */

import type { StageId, Status } from "./types";

/* ---------- Status, as shown to the public ---------- */

export const PUBLIC_STATUSES = {
  cohort: { label: "In the cohort", tone: "green" },
  review: { label: "In review", tone: "gold" },
  applied: { label: "Applied", tone: "neutral" },
  passed: { label: "Not selected", tone: "neutral" },
} as const;
export type PublicStatus = keyof typeof PUBLIC_STATUSES;
export const PUBLIC_STATUS_ORDER: PublicStatus[] = [
  "cohort",
  "review",
  "applied",
  "passed",
];

/** Drafts have not applied, so they map to null and stay out of the directory. */
export function publicStatus(status: Status): PublicStatus | null {
  switch (status) {
    case "accepted":
      return "cohort";
    case "in_review":
    case "changes_requested":
      return "review";
    case "submitted":
      return "applied";
    case "declined":
      return "passed";
    default:
      return null;
  }
}

/* ---------- Records ---------- */

export type PublicFounder = {
  name: string;
  role: string;
  linkedin: string;
  isFounder: boolean;
  commitment: string;
};

/** What the list and its search need. Sent to the browser for instant filtering. */
export type StartupCardData = {
  slug: string;
  name: string;
  tagline: string;
  industry: string;
  stage: StageId | "";
  stageLabel: string;
  country: string;
  foundedOn: string;
  status: PublicStatus;
  appliedAt: string | null;
  founders: string[];
  users: number | null;
  customers: number | null;
};

/** Everything the startup page shows. */
export type PublicStartup = StartupCardData & {
  website: string;
  demoUrl: string;
  videoUrl: string;
  incorporated: "yes" | "no" | "";
  businessModel: string;
  problem: string;
  solution: string;
  targetCustomer: string;
  marketSize: string;
  competitors: string;
  advantage: string;
  keyMetric: string;
  team: PublicFounder[];
  workedTogether: string;
  whyUs: string;
  hiringNeeds: string;
  applicant: {
    name: string;
    title: string;
    city: string;
    country: string;
    bio: string;
    experienceYears: number | null;
    linkedin: string;
  };
  /** Dated milestones, titles only: the messages behind them stay private. */
  timeline: { at: string; title: string }[];
};

export function toCard(s: PublicStartup): StartupCardData {
  const {
    slug,
    name,
    tagline,
    industry,
    stage,
    stageLabel,
    country,
    foundedOn,
    status,
    appliedAt,
    founders,
    users,
    customers,
  } = s;
  return {
    slug,
    name,
    tagline,
    industry,
    stage,
    stageLabel,
    country,
    foundedOn,
    status,
    appliedAt,
    founders,
    users,
    customers,
  };
}

/* ---------- Helpers ---------- */

export function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "startup"
  );
}

/** "2025-06" → "Jun 2025" */
export function formatMonth(ym: string) {
  if (!/^\d{4}-\d{2}$/.test(ym)) return "";
  return new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** 1500 → "1.5k" */
export function compact(n: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/* Monogram tiles stand in for logos: one of eight brand gradients, picked
   from the name so a startup keeps its colour everywhere. */
const PALETTE = [
  ["#0d1d2a", "#2a4a63"],
  ["#9c6a19", "#dd9e42"],
  ["#165432", "#3b7f48"],
  ["#3b2807", "#8a5a1e"],
  ["#1c2a5c", "#3d5aa8"],
  ["#5c1c3a", "#a8397a"],
  ["#0f4c5c", "#2a8fa5"],
  ["#6b2d0f", "#c8622c"],
] as const;

export function monogramGradient(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const [a, b] = PALETTE[h % PALETTE.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}
