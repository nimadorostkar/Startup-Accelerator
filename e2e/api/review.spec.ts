import { expect, test } from "@playwright/test";
import { Api, fillApplication, json, newFounder, reviewer, submittedFounder } from "../support/api";
import { uid } from "../support/data";
import { emailsTo, waitForEmail } from "../support/mailpit";

const app = (id: string, tail = "") => `/admin/applications/${id}${tail}`;

test.describe("review panel", () => {
  test("everyone but reviewers gets a 404, signed-out visitors a 401", async () => {
    const target = await submittedFounder();
    const founder = await newFounder();
    const calls: [string, (api: Api) => ReturnType<Api["get"]>][] = [
      ["queue", (api) => api.get("/admin/applications")],
      ["detail", (api) => api.get(app(target.id))],
      ["decide", (api) => api.post(app(target.id, "/decisions"), { decision: "accept" })],
      ["assign", (api) => api.put(app(target.id, "/assignee"))],
      ["unassign", (api) => api.delete(app(target.id, "/assignee"))],
      ["scorecard", (api) => api.put(app(target.id, "/scorecard"), { scores: { problem: 5 } })],
      ["note", (api) => api.post(app(target.id, "/notes"), { body: "hi" })],
      ["export", (api) => api.get("/admin/export.csv")],
    ];
    for (const [name, call] of calls) {
      const response = await call(founder.api);
      expect(response.status(), name).toBe(404);
      expect(await response.json(), name).toEqual({ message: "Not found." });
    }
    const anon = await Api.create();
    expect((await anon.get("/admin/applications")).status()).toBe(401);
    // Nothing happened to the application.
    expect((await json(await target.api.get("/me/application"))).application.status).toBe("submitted");
    await Promise.all([anon.dispose(), founder.api.dispose(), target.api.dispose()]);
  });

  test("queue: search, filters, counts, sorting and paging", async () => {
    const tag = uid();
    const alpha = await submittedFounder(`E2E Alpha ${tag}`);
    const beta = await submittedFounder(`E2E Beta ${tag}`);
    const r = await reviewer();

    const found = await json(await r.get(`/admin/applications?status=submitted&q=${tag}&sort=name`));
    expect(found.rows.map((row: { startup: string }) => row.startup)).toEqual([`E2E Alpha ${tag}`, `E2E Beta ${tag}`]);
    expect(found.counts.submitted).toBe(2);
    expect(found.total).toBe(2);
    expect(found.rows[0]).toMatchObject({
      id: alpha.id,
      email: alpha.email,
      status: "submitted",
      stage: "traction",
      industry: "Fintech",
      percent: 100,
      waiting: 0,
      overdue: false,
      score: null,
      scorecards: 0,
      teamSize: 1,
      monthlyRevenue: 21000,
      seeking: 1200000,
    });
    expect(found.summary).toEqual(
      expect.objectContaining({ waiting: expect.any(Number), overdue: expect.any(Number) }),
    );

    // Filters that exclude them
    const otherStage = await json(await r.get(`/admin/applications?q=${tag}&stage=idea`));
    expect(otherStage.total).toBe(0);
    const otherIndustry = await json(await r.get(`/admin/applications?q=${tag}&industry=Education`));
    expect(otherIndustry.total).toBe(0);
    const mine = await json(await r.get(`/admin/applications?status=all&q=${tag}&mine=1`));
    expect(mine.total).toBe(0);

    // Paging
    const page2 = await json(await r.get(`/admin/applications?q=${tag}&sort=name&pageSize=1&page=2`));
    expect(page2).toMatchObject({ page: 2, pages: 2, pageSize: 1 });
    expect(page2.rows.map((row: { id: string }) => row.id)).toEqual([beta.id]);

    // Nonsense parameters fall back to the defaults
    const nonsense = await json(await r.get(`/admin/applications?status=bogus&sort=bogus&page=-3`));
    expect(nonsense.filters).toMatchObject({ status: "submitted", sort: "waiting", page: 1 });
    await Promise.all([r.dispose(), alpha.api.dispose(), beta.api.dispose()]);
  });

  test("decisions follow the table, and reach the founder", async () => {
    const founder = await submittedFounder();
    const r = await reviewer();
    const me = (await json(await r.get("/me"))).user;

    const detail = (await json(await r.get(app(founder.id)))).application;
    expect(detail.review).toEqual({ assigneeId: null, assigneeName: null, scorecards: [], notes: [] });
    expect(detail.slug).toBeTruthy();

    const start = await r.post(app(founder.id, "/decisions"), { decision: "start_review" });
    expect(start.status()).toBe(200);
    const started = (await json(start)).application;
    expect(started.status).toBe("in_review");
    expect(started.review.assigneeId).toBe(me.id); // starting a review claims it
    await waitForEmail(founder.email, "being reviewed");

    const again = await r.post(app(founder.id, "/decisions"), { decision: "start_review" });
    expect(again.status()).toBe(409);
    expect((await json(again)).message).toBe(
      'Someone got there first — this application is now "In review". Refresh to see the latest.',
    );

    const vague = await r.post(app(founder.id, "/decisions"), { decision: "request_changes", message: "More." });
    expect(vague.status()).toBe(422);
    expect((await json(vague)).errors.message).toBe("Tell the founder what to change — at least a sentence or two.");
    expect((await r.post(app(founder.id, "/decisions"), { decision: "approve!" })).status()).toBe(422);

    const message = "Please add retention numbers for the last six months, by cohort.";
    expect(
      (await r.post(app(founder.id, "/decisions"), { decision: "request_changes", message })).status(),
    ).toBe(200);
    const mail = await waitForEmail(founder.email, "needs a bit more");
    expect(mail.text).toContain(message);

    // The founder sees the request, without the reviewer behind it, and resubmits.
    const seen = (await json(await founder.api.get("/me/application"))).application;
    expect(seen.status).toBe("changes_requested");
    expect(seen.events.at(-1)).toMatchObject({ by: "support", kind: "status", title: "Changes requested", body: message });
    expect(seen.events.at(-1)).not.toHaveProperty("actor");
    expect(JSON.stringify(seen)).not.toContain(me.id);
    await founder.api.patch("/me/application/startup", { tagline: "Month-end close in a day, now with retention" });
    const resubmitted = await founder.api.post("/me/application/submit", { confirm: true });
    expect((await json(resubmitted)).application.events.at(-1).title).toBe("Application resubmitted");

    expect((await r.post(app(founder.id, "/decisions"), { decision: "accept", message: "Welcome!" })).status()).toBe(
      200,
    );
    expect((await waitForEmail(founder.email, "You're in")).text).toContain("Welcome!");
    expect((await json(await founder.api.get("/me/application"))).application.status).toBe("accepted");

    expect((await r.post(app(founder.id, "/decisions"), { decision: "reopen" })).status()).toBe(200);
    expect((await r.post(app(founder.id, "/decisions"), { decision: "decline" })).status()).toBe(200);
    expect((await json(await founder.api.get("/me/application"))).application.status).toBe("declined");
    await Promise.all([r.dispose(), founder.api.dispose()]);
  });

  test("drafts can't be decided", async () => {
    const founder = await newFounder();
    await founder.api.get("/me/application");
    const r = await reviewer();
    const response = await r.post(app(founder.id, "/decisions"), { decision: "accept" });
    expect(response.status()).toBe(409);
    await Promise.all([r.dispose(), founder.api.dispose()]);
  });

  test("two reviewers deciding at once: exactly one wins", async () => {
    const founder = await submittedFounder();
    const [first, second] = await Promise.all([reviewer(), reviewer()]);
    const results = await Promise.all([
      first.post(app(founder.id, "/decisions"), { decision: "accept" }),
      second.post(app(founder.id, "/decisions"), { decision: "decline" }),
    ]);
    expect(results.map((r) => r.status()).sort()).toEqual([200, 409]);
    const detail = (await json(await first.get(app(founder.id)))).application;
    expect(detail.events.filter((e: { kind: string }) => e.kind === "status")).toHaveLength(1);
    await Promise.all([first.dispose(), second.dispose(), founder.api.dispose()]);
  });

  test("assignment, scorecards and internal notes stay with the review team", async () => {
    const founder = await submittedFounder();
    const r = await reviewer();
    const me = (await json(await r.get("/me"))).user;

    const assigned = (await json(await r.put(app(founder.id, "/assignee")))).application;
    expect(assigned.review).toMatchObject({ assigneeId: me.id, assigneeName: me.name });
    expect((await json(await r.delete(app(founder.id, "/assignee")))).application.review.assigneeId).toBeNull();

    const invalid = await r.put(app(founder.id, "/scorecard"), {
      scores: { problem: 6, market: "2.5" },
      recommendation: "maybe",
      summary: "x".repeat(2001),
    });
    expect(invalid.status()).toBe(422);
    expect((await json(invalid)).errors).toEqual({
      "score-problem": "Score from 1 to 5.",
      "score-market": "Score from 1 to 5.",
      recommendation: "Pick a recommendation.",
      summary: "Keep this under 2000 characters.",
    });

    // The form's flat fields and the nested shape both work; each save replaces your card.
    await r.put(app(founder.id, "/scorecard"), { "score-problem": "5", "score-team": "3", summary: "SECRET-SUMMARY" });
    const card = await r.put(app(founder.id, "/scorecard"), {
      scores: { problem: 4, team: 4 },
      recommendation: "interview",
      summary: "SECRET-SUMMARY",
    });
    const { review } = (await json(card)).application;
    expect(review.scorecards).toHaveLength(1);
    expect(review.scorecards[0]).toMatchObject({ scores: { problem: 4, team: 4 }, recommendation: "interview" });

    expect((await r.post(app(founder.id, "/notes"), { body: "" })).status()).toBe(422);
    const note = await r.post(app(founder.id, "/notes"), { body: "SECRET-NOTE: call two references" });
    expect(note.status()).toBe(201);
    expect((await json(note)).application.review.notes[0]).toMatchObject({ authorId: me.id });

    const row = (await json(await r.get(`/admin/applications?q=${encodeURIComponent(founder.startup)}`))).rows[0];
    expect(row).toMatchObject({ score: 4, scorecards: 1, recommendations: ["interview"] });

    // None of it reaches the founder.
    const raw = await (await founder.api.get("/me/application")).text();
    for (const marker of ["SECRET-NOTE", "SECRET-SUMMARY", '"review"', me.id]) expect(raw).not.toContain(marker);
    await Promise.all([r.dispose(), founder.api.dispose()]);
  });

  test("CSV export: every application, safe for spreadsheets", async () => {
    const tag = uid();
    const founder = await newFounder();
    const api = founder.api;
    await fillApplication(api, `=HYPERLINK("evil") ${tag}`);
    await api.patch("/me/application/startup", { tagline: '+1 more, with "quotes"\nand a line break' });
    await api.post("/me/application/submit", { confirm: true });

    const r = await reviewer();
    const response = await r.get("/admin/export.csv");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("text/csv; charset=utf-8");
    expect(response.headers()["cache-control"]).toBe("no-store");
    expect(response.headers()["content-disposition"]).toMatch(/^attachment; filename="fundup-club-applications-/);
    const bytes = await response.body();
    expect([...bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf]); // UTF-8 BOM for Excel
    const text = bytes.toString("utf8").slice(1);
    const header = text.split("\r\n")[0].split(",");
    expect(header).toHaveLength(33);
    expect(text).toContain(`"'=HYPERLINK(""evil"") ${tag}"`); // a formula, defused and escaped
    expect(text).toContain(`"'+1 more, with ""quotes""\nand a line break"`);
    expect(text).toContain(founder.email);
    await Promise.all([r.dispose(), api.dispose()]);
  });

  test("reviewers get the new-application email", async () => {
    const founder = await submittedFounder(`E2E Mail ${uid()}`);
    const r = await reviewer();
    const me = (await json(await r.get("/me"))).user;
    const mail = await waitForEmail(me.email, `New application: ${founder.startup}`);
    expect(mail.text).toContain(`/admin/applications/${founder.id}`);
    expect(mail.to).toEqual([me.email]); // one email per reviewer, nobody else's address
    expect((await emailsTo(me.email, founder.startup)).length).toBeGreaterThan(0);
    await Promise.all([r.dispose(), founder.api.dispose()]);
  });
});
