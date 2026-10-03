import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

/* The API calls this when public data changes (an event or article edited in
   the back office, a startup's status), so cached pages refresh within seconds
   instead of within a minute. Guarded by REVALIDATE_SECRET, shared with the API.

   Stale-while-revalidate ("max"): the next visitor still gets the old copy while
   a fresh one renders. If the API can't be reached for that render (a deploy, a
   restart), the old copy keeps being served instead of an error page. */

const KNOWN_TAGS = new Set(["events", "newsletter", "startups"]);

function authorised(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const wanted = Buffer.from(`Bearer ${secret}`);
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}

export async function POST(request: NextRequest) {
  if (!authorised(request)) return new Response("Not found", { status: 404 });
  const body = (await request.json().catch(() => ({}))) as { tags?: unknown };
  const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => KNOWN_TAGS.has(t as string)) : [];
  for (const tag of tags) revalidateTag(tag, "max");
  return Response.json({ revalidated: tags });
}
