import { expect, test, type Page } from "@playwright/test";
import { json, newFounder, reviewer, slugOf } from "../support/api";
import { PROFILE, startup, TEAM, uid } from "../support/data";
import { waitForEmail } from "../support/mailpit";
import { signInAs } from "../support/web";

/* The whole application lifecycle through the website, in two browsers:
   a founder fills in and submits their application, a reviewer starts a
   review and asks for changes, the founder resubmits, the reviewer scores,
   notes and accepts — and the public directory follows along. */

async function fillFields(page: Page, values: Record<string, string>) {
  for (const [name, value] of Object.entries(values)) {
    const field = page.locator(`[name="${name}"]`).first();
    const tag = await field.evaluate((el) => `${el.tagName}:${(el as HTMLInputElement).type}`);
    if (tag === "SELECT:select-one") await field.selectOption(value);
    else if (tag.endsWith(":radio")) await page.locator(`input[name="${name}"][value="${value}"]`).check();
    else await field.fill(value);
  }
}

async function save(page: Page) {
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Changes saved.")).toBeVisible();
}

test("apply, review, request changes, resubmit, accept", async ({ browser }) => {
  test.setTimeout(180_000);
  const name = `E2E Lifecycle ${uid()}`;

  // ---------------------------------------------------------------- the founder applies
  const founder = await newFounder("Maya Rosen");
  const founderContext = await browser.newContext();
  await signInAs(founderContext, founder.token);
  const f = await founderContext.newPage();

  await f.goto("/dashboard/profile");
  await f.locator('[name="linkedin"]').fill("twitter.com/maya"); // a mistake first
  await f.getByRole("button", { name: "Save", exact: true }).click();
  await expect(f.getByText("Use your LinkedIn profile link (linkedin.com/in/…).")).toBeVisible();
  await fillFields(f, PROFILE);
  await save(f);

  await f.goto("/dashboard/startup");
  const { demoUrl, videoUrl, ...answers } = startup(name);
  void demoUrl;
  void videoUrl;
  await fillFields(f, answers);
  await save(f);

  await f.goto("/dashboard/team");
  await fillFields(f, TEAM);
  await save(f);
  // The member card (role, equity) through the API: its inline editor isn't what this test is about.
  const [me] = (await json(await founder.api.get("/me/application"))).application.team.members;
  await founder.api.patch(`/me/application/team/members/${me.id}`, { role: "CEO", equity: 100 });

  await f.goto("/dashboard/review");
  await expect(f.getByText("Everything required is answered")).toBeVisible();
  await f.locator('input[name="confirm"]').check();
  await f.getByRole("button", { name: "Submit application" }).click();
  // The page turns into the read-only "Your application", with the way back to editing.
  await expect(f.getByRole("heading", { level: 1, name: "Your application" })).toBeVisible();
  await expect(f.getByRole("button", { name: "Withdraw to make changes" })).toBeVisible();
  await waitForEmail(founder.email, "We have your Fundup Club application");

  // ---------------------------------------------------------------- the reviewer starts and asks for changes
  const r = await reviewer();
  const reviewerContext = await browser.newContext();
  await signInAs(reviewerContext, r.token!);
  const rv = await reviewerContext.newPage();

  await rv.goto("/admin");
  await rv.locator('input[name="q"]').fill(name);
  await rv.locator('input[name="q"]').press("Enter");
  await rv.getByRole("link", { name }).first().click();
  await expect(rv.getByRole("heading", { name })).toBeVisible();

  await rv.getByRole("button", { name: "Start review" }).click();
  await rv.getByRole("button", { name: "Confirm: start review" }).click();
  await expect(rv.getByText("Start review — done.")).toBeVisible();

  const request = "Please add retention numbers for the last six months, by cohort.";
  await rv.getByRole("button", { name: "Request changes" }).click();
  await rv.locator('textarea[name="message"]').fill(request);
  await rv.getByRole("button", { name: "Confirm: request changes" }).click();
  await expect(rv.getByText("Request changes — done.")).toBeVisible();
  await waitForEmail(founder.email, "needs a bit more");

  // ---------------------------------------------------------------- the founder sees it and resubmits
  await f.goto("/dashboard");
  await expect(f.getByText(request).first()).toBeVisible();
  await f.goto("/dashboard/startup");
  await f.locator('[name="tagline"]').fill("Month-end close for agencies, now with retention by cohort");
  await save(f);
  await f.goto("/dashboard/review");
  await f.locator('input[name="confirm"]').check();
  await f.getByRole("button", { name: "Resubmit application" }).click();
  await expect(f.getByRole("heading", { level: 1, name: "Your application" })).toBeVisible();
  await waitForEmail(founder.email, "We have your updated application");

  // ---------------------------------------------------------------- the reviewer scores, notes and accepts
  await rv.reload();
  for (const [area, score] of [["problem", "5"], ["solution", "4"], ["market", "4"], ["team", "5"], ["traction", "3"]])
    await rv.locator(`input[name="score-${area}"][value="${score}"]`).check({ force: true });
  await rv.locator('input[name="recommendation"][value="accept"]').check({ force: true });
  await rv.locator('textarea[name="summary"]').fill("Strong founder–market fit; retention now convincing.");
  await rv.getByRole("button", { name: "Save scorecard" }).click();
  await expect(rv.getByText("Scorecard saved.")).toBeVisible();

  await rv.locator('textarea[name="body"]').fill("Call two of their agency customers before Demo Day.");
  await rv.getByRole("button", { name: "Add note" }).click();
  await expect(rv.getByText("Note added. Only the review team can see it.")).toBeVisible();

  await rv.getByRole("button", { name: "Accept" }).click();
  await rv.locator('textarea[name="message"]').fill("Welcome to the cohort!");
  await rv.getByRole("button", { name: "Confirm: accept" }).click();
  await expect(rv.getByText("Accept — done.")).toBeVisible();
  expect((await waitForEmail(founder.email, "You're in")).text).toContain("Welcome to the cohort!");

  // The queue shows the team score.
  await rv.goto(`/admin?status=accepted&q=${encodeURIComponent(name)}`);
  await expect(rv.getByText("4.2").first()).toBeVisible();

  // ---------------------------------------------------------------- what the founder and the public see
  await f.goto("/dashboard");
  await expect(f.getByText("You're in the cohort").first()).toBeVisible();
  const page = await f.content();
  for (const secret of ["Call two of their agency customers", "Strong founder–market fit"])
    expect(page).not.toContain(secret); // reviewer-only notes and scorecards never reach the founder

  const slug = await slugOf(r, founder.id);
  await f.goto(`/startups/${slug}`);
  await expect(f.getByText("In the cohort").first()).toBeVisible();

  // ---------------------------------------------------------------- the reviewer's export includes it
  const csv = await rv.request.get("/admin/export");
  expect(csv.status()).toBe(200);
  expect(await csv.text()).toContain(name);

  await Promise.all([founderContext.close(), reviewerContext.close(), r.dispose(), founder.api.dispose()]);
});
