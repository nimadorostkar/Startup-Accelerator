/* Newsletter issues ("The Founder Brief"): types and display helpers, safe
   to import anywhere. The issues come from the API (lib/newsletter.ts) and
   are written in the back office (/backoffice/ → Posts). The launch set is
   loaded by `python manage.py seed_content`. */

export const CATEGORIES = [
  "Fundraising",
  "Building",
  "AI",
  "Founder Stories",
  "Program News",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string; cite?: string }
  /** `ordered` for a numbered list ("1. " lines in the back office). */
  | { type: "list"; items: string[]; ordered?: boolean };

export type Post = {
  slug: string;
  issue: number;
  title: string;
  excerpt: string;
  category: Category;
  author: string;
  /** ISO date */
  date: string;
  minutes: number;
  /** Last edited (ISO datetime), for the sitemap. */
  updated?: string;
  body: Block[];
};

/** An issue as listed: everything but the text. */
export type PostSummary = Omit<Post, "body">;

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
