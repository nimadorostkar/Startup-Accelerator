import type { MetadataRoute } from "next";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { listPublicStartups } from "@/lib/application/public";
import { listEvents } from "@/lib/events";
import { listPosts } from "@/lib/newsletter";
import { SITE_URL } from "@/lib/site";

/** If the API can't answer, the sitemap still lists the fixed pages. */
async function orNone<T>(load: () => Promise<T[]>): Promise<T[]> {
  try {
    return await load();
  } catch (err) {
    unstable_rethrow(err);
    console.error(err);
    return [];
  }
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

  await connection(); // listed at request time, so new startups and events appear
  const [allPosts, allEvents, allStartups] = await Promise.all([
    orNone(listPosts),
    orNone(listEvents),
    orNone(listPublicStartups),
  ]);

  const posts = allPosts.map((p) => ({
    url: url(`/newsletter/${p.slug}`),
    lastModified: new Date(`${p.date}T00:00:00Z`),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  const events = allEvents.map((e) => ({
    url: url(`/events/${e.slug}`),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const startups = allStartups.map((s) => ({
    url: url(`/startups/${s.slug}`),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...pages, ...posts, ...events, ...startups];
}
