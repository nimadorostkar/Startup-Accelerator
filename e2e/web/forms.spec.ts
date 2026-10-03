import { Api, json, reviewer } from "../support/api";
import { uid, uniqueEmail } from "../support/data";
import { ADMIN, API } from "../support/env";
import { emailsTo, linkIn, waitForEmail } from "../support/mailpit";
import { expect, test } from "../support/web";

test("event registration: confirmation, calendar invite, and a repeat", async ({ page }) => {
  const api = await Api.create();
  const [event] = (await json(await api.get("/events?when=upcoming"))).events;
  const email = uniqueEmail("guest");

  await page.goto(`/events/${event.slug}`);
  await page.locator('input[name="name"]').fill("Lena Ortiz");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="company"]').fill("Relaywave");
  await page.getByRole("button", { name: /reserve my spot/i }).click();
  await expect(page.getByText("You're registered").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /google calendar/i })).toHaveAttribute(
    "href",
    /calendar\.google\.com/,
  );

  const mail = await waitForEmail(email, "You're registered");
  expect(mail.subject).toContain(event.title);
  expect(mail.attachments.map((a) => a.fileName)).toContain("invite.ics");

  await page.reload();
  await page.locator('input[name="name"]').fill("Lena Ortiz");
  await page.locator('input[name="email"]').fill(email.toUpperCase());
  await page.getByRole("button", { name: /reserve my spot/i }).click();
  await expect(page.getByText("You're already registered").first()).toBeVisible();
  expect(await emailsTo(email, "You're registered")).toHaveLength(1);
  await api.dispose();
});

test("newsletter: sign up, already on the list, unsubscribe from the email", async ({ page }) => {
  const email = uniqueEmail("reader");
  await page.goto("/newsletter");
  const form = page.locator("form").filter({ has: page.locator('input[name="email"]') }).first();
  await form.locator('input[name="email"]').fill(email);
  await form.locator('input[name="email"]').press("Enter");
  await expect(page.getByText(`The next issue goes to ${email}`).first()).toBeVisible();

  await page.reload();
  await form.locator('input[name="email"]').fill(email);
  await form.locator('input[name="email"]').press("Enter");
  await expect(page.getByText("is already on the list").first()).toBeVisible();

  const welcome = await waitForEmail(email, "Welcome to The Founder Brief");
  await page.goto(linkIn(welcome, "/newsletter/unsubscribe?token="));
  await page.getByRole("button", { name: "Unsubscribe" }).click();
  await expect(page.getByText(`${email} won’t get The Founder Brief any more.`)).toBeVisible();
});

test("contact: the message reaches the team", async ({ page }) => {
  const email = uniqueEmail("press");
  const marker = `E2E web contact ${uid()}`;
  await page.goto("/contact");
  await page.locator('input[name="name"]').fill("Lena Ortiz");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('select[name="topic"]').selectOption("Press");
  await page.locator('textarea[name="message"]').fill("Too short");
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(page.getByText("Tell us a little more (at least 10 characters).")).toBeVisible();

  await page.locator('textarea[name="message"]').fill(`${marker}: could we interview a founder?`);
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(page.getByRole("heading", { name: "Message sent" })).toBeVisible();

  const r = await reviewer();
  const me = (await json(await r.get("/me"))).user;
  await expect
    .poll(async () => (await emailsTo(me.email, "[Contact] Press")).some((m) => m.text.includes(marker)))
    .toBe(true);
  await r.dispose();
});

test("back office: staff sign in and see the content", async ({ page }) => {
  // The back office is served by the API (in development, on the API's own port).
  const backoffice = new URL("/backoffice/", API).toString();
  await page.goto(`${backoffice}login/`);
  await page.locator('input[name="username"]').fill(ADMIN.email);
  await page.locator('input[name="password"]').fill(ADMIN.password);
  await page.getByRole("button", { name: /log in/i }).click();
  await expect(page.getByRole("heading", { name: "Content, accounts and applications" })).toBeVisible();
  await page.goto(`${backoffice}content/event/`);
  await expect(page.getByRole("columnheader", { name: "Starts (local time)" })).toBeVisible();
});
