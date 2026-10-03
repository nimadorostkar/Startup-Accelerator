import { expect, test } from "@playwright/test";
import { Api, json, newFounder, sessionCookieAttributes, sessionToken } from "../support/api";
import { PASSWORD, uniqueEmail } from "../support/data";
import { SITE } from "../support/env";
import { emailsTo, linkIn, waitForEmail } from "../support/mailpit";

test.describe("accounts", () => {
  test("register: signed in, session cookie, confirmation email", async () => {
    const api = await Api.create();
    const email = uniqueEmail();
    const response = await api.post("/auth/register", {
      name: "Lena Ortiz",
      email: email.toUpperCase(),
      password: PASSWORD,
      terms: true,
    });
    expect(response.status()).toBe(201);
    const { user } = await json(response);
    expect(user).toMatchObject({ email, name: "Lena Ortiz", role: "founder", emailVerified: false, isReviewer: false });

    const cookie = sessionCookieAttributes(response);
    expect(cookie).toHaveProperty("httponly");
    expect(cookie.samesite).toBe("Lax");
    expect(cookie.path).toBe("/");
    expect(cookie).not.toHaveProperty("max-age"); // no "keep me signed in" on sign-up

    const mail = await waitForEmail(email, "Confirm your email");
    expect(linkIn(mail, "/verify-email?token=")).toContain(`${SITE}/verify-email?token=`);
    await api.dispose();
  });

  test("register: every field is checked, in the form's words", async () => {
    const api = await Api.create();
    const response = await api.post("/auth/register", { name: "L", email: "nope", password: "password1" });
    expect(response.status()).toBe(422);
    expect((await json(response)).errors).toEqual({
      name: "That name looks too short.",
      email: "That doesn't look like a valid email address.",
      password: "That password is too common. Choose one that's harder to guess.",
      terms: "Please accept the terms to continue.",
    });
    const weak = await api.post("/auth/register", {
      name: "Lena",
      email: uniqueEmail(),
      password: "onlyletters",
      terms: true,
    });
    expect((await json(weak)).errors).toEqual({ password: "Include at least one number." });
    await api.dispose();
  });

  test("register: a taken address, in any case", async () => {
    const founder = await newFounder();
    const api = await Api.create();
    const response = await api.post("/auth/register", {
      name: "Someone Else",
      email: founder.email.toUpperCase(),
      password: PASSWORD,
      terms: true,
    });
    expect(response.status()).toBe(422);
    expect((await json(response)).errors).toEqual({ email: "That email is already registered." });
    await Promise.all([api.dispose(), founder.api.dispose()]);
  });

  test("login: remember me, and one message for every wrong answer", async () => {
    const founder = await newFounder();
    const api = await Api.create();

    const remembered = await api.post("/auth/login", { email: founder.email, password: PASSWORD, remember: true });
    expect(remembered.status()).toBe(200);
    expect(sessionCookieAttributes(remembered)["max-age"]).toBe(String(30 * 24 * 3600));

    const wrongPassword = await api.post("/auth/login", { email: founder.email, password: "not-it-123" });
    const unknownEmail = await api.post("/auth/login", { email: uniqueEmail("nobody"), password: "not-it-123" });
    expect(wrongPassword.status()).toBe(401);
    expect(unknownEmail.status()).toBe(401);
    expect(await wrongPassword.json()).toEqual(await unknownEmail.json());

    const empty = await api.post("/auth/login", { email: "", password: "" });
    expect(empty.status()).toBe(422);
    expect(Object.keys((await json(empty)).errors)).toEqual(["email", "password"]);
    await Promise.all([api.dispose(), founder.api.dispose()]);
  });

  test("me: by Bearer token or by cookie; rename", async () => {
    const founder = await newFounder("Tom Achebe");
    const me = await founder.api.get("/me");
    expect((await json(me)).user).toMatchObject({ email: founder.email, name: "Tom Achebe", hasPassword: true });

    // The same session as a browser would send it (reads need no Origin).
    const browser = await Api.create({ headers: { Cookie: `vcs_session=${founder.token}` } });
    expect((await browser.get("/me")).status()).toBe(200);

    const renamed = await founder.api.patch("/me", { name: "Tom A. Achebe" });
    expect((await json(renamed)).user.name).toBe("Tom A. Achebe");
    expect((await founder.api.patch("/me", { name: "T" })).status()).toBe(422);
    await Promise.all([browser.dispose(), founder.api.dispose()]);
  });

  test("change password: keeps this session, ends the others", async () => {
    const founder = await newFounder();
    const otherDevice = await Api.create();
    const login = await otherDevice.post("/auth/login", { email: founder.email, password: PASSWORD });
    otherDevice.token = sessionToken(login);

    const wrong = await founder.api.post("/me/password", { currentPassword: "nope", newPassword: "Another-pass-9" });
    expect(wrong.status()).toBe(422);
    expect((await json(wrong)).errors.currentPassword).toBe("That's not your current password.");

    const ok = await founder.api.post("/me/password", { currentPassword: PASSWORD, newPassword: "Another-pass-9" });
    expect(ok.status()).toBe(204);
    expect((await founder.api.get("/me")).status()).toBe(200);
    expect((await otherDevice.get("/me")).status()).toBe(401);
    await waitForEmail(founder.email, "password was changed");

    const fresh = await Api.create();
    expect((await fresh.post("/auth/login", { email: founder.email, password: "Another-pass-9" })).status()).toBe(200);
    await Promise.all([fresh.dispose(), otherDevice.dispose(), founder.api.dispose()]);
  });

  test("logout revokes the session on the server", async () => {
    const founder = await newFounder();
    const response = await founder.api.post("/auth/logout");
    expect(response.status()).toBe(204);
    expect((await founder.api.get("/me")).status()).toBe(401); // a copied token stops working too
    await founder.api.dispose();
  });

  test("email verification: resend, confirm once, bad links refused", async () => {
    const founder = await newFounder();
    const resend = await founder.api.post("/auth/verify-email/resend");
    expect(resend.status()).toBe(202);
    await expect.poll(async () => (await emailsTo(founder.email, "Confirm your email")).length).toBeGreaterThanOrEqual(2);
    const [latest] = await emailsTo(founder.email, "Confirm your email");
    const token = new URL(linkIn(latest, "/verify-email?token=")).searchParams.get("token")!;

    const anon = await Api.create();
    const confirmed = await anon.post("/auth/verify-email", { token });
    expect(confirmed.status()).toBe(200);
    expect((await json(confirmed)).user.emailVerified).toBe(true);
    expect((await anon.post("/auth/verify-email", { token })).status()).toBe(400); // single use
    expect((await anon.post("/auth/verify-email", { token: "forged" })).status()).toBe(400);

    const again = await founder.api.post("/auth/verify-email/resend");
    expect(again.status()).toBe(200);
    expect((await json(again)).message).toBe("Your email is already confirmed.");
    await Promise.all([anon.dispose(), founder.api.dispose()]);
  });

  test("password reset: same answer for everyone, a single-use link, sessions ended", async () => {
    const founder = await newFounder();
    const anon = await Api.create();
    const known = await anon.post("/auth/password-reset", { email: founder.email });
    const unknownAddress = uniqueEmail("nobody");
    const unknown = await anon.post("/auth/password-reset", { email: unknownAddress });
    expect(known.status()).toBe(202);
    expect(unknown.status()).toBe(202);
    expect(await known.text()).toBe(await unknown.text());

    const mail = await waitForEmail(founder.email, "Reset your Fundup Club password");
    const token = new URL(linkIn(mail, "/reset-password?token=")).searchParams.get("token")!;
    expect(await emailsTo(unknownAddress)).toHaveLength(0);

    const weak = await anon.post("/auth/password-reset/confirm", { token, password: "short" });
    expect(weak.status()).toBe(422);

    const reset = await anon.post("/auth/password-reset/confirm", { token, password: "Brand-new-pass-7" });
    expect(reset.status()).toBe(200);
    expect(sessionToken(reset)).toBeTruthy(); // signed straight in
    expect((await founder.api.get("/me")).status()).toBe(401); // the old session is gone

    const reuse = await anon.post("/auth/password-reset/confirm", { token, password: "Brand-new-pass-8" });
    expect(reuse.status()).toBe(400);
    const login = await (await Api.create()).post("/auth/login", { email: founder.email, password: "Brand-new-pass-7" });
    expect(login.status()).toBe(200);
    await Promise.all([anon.dispose(), founder.api.dispose()]);
  });

  test("Google sign-in: needs a code; reports when it isn't configured", async () => {
    const api = await Api.create();
    const missing = await api.post("/auth/google", {});
    expect(missing.status()).toBe(422);
    expect((await json(missing)).errors).toEqual({ code: "Missing sign-in code." });
    const refused = await api.post("/auth/google", { code: "not-a-real-code" });
    // 503 without GOOGLE_CLIENT_ID/SECRET on the API; 400 when Google refuses the made-up code.
    expect([400, 503]).toContain(refused.status());
    expect((await json(refused)).message).toBeTruthy();
    await api.dispose();
  });

  test("rate limits: per visitor address, and failed sign-ins per account", async () => {
    const founder = await newFounder();
    const attacker = await Api.create();
    for (let n = 0; n < 5; n++) await attacker.post("/auth/login", { email: founder.email, password: "guess-123" });
    const locked = await attacker.post("/auth/login", { email: founder.email, password: PASSWORD });
    expect(locked.status()).toBe(429);
    expect((await json(locked)).message).toContain("Too many failed sign-ins");
    expect(Number(locked.headers()["retry-after"])).toBeGreaterThan(0);

    // The owner, somewhere else, isn't locked out.
    const owner = await Api.create();
    expect((await owner.post("/auth/login", { email: founder.email, password: PASSWORD })).status()).toBe(200);

    // Ten sign-in attempts a minute per address, whatever the account.
    const busy = await Api.create();
    for (let n = 0; n < 10; n++) await busy.post("/auth/login", { email: uniqueEmail("x"), password: "guess-123" });
    const throttled = await busy.post("/auth/login", { email: uniqueEmail("x"), password: "guess-123" });
    expect(throttled.status()).toBe(429);
    expect((await json(throttled)).message).toMatch(/^Too many attempts\. Please wait \d+ seconds/);
    await Promise.all([attacker.dispose(), owner.dispose(), busy.dispose(), founder.api.dispose()]);
  });
});
