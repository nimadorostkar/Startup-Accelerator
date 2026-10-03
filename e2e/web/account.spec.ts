import { newFounder } from "../support/api";
import { PASSWORD, uniqueEmail } from "../support/data";
import { linkIn, waitForEmail } from "../support/mailpit";
import { expect, signInAs, test } from "../support/web";

test("sign up, confirm the email, sign out, sign back in", async ({ page }) => {
  const email = uniqueEmail();
  await page.goto("/register");
  await page.locator('input[name="name"]').fill("Lena Ortiz");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.locator('input[name="terms"]').check();
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Welcome back, Lena" })).toBeVisible();
  await expect(page.getByText("Confirm your email.")).toBeVisible();

  // The emailed link, then the button on the page it opens.
  const mail = await waitForEmail(email, "Confirm your email");
  await page.goto(linkIn(mail, "/verify-email?token="));
  await page.getByRole("button", { name: /confirm my email/i }).click();
  await expect(page.getByRole("heading", { name: "Email confirmed" })).toBeVisible();
  await page.goto("/dashboard");
  await expect(page.getByText("Confirm your email.")).toHaveCount(0);

  await page.getByRole("button", { name: "Sign out" }).first().click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/); // the session really ended

  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill("wrong-password-1");
  await page.getByRole("button", { name: /^sign in/i }).click();
  await expect(page.getByText("That email and password don't match")).toBeVisible();
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: /^sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("sign-up form: errors from the server, under their fields", async ({ page }) => {
  const taken = await newFounder();
  await page.goto("/register");
  await page.locator('input[name="name"]').fill("Lena Ortiz");
  await page.locator('input[name="email"]').fill(taken.email);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.locator('input[name="terms"]').check();
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page.getByText("That email is already registered.")).toBeVisible();
  await expect(page.locator('input[name="name"]')).toHaveValue("Lena Ortiz"); // typed values survive
  await taken.api.dispose();
});

test("forgot password: email link, new password, signed straight in", async ({ page }) => {
  const founder = await newFounder();
  await page.goto(`/forgot-password?email=${encodeURIComponent(founder.email)}`);
  await page.getByRole("button", { name: /send|reset/i }).click();
  await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();

  const mail = await waitForEmail(founder.email, "Reset your Fundup Club password");
  await page.goto(linkIn(mail, "/reset-password?token="));
  await page.locator('input[name="password"]').fill("short");
  await page.getByRole("button", { name: /set new password/i }).click();
  await expect(page.getByText("Use at least 8 characters.")).toBeVisible();
  await page.locator('input[name="password"]').fill("Brand-new-pass-7");
  await page.getByRole("button", { name: /set new password/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  // The link works once.
  await page.context().clearCookies();
  await page.goto(linkIn(mail, "/reset-password?token="));
  await page.locator('input[name="password"]').fill("Another-pass-8");
  await page.getByRole("button", { name: /set new password/i }).click();
  await expect(page.getByText("invalid or has expired")).toBeVisible();
  await founder.api.dispose();
});

test("a failed Google sign-in comes back with a message", async ({ page }) => {
  await page.goto("/api/auth/callback/google?error=access_denied");
  await expect(page).toHaveURL(/\/login\?error=google_cancelled$/);
  await expect(page.getByText("Google sign-in was cancelled.")).toBeVisible();
  await page.goto("/api/auth/callback/google?code=abc&state=not-ours");
  await expect(page).toHaveURL(/\/login\?error=google_state$/);
});

test("founders get a 404 from the review panel, signed-out visitors the sign-in page", async ({ page, context }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login\?next=%2Fadmin$/);
  const founder = await newFounder();
  await signInAs(context, founder.token);
  const response = await page.goto("/admin");
  expect(response?.status()).toBe(404);
  await expect(page.getByText(/this page moved on/i)).toBeVisible();
  expect(await page.title()).not.toMatch(/review/i); // the panel isn't advertised, not even in the title
  const exported = await page.request.get("/admin/export");
  expect(exported.status()).toBe(404);
  await founder.api.dispose();
});
