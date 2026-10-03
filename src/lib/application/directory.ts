/* The public startup directory: what a visitor may see of an application.
   Client-safe: types and pure helpers only. The store is read in public.ts. */

import type { StageId, Status } from "./types";

/* ---------- Status, as shown to the public ---------- */

export const PUBLIC_STATUSES = {
  cohort: { label: "In the cohort", tone: "green" },
  review: { label: "In review", tone: "brand" },
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
  /** Address of the startup's logo, or "" (the card then shows its initials). */
  logo: string;
  /** The applicant: who the featured-founders cards show. `photo` may be "". */
  founder: { name: string; role: string; photo: string };
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
  /** Last changed (ISO datetime), for the sitemap. */
  updated?: string;
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
    photo: string;
  };
  /** Dated milestones, titles only: the messages behind them stay private. */
  timeline: { at: string; title: string }[];
};

/* ---------- Helpers ---------- */

/** Latin letters NFKD doesn't split into a base letter and an accent. */
const ASCII_LETTERS: Record<string, string> = {
  ß: "ss",
  æ: "ae",
  œ: "oe",
  ø: "o",
  ł: "l",
  đ: "d",
  ð: "d",
  þ: "th",
  ı: "i",
};

/** A startup's address, as the API makes it (backend/apps/applications/models.py
    slugify): folded to ASCII, "Café Nova!" → "cafe-nova", "Straße" →
    "strasse", at most 70
    characters. A name with nothing left ("東京", "🚀") falls back to
    "startup-" and the first 8 hex digits of the application's id. */
export function slugify(name: string, id = "") {
  const slug = name
    .toLowerCase()
    .replace(/[ßæœøłđðþı]/g, (ch) => ASCII_LETTERS[ch])
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/, "");
  if (slug) return slug;
  const hex = id.replace(/-/g, "").slice(0, 8).toLowerCase();
  return hex ? `startup-${hex}` : "startup";
}

/** How many different values, ignoring case and spaces: "Egypt" and " egypt" are one. */
export function distinctCount(values: string[]) {
  return new Set(values.map((v) => v.trim().toLowerCase()).filter(Boolean)).size;
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
  ["#141210", "#3a3029"],
  ["#c2470a", "#ef6f23"],
  ["#165432", "#3b7f48"],
  ["#4a1d07", "#a8441a"],
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
