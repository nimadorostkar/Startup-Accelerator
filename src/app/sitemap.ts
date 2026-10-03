import type { MetadataRoute } from "next";
import { LOCALE_INFO, LOCALES, localePath } from "@/i18n/config";
import { listPublicStartups } from "@/lib/application/public";
import { listEvents } from "@/lib/events";
import { listPosts } from "@/lib/newsletter";
import { SITE_URL } from "@/lib/site";

// Rebuilt hourly, or as soon as an event, article or startup changes (cache tags).
// Each public page is listed in English, Turkish and Persian.
export const revalidate = 3600;

/** A payload's `updated` time, when it has a valid one. */
function modified(updated?: string) {
  const d = updated ? new Date(updated) : null;
  return d && !Number.isNaN(d.getTime()) ? { lastModified: d } : {};
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => `${SITE_URL}${path}`;

  const pages: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/about"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/demo-day"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/startups"), changeFrequency: "daily", priority: 0.8 },
    { url: url("/events"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/newsletter"), changeFrequency: "weekly", priority: 0.7 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.5 },
    { url: url("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: url("/terms"), changeFrequency: "yearly", priority: 0.2 },
    { url: url("/code-of-conduct"), changeFrequency: "yearly", priority: 0.2 },
  ];

  const [allPosts, allEvents, allStartups] = await Promise.all([
    listPosts(),
    listEvents(),
    listPublicStartups(),
  ]);

  const posts = allPosts.map((p) => ({
    url: url(`/newsletter/${p.slug}`),
    lastModified: new Date(`${p.date}T00:00:00Z`),
    ...modified(p.updated),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  const events = allEvents.map((e) => ({
    url: url(`/events/${e.slug}`),
    ...modified(e.updated),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const startups = allStartups.map((s) => ({
    url: url(`/startups/${s.slug}`),
    ...modified(s.updated),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  // Every page in each language, each entry naming its translations (hreflang).
  return [...pages, ...posts, ...events, ...startups].flatMap((entry) => {
    const path = entry.url.slice(SITE_URL.length) || "/";
    const languages = Object.fromEntries(LOCALES.map((l) => [LOCALE_INFO[l].intl, url(localePath(l, path))]));
    return LOCALES.map((l) => ({ ...entry, url: url(localePath(l, path)), alternates: { languages } }));
  });
}
