import { expect, test } from "@playwright/test";
import { Api, fillApplication, json, newFounder, submittedFounder } from "../support/api";
import { PROFILE, uid } from "../support/data";
import { waitForEmail } from "../support/mailpit";

test.describe("founder application", () => {
  test("first visit creates a blank draft, never with reviewer data", async () => {
    const founder = await newFounder("Maya Rosen");
    const { application } = await json(await founder.api.get("/me/application"));
    expect(application).toMatchObject({ userId: founder.id, status: "draft", submittedAt: null });
    expect(application).not.toHaveProperty("review");
    expect(application.profile).toMatchObject({ fullName: "Maya Rosen", email: founder.email });
    expect(application.team.members).toEqual([
      expect.objectContaining({ name: "Maya Rosen", email: founder.email, isFounder: true }),
    ]);
    expect(application.events.map((e: { kind: string }) => e.kind)).toEqual(["created"]);
    expect(application.progress).toMatchObject({ percent: 10, ready: false });
    expect(application.progress.missing).toHaveLength(19);

    const again = await json(await founder.api.get("/me/application"));
    expect(again.application.createdAt).toBe(application.createdAt); // created once
    await founder.api.dispose();
  });

  test("saves normalise what was typed and ignore the email field", async () => {
    const founder = await newFounder();
    const profile = await json(
      await founder.api.patch("/me/application/profile", { ...PROFILE, email: "hacker@evil.example" }),
    );
    expect(profile.application.profile).toMatchObject({
      linkedin: "https://linkedin.com/in/maya-rosen",
      experienceYears: 6,
      email: founder.email,
    });
    const startup = await json(
      await founder.api.patch("/me/application/startup", {
        name: "Normalised",
        website: "normalised.example",
        activeUsers: "1,400",
        growthRate: "12.5",
      }),
    );
    expect(startup.application.startup).toMatchObject({
      website: "https://normalised.example",
      activeUsers: 1400,
      growthRate: 12.5,
      tagline: "", // untouched fields keep their value
    });
    await founder.api.dispose();
  });

  test("field errors come back under the form's field names", async () => {
    const founder = await newFounder();
    const profile = await founder.api.patch("/me/application/profile", {
      phone: "12ab",
      linkedin: "twitter.com/maya",
      experienceYears: "61",
      commitment: "weekends",
    });
    expect(profile.status()).toBe(422);
    expect(await profile.json()).toEqual({
      message: "Some fields need another look — they're highlighted below.",
      errors: {
        phone: "Enter a phone number with country code, e.g. +1 415 555 0100.",
        linkedin: "Use your LinkedIn profile link (linkedin.com/in/…).",
        experienceYears: "That's more than 60 years.",
        commitment: "Pick an option.",
      },
    });
    const startup = await founder.api.patch("/me/application/startup", {
      website: "not a link",
      industry: "Crypto",
      stage: "unicorn",
      foundedOn: "2999-01",
      growthRate: "1001",
    });
    expect((await json(startup)).errors).toEqual({
      website: "That doesn't look like a valid link.",
      industry: "Pick an industry.",
      stage: "Pick a stage.",
      foundedOn: "Pick a month that isn't in the future.",
      growthRate: "That looks too high — use % per month.",
    });
    const team = await founder.api.patch("/me/application/team", { workedTogether: "Forever", whyUs: "x".repeat(1201) });
    expect((await json(team)).errors).toEqual({
      workedTogether: "Pick an option.",
      whyUs: "Keep this to 1200 characters or fewer.",
    });
    await founder.api.dispose();
  });

  test("team members: add, edit, remove, and the equity cap", async () => {
    const founder = await newFounder();
    const [me] = (await json(await founder.api.get("/me/application"))).application.team.members;
    await founder.api.patch(`/me/application/team/members/${me.id}`, { role: "CEO", equity: 60 });

    const added = await founder.api.post("/me/application/team/members", {
      name: "Tom Achebe",
      role: "CTO",
      equity: "40",
      isFounder: "on",
      linkedin: "linkedin.com/in/tom",
    });
    expect(added.status()).toBe(201);
    const { memberId, application } = await json(added);
    expect(application.team.members[1]).toMatchObject({
      id: memberId,
      linkedin: "https://linkedin.com/in/tom",
      isFounder: true,
      equity: 40,
    });

    const over = await founder.api.post("/me/application/team/members", { name: "Ife", role: "COO", equity: 1 });
    expect(over.status()).toBe(422);
    expect((await json(over)).errors.equity).toBe("That brings team equity to 101% — it can't exceed 100%.");

    const edited = await founder.api.patch(`/me/application/team/members/${memberId}`, { role: "CTO & co-founder" });
    expect((await json(edited)).application.team.members[1]).toMatchObject({ role: "CTO & co-founder", equity: 40 });

    const invalid = await founder.api.post("/me/application/team/members", { name: "", role: "" });
    expect((await json(invalid)).errors).toEqual({ name: "Add their name.", role: "Add their role, e.g. CTO." });
    expect((await founder.api.delete(`/me/application/team/members/${crypto.randomUUID()}`)).status()).toBe(404);

    expect((await founder.api.delete(`/me/application/team/members/${memberId}`)).status()).toBe(200);
    const last = await founder.api.delete(`/me/application/team/members/${me.id}`);
    expect(last.status()).toBe(409);
    expect((await json(last)).message).toBe("Your team needs at least one person.");
    await founder.api.dispose();
  });

  test("equity: parallel saves can't add up past 100%", async () => {
    const founder = await newFounder();
    const [me] = (await json(await founder.api.get("/me/application"))).application.team.members;
    await founder.api.patch(`/me/application/team/members/${me.id}`, { role: "CEO", equity: 40 });
    const results = await Promise.all(
      ["Tom", "Ife", "Sam"].map((name) =>
        founder.api.post("/me/application/team/members", { name, role: "CTO", equity: 40 }),
      ),
    );
    expect(results.map((r) => r.status()).sort()).toEqual([201, 422, 422]);
    const members = (await json(await founder.api.get("/me/application"))).application.team.members;
    expect(members.reduce((sum: number, m: { equity: number | null }) => sum + (m.equity ?? 0), 0)).toBe(80);
    await founder.api.dispose();
  });

  test("submit: refused until complete, then locked, withdrawn, resubmitted", async () => {
    const founder = await newFounder();
    const early = await founder.api.post("/me/application/submit", { confirm: true });
    expect(early.status()).toBe(422);
    const refusal = await json(early);
    expect(refusal.message).toBe("19 required answers are still missing.");
    expect(refusal.missing).toContainEqual({ section: "startup", field: "problem", label: "Problem" });

    const name = await fillApplication(founder.api);
    const noConfirm = await founder.api.post("/me/application/submit", {});
    expect((await json(noConfirm)).errors).toEqual({ confirm: "Please confirm the details are accurate." });

    const submitted = await founder.api.post("/me/application/submit", { confirm: true });
    expect(submitted.status()).toBe(200);
    const { application } = await json(submitted);
    expect(application).toMatchObject({ status: "submitted" });
    expect(application.submittedAt).toBeTruthy();
    expect(application.events.at(-1).title).toBe("Application submitted for review");
    const confirmation = await waitForEmail(founder.email, "We have your Fundup Club application");
    expect(confirmation.text).toContain(name);

    for (const [method, path, body] of [
      ["patch", "/me/application/profile", { fullName: "Changed" }],
      ["patch", "/me/application/startup", { name: "Changed" }],
      ["patch", "/me/application/team", { whyUs: "Changed" }],
      ["post", "/me/application/team/members", { name: "New", role: "CTO" }],
    ] as const) {
      const response = await founder.api[method](path, body);
      expect(response.status()).toBe(409);
      expect((await json(response)).message).toBe(
        "This application is with the review team and can't be edited right now.",
      );
    }

    const withdrawn = await json(await founder.api.post("/me/application/withdraw"));
    expect(withdrawn.application).toMatchObject({ status: "draft", submittedAt: null });
    expect(withdrawn.application.events.at(-1).kind).toBe("withdrawn");
    expect((await founder.api.post("/me/application/withdraw")).status()).toBe(409);
    expect((await founder.api.post("/me/application/submit", { confirm: true })).status()).toBe(200);
    await founder.api.dispose();
  });

  test("founders only ever reach their own application", async () => {
    const first = await submittedFounder(`E2E Private ${uid()}`);
    const second = await newFounder();
    const theirs = (await json(await second.api.get("/me/application"))).application;
    expect(theirs.userId).toBe(second.id);
    expect(theirs.startup.name).toBe("");
    // No endpoint takes an id: the reviewer routes are a 404 for founders.
    expect((await second.api.get(`/admin/applications/${first.id}`)).status()).toBe(404);
    await Promise.all([first.api.dispose(), second.api.dispose()]);
  });

  test("anonymous callers get 401 everywhere in the dashboard", async () => {
    const anon = await Api.create();
    for (const response of [
      await anon.get("/me/application"),
      await anon.patch("/me/application/profile", { fullName: "Nobody" }),
      await anon.post("/me/application/team/members", { name: "Nobody", role: "CTO" }),
      await anon.post("/me/application/submit", { confirm: true }),
      await anon.post("/me/application/withdraw"),
    ]) {
      expect(response.status(), response.url()).toBe(401);
    }
    await anon.dispose();
  });
});
