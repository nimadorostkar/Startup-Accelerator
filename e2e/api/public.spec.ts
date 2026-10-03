import { expect, test } from "@playwright/test";
import { Api, json, reviewer, slugOf, submittedFounder } from "../support/api";
import { uid, uniqueEmail } from "../support/data";
import { emailsTo, linkIn, waitForEmail } from "../support/mailpit";

type Event = { slug: string; start: string; end: string; type: string; format: string };

test.describe("startup directory", () => {
  test("submitted startups appear with public fields only; status follows decisions", async () => {
    const founder = await submittedFounder(`E2E Public ${uid()}`);
    const r = await reviewer();
    const slug = await slugOf(r, founder.id);
    const anon = await Api.create();

    const list = await json(await anon.get("/startups"));
    const card = list.startups.find((s: { slug: string }) => s.slug === slug);
    expect(card).toMatchObject({ name: founder.startup, status: "applied", stageLabel: "Traction", users: 1400 });

    const detail = await anon.get(`/startups/${slug}`);
    expect(detail.status()).toBe(200);
    const raw = await detail.text();
    for (const secret of [founder.email, "+44 20 7946 0000", "21000", "1200000", "docsend.example", '"equity"'])
      expect(raw, secret).not.toContain(secret);
    expect((await json(detail)).startup.timeline[0]).toEqual({
      at: expect.any(String),
      title: "Application submitted for review",
    });

    await r.post(`/admin/applications/${founder.id}/decisions`, { decision: "accept" });
    const accepted = (await json(await anon.get(`/startups/${slug}`))).startup;
    expect(accepted.status).toBe("cohort");

    expect((await anon.get("/startups/no-such-startup")).status()).toBe(404);
    await Promise.all([anon.dispose(), r.dispose(), founder.api.dispose()]);
  });

  test("withdrawn applications leave the directory", async () => {
    const founder = await submittedFounder();
    const r = await reviewer();
    const slug = await slugOf(r, founder.id);
    const anon = await Api.create();
    expect((await anon.get(`/startups/${slug}`)).status()).toBe(200);
    await founder.api.post("/me/application/withdraw");
    expect((await anon.get(`/startups/${slug}`)).status()).toBe(404);
    await Promise.all([anon.dispose(), r.dispose(), founder.api.dispose()]);
  });
});

test.describe("events", () => {
  let anon: Api;
  let upcoming: Event[];
  let past: Event[];
  test.beforeAll(async () => {
    anon = await Api.create();
    upcoming = (await json(await anon.get("/events?when=upcoming"))).events;
    past = (await json(await anon.get("/events?when=past"))).events;
  });
  test.afterAll(() => anon.dispose());

  test("lists: upcoming soonest first, past most recent first", async () => {
    expect(upcoming.length).toBeGreaterThan(0);
    const starts = upcoming.map((e) => Date.parse(e.start));
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
    expect(upcoming.every((e) => Date.parse(e.end) >= Date.now())).toBe(true);
    const pastStarts = past.map((e) => Date.parse(e.start));
    expect(pastStarts).toEqual([...pastStarts].sort((a, b) => b - a));
    const all = (await json(await anon.get("/events"))).events;
    expect(all).toHaveLength(upcoming.length + past.length);
  });

  test("one event: the page's shape, never the private joining details", async () => {
    const response = await anon.get(`/events/${upcoming[0].slug}`);
    const { event } = await json(response);
    expect(Object.keys(event).sort()).toEqual(
      [
        "about",
        "agenda",
        "audience",
        "capacity",
        "city",
        "end",
        "format",
        "slug",
        "start",
        "summary",
        "takeaways",
        "title",
        "type",
        "tz",
      ].sort(),
    );
    expect(event.start).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/); // local offset
    expect((await anon.get("/events/no-such-event")).status()).toBe(404);
  });

  test("registration: new, again, invalid, ended, unknown, bot", async () => {
    const event = upcoming[0];
    const guest = uniqueEmail("guest");
    const body = { name: "Lena Ortiz", email: guest.toUpperCase(), company: "Relaywave" };
    const first = await anon.post(`/events/${event.slug}/registrations`, body);
    expect(first.status()).toBe(201);
    expect(await first.json()).toMatchObject({ existing: false });
    const again = await anon.post(`/events/${event.slug}/registrations`, { ...body, email: guest });
    expect(again.status()).toBe(200);
    expect(await again.json()).toMatchObject({ existing: true });

    const mail = await waitForEmail(guest, "You're registered");
    expect(mail.attachments).toContainEqual({ fileName: "invite.ics", contentType: "text/calendar" });
    expect(mail.text).toMatch(/When: .+/);
    expect(await emailsTo(guest, "You're registered")).toHaveLength(1); // not again for the repeat

    const invalid = await anon.post(`/events/${event.slug}/registrations`, { name: "L", email: "x" });
    expect(invalid.status()).toBe(422);
    expect(Object.keys((await json(invalid)).errors).sort()).toEqual(["email", "name"]);

    if (past.length) {
      const ended = await anon.post(`/events/${past[0].slug}/registrations`, { ...body, email: uniqueEmail() });
      expect(ended.status()).toBe(409);
      expect((await json(ended)).message).toBe("Registration for this event has closed.");
    }
    const unknown = await anon.post("/events/no-such-event/registrations", body);
    expect(unknown.status()).toBe(404);
    expect((await json(unknown)).message).toBe("We couldn't find that event.");

    const bot = uniqueEmail("bot");
    const trapped = await anon.post(`/events/${event.slug}/registrations`, {
      name: "Spam Bot",
      email: bot,
      website: "http://spam.example",
    });
    expect(trapped.status()).toBe(201); // looks like it worked…
    await new Promise((r) => setTimeout(r, 1500));
    expect(await emailsTo(bot)).toHaveLength(0); // …but nothing was stored or sent
  });
});

test.describe("newsletter", () => {
  test("issues: the list without text, one with its blocks", async () => {
    const anon = await Api.create();
    const { posts } = await json(await anon.get("/newsletter/posts"));
    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0]).not.toHaveProperty("body");
    const dates = posts.map((p: { date: string }) => p.date);
    expect(dates).toEqual([...dates].sort().reverse());
    const { post } = await json(await anon.get(`/newsletter/posts/${posts[0].slug}`));
    expect(post.title).toBe(posts[0].title);
    expect(post.body.length).toBeGreaterThan(0);
    for (const block of post.body) expect(["p", "h2", "list", "quote"]).toContain(block.type);
    expect((await anon.get("/newsletter/posts/no-such-issue")).status()).toBe(404);
    await anon.dispose();
  });

  test("subscribe, already subscribed, unsubscribe, come back", async () => {
    const anon = await Api.create();
    const email = uniqueEmail("reader");
    const first = await anon.post("/newsletter/subscribers", { email, source: "e2e" });
    expect(first.status()).toBe(201);
    expect(await first.json()).toEqual({ status: "new" });
    const again = await anon.post("/newsletter/subscribers", { email: email.toUpperCase() });
    expect(again.status()).toBe(200);
    expect(await again.json()).toEqual({ status: "existing" });

    const welcome = await waitForEmail(email, "Welcome to The Founder Brief");
    const link = linkIn(welcome, "/newsletter/unsubscribe?token=");
    const token = new URL(link).searchParams.get("token")!;
    expect(link).not.toContain(email.split("@")[0]); // the link never names the address

    const out = await anon.post("/newsletter/unsubscribe", { token });
    expect(out.status()).toBe(200);
    expect(await out.json()).toEqual({ email });
    expect((await anon.post("/newsletter/unsubscribe", { token: "forged" })).status()).toBe(400);

    const back = await anon.post("/newsletter/subscribers", { email });
    expect(await back.json()).toEqual({ status: "new" });

    const invalid = await anon.post("/newsletter/subscribers", { email: "nope" });
    expect(invalid.status()).toBe(422);
    expect((await json(invalid)).message).toBe("That doesn't look like a valid email address.");
    await anon.dispose();
  });
});

test.describe("contact", () => {
  test("a message reaches the team, with the sender as reply-to", async () => {
    const anon = await Api.create();
    const email = uniqueEmail("press");
    const marker = `E2E contact ${uid()}`;
    const response = await anon.post("/contact", {
      name: "Lena Ortiz",
      email,
      company: "Relaywave",
      topic: "Press",
      message: `${marker}: could we interview a founder from the cohort?`,
    });
    expect(response.status()).toBe(201);
    expect(await response.json()).toEqual({ sent: { name: "Lena Ortiz", email } });

    // It goes to SUPPORT_EMAILS, or every reviewer; the dev reviewer is one of them.
    const r = await reviewer();
    const me = (await json(await r.get("/me"))).user;
    let mail: Awaited<ReturnType<typeof emailsTo>>[number] | undefined;
    await expect
      .poll(async () => {
        mail = (await emailsTo(me.email, "[Contact] Press — Lena Ortiz")).find((m) => m.text.includes(marker));
        return Boolean(mail);
      })
      .toBe(true);
    expect(mail!.replyTo).toEqual([email]);
    await r.dispose();

    const invalid = await anon.post("/contact", { name: "L", email: "x", topic: "Other", message: "short" });
    expect(invalid.status()).toBe(422);
    expect((await json(invalid)).errors).toEqual({
      name: "That name looks too short.",
      email: "That doesn't look like a valid email address.",
      topic: "Choose what this is about.",
      message: "Tell us a little more (at least 10 characters).",
    });
    await anon.dispose();
  });
});
