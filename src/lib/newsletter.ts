import "server-only";
import { connection } from "next/server";
import { cache } from "react";
import type { Post, PostSummary } from "@/components/newsletter/posts";
import { api } from "./api";

/* ══════════════════════════════════════════════════════════════════════
   THE FOUNDER BRIEF — issues and subscribers, via the API
   (backend/apps/content). Issues are written in the back office; they're
   cached for a minute and tagged "newsletter".

   New subscribers get a welcome email with an unsubscribe link
   (/newsletter/unsubscribe).
   ══════════════════════════════════════════════════════════════════════ */

/** Published issues, newest first, without their text. */
export const listPosts = cache(async (): Promise<PostSummary[]> => {
  await connection(); // read at request time, never baked in at build
  const result = await api<{ posts: PostSummary[] }>("/newsletter/posts", { tags: ["newsletter"] });
  if (!result.ok) throw new Error(`Couldn't load the newsletter (${result.status}).`);
  return result.data.posts;
});

export const findPost = cache(async (slug: string): Promise<Post | null> => {
  await connection();
  const result = await api<{ post: Post }>(`/newsletter/posts/${encodeURIComponent(slug)}`, {
    tags: ["newsletter"],
  });
  if (result.status === 404) return null;
  if (!result.ok) throw new Error(`Couldn't load the article (${result.status}).`);
  return result.data.post;
});

/** Returns false when the address is already on the list. Throws on other refusals. */
export async function addSubscriber(email: string, source: string) {
  const result = await api<{ status: "new" | "existing" }>("/newsletter/subscribers", {
    method: "POST",
    body: { email, source },
  });
  if (!result.ok) throw new Error(result.error.message ?? `Sign-up refused (${result.status}).`);
  return result.data.status === "new";
}

export async function unsubscribe(token: string): Promise<{ ok: true; email: string } | { ok: false; message: string }> {
  const result = await api<{ email: string }>("/newsletter/unsubscribe", { method: "POST", body: { token } });
  return result.ok
    ? { ok: true, email: result.data.email }
    : { ok: false, message: result.error.message ?? "That link didn't work." };
}
