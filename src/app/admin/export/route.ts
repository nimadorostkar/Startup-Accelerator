import { getCurrentUser, isReviewer } from "@/lib/auth";
import { progress } from "@/lib/application/progress";
import { reviewOf, teamAverage } from "@/lib/application/review";
import { listApplications } from "@/lib/application/store";
import { COMMITMENTS, stageLabel, STATUSES, type StoredApplication } from "@/lib/application/types";

/* Every application as a CSV, for the support team's own analysis. */

type Column = [header: string, value: (a: StoredApplication) => string | number | null];

const founders = (a: StoredApplication) => a.team.members.filter((m) => m.isFounder);

const COLUMNS: Column[] = [
  ["Status", (a) => STATUSES[a.status].label],
  ["Submitted", (a) => a.submittedAt?.slice(0, 10) ?? ""],
  ["Last activity", (a) => a.updatedAt.slice(0, 10)],
  ["Complete %", (a) => progress(a).percent],
  ["Startup", (a) => a.startup.name],
  ["One-line pitch", (a) => a.startup.tagline],
  ["Website", (a) => a.startup.website],
  ["Industry", (a) => a.startup.industry],
  ["Stage", (a) => (a.startup.stage ? stageLabel(a.startup.stage) : "")],
  ["Business model", (a) => a.startup.businessModel],
  ["HQ", (a) => a.startup.country],
  ["Founded", (a) => a.startup.foundedOn],
  ["Incorporated", (a) => a.startup.incorporated],
  ["Founder", (a) => a.profile.fullName],
  ["Email", (a) => a.profile.email],
  ["Phone", (a) => a.profile.phone],
  ["LinkedIn", (a) => a.profile.linkedin],
  ["Commitment", (a) => COMMITMENTS.find((c) => c.id === a.profile.commitment)?.label ?? ""],
  ["Team size", (a) => a.team.members.length],
  ["Co-founders", (a) => founders(a).map((m) => m.name).join("; ")],
  ["Active users", (a) => a.startup.activeUsers],
  ["Paying customers", (a) => a.startup.payingCustomers],
  ["MRR (USD)", (a) => a.startup.monthlyRevenue],
  ["Growth % MoM", (a) => a.startup.growthRate],
  ["Raised (USD)", (a) => a.startup.raisedToDate],
  ["Raising (USD)", (a) => a.startup.seeking],
  ["Pitch deck", (a) => a.startup.deckUrl],
  ["Team score", (a) => teamAverage(reviewOf(a))?.toFixed(2) ?? ""],
  ["Scorecards", (a) => reviewOf(a).scorecards.length],
  ["Recommendations", (a) => reviewOf(a).scorecards.map((c) => c.recommendation).filter(Boolean).join("; ")],
  ["Reviewer", (a) => reviewOf(a).assigneeName ?? ""],
  ["Problem", (a) => a.startup.problem],
  ["Solution", (a) => a.startup.solution],
];

/** Quotes a cell, and defuses spreadsheet formulas (=, +, -, @) in founder-entered text. */
function cell(value: string | number | null) {
  if (value === null) return "";
  let text = String(value);
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET() {
  const user = await getCurrentUser();
  // Same rule as the panel: not a reviewer → nothing here.
  if (!user || !isReviewer(user)) return new Response("Not found", { status: 404 });

  const apps = (await listApplications()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const lines = [COLUMNS.map(([h]) => cell(h)).join(","), ...apps.map((a) => COLUMNS.map(([, get]) => cell(get(a))).join(","))];
  const today = new Date().toISOString().slice(0, 10);

  // BOM first, so Excel reads the file as UTF-8 (names, €, em dashes).
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vc-summit-applications-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
