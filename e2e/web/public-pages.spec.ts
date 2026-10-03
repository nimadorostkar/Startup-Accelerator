import { expect, test } from "@playwright/test";
import { Api, json, reviewer, slugOf, submittedFounder } from "../support/api";
import { uid } from "../support/data";
import { monthDay } from "../support/web";

type Event = { slug: string; title: string; type: string; start: string; tz: string; agenda: { item: string }[] };

let api: Api;
let upcoming: Event[];
test.beforeAll(async () => {
  api = await Api.create();
  upcoming = (await json(await api.get("/events?when=upcoming"))).events;
});
test.afterAll(() => api.dispose());

test("home: the next Demo Day and the startup count come from the API", async ({ page }) => {
  const startups = (await json(await api.get("/startups"))).startups;
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Built to launch.");
  const demo = upcoming.find((e) => e.type === "Demo Day");
  const band = page.getByText(/Next edition ·/).first();
  await expect(band).toContainText(demo ? monthDay(demo.start, demo.tz) : "Date soon");
  await expect(page.locator("#startups")).toContainText(
    `${startups.length} ${startups.length === 1 ? "startup" : "startups"}`,
  );
});

test("events: the list, one event with its agenda, and a 404 for unknown ones", async ({ page }) => {
  await page.goto("/events");
  for (const e of upcoming.slice(0, 3)) await expect(page.getByText(e.title).first()).toBeVisible();

  const event = upcoming[0];
  await page.goto(`/events/${event.slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(event.title);
  if (event.agenda.length) await expect(page.getByText(event.agenda[0].item).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /reserve my spot/i })).toBeVisible();

  const missing = await page.goto("/events/no-such-event");
  expect(missing?.status()).toBe(404);
  await expect(page).toHaveTitle("Page not found — Fundup Club");
});

test("newsletter: the latest issue, an article, a 404", async ({ page }) => {
  const { posts } = await json(await api.get("/newsletter/posts"));
  await page.goto("/newsletter");
  await expect(page.getByText(posts[0].title).first()).toBeVisible();
  await page.goto(`/newsletter/${posts[0].slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(posts[0].title);
  const missing = await page.goto("/newsletter/no-such-issue");
  expect(missing?.status()).toBe(404);
});

test("startups: a new submission shows up at once, with only public details", async ({ page }) => {
  const founder = await submittedFounder(`E2E Directory ${uid()}`);
  const r = await reviewer();
  const slug = await slugOf(r, founder.id);

  await page.goto("/startups");
  await page.getByRole("searchbox").fill(founder.startup);
  await expect(page.getByRole("link", { name: founder.startup }).first()).toBeVisible();

  await page.goto(`/startups/${slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(founder.startup);
  await expect(page.getByText("Applied").first()).toBeVisible();
  const html = await page.content();
  for (const secret of [founder.email, "+44 20 7946 0000", "docsend.example"]) expect(html).not.toContain(secret);

  // A decision changes the public status within seconds.
  await r.post(`/admin/applications/${founder.id}/decisions`, { decision: "accept" });
  await expect(async () => {
    await page.reload();
    await expect(page.getByText("In the cohort").first()).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });
  await Promise.all([r.dispose(), founder.api.dispose()]);
});

test("demo day, about, legal pages and search-engine files", async ({ page, request }) => {
  for (const path of ["/demo-day", "/about", "/contact", "/privacy", "/terms", "/code-of-conduct"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
  }
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /dashboard");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain(`/events/${upcoming[0].slug}`);
});
