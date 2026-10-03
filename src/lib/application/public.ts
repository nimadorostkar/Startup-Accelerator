import "server-only";
import { notFound } from "next/navigation";
import { cache } from "react";
import { api, BUILDING } from "@/lib/api";
import type { PublicStartup, StartupCardData } from "./directory";

/* ══════════════════════════════════════════════════════════════════════
   PUBLIC VIEW of applications — the startup directory.

   The API builds it from an allowlist (backend/apps/applications/payloads.py,
   public_card / public_startup). Kept out: founder emails and phones, equity,
   money (revenue, growth, raised, seeking, use of funds), the deck, how they
   heard of us, review messages and all reviewer data. Drafts never appear.

   Cached for a minute and tagged "startups"; submissions, withdrawals and
   decisions refresh it straight away.
   ══════════════════════════════════════════════════════════════════════ */

/** Every application that has been submitted, newest first, as directory cards. */
export const listPublicStartups = cache(async (): Promise<StartupCardData[]> => {
  if (BUILDING) return [];
  const result = await api<{ startups: StartupCardData[] }>("/startups", { tags: ["startups"] });
  if (!result.ok) throw new Error(`Couldn't load the startup directory (${result.status}).`);
  return result.data.startups;
});

/** One startup's public page, or a 404. */
export const findPublicStartup = cache(async (slug: string): Promise<PublicStartup> => {
  if (BUILDING) notFound();
  const result = await api<{ startup: PublicStartup }>(`/startups/${encodeURIComponent(slug)}`, {
    tags: ["startups"],
  });
  if (result.status === 404) notFound();
  if (!result.ok) throw new Error(`Couldn't load the startup (${result.status}).`);
  return result.data.startup;
});
