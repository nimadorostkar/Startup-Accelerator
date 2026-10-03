import { type Page } from "@playwright/test";
import { newFounder } from "../support/api";
import { PASSWORD } from "../support/data";
import { expect, signInAs, test } from "../support/web";

async function signIn(page: Page, email: string, password: string) {
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: /^sign in/i }).click();
}

test("a link from an email still lands where it points after signing in", async ({ page }) => {
  const founder = await newFounder();
  await page.goto("/dashboard/team");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%2Fteam$/);
  await signIn(page, founder.email, PASSWORD);
  await expect(page).toHaveURL(/\/dashboard\/team$/);
  await founder.api.dispose();
});

test("signing in never sends anyone off the site, or into the wrong area", async ({ page }) => {
  const founder = await newFounder();
  for (const next of ["//evil.example/dashboard", "/\\evil.example", "https://evil.example", "/admin"]) {
    await page.context().clearCookies();
    await page.goto(`/login?next=${encodeURIComponent(next)}`);
    await signIn(page, founder.email, PASSWORD);
    await expect(page).toHaveURL(/\/dashboard$/); // a founder's own home, every time
  }
  await founder.api.dispose();
});

test("a refused sign-in keeps 'Keep me signed in' ticked", async ({ page }) => {
  const founder = await newFounder();
  await page.goto("/login");
  await page.locator('input[name="remember"]').check();
  await signIn(page, founder.email, "wrong-password-1");
  await expect(page.getByText("That email and password don't match")).toBeVisible();
  await expect(page.locator('input[name="remember"]')).toBeChecked();

  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: /^sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const session = (await page.context().cookies()).find((c) => c.name === "vcs_session");
  expect(session?.expires).toBeGreaterThan(Date.now() / 1000 + 29 * 24 * 3600); // the 30-day cookie
  await founder.api.dispose();
});

test("account settings: rename, change the password, sign in with the new one", async ({ page }) => {
  const founder = await newFounder("Lena Ortiz");
  // Through the form, so the browser has a session of its own besides the test's API one.
  await page.goto("/login?next=%2Fdashboard%2Faccount");
  await signIn(page, founder.email, PASSWORD);
  await expect(page.getByRole("heading", { name: "Account settings" })).toBeVisible();

  const name = page.locator('input[name="name"]');
  await name.fill("Lena M. Ortiz");
  await page.getByRole("button", { name: "Save name" }).click();
  await expect(page.getByText("Name saved.")).toBeVisible();
  await page.reload();
  await expect(name).toHaveValue("Lena M. Ortiz");

  await page.locator('input[name="currentPassword"]').fill("not-my-password-1");
  await page.locator('input[name="newPassword"]').fill("Fresh-password-42");
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByText("That's not your current password.")).toBeVisible();

  await page.locator('input[name="currentPassword"]').fill(PASSWORD);
  await page.locator('input[name="newPassword"]').fill("Fresh-password-42");
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByText("Password changed.")).toBeVisible();
  await page.goto("/dashboard"); // this session carried on
  await expect(page).toHaveURL(/\/dashboard$/);

  // Every other session ended, like the one the test signed up with.
  expect((await founder.api.get("/me")).status()).toBe(401);

  await page.context().clearCookies();
  await page.goto("/login");
  await signIn(page, founder.email, "Fresh-password-42");
  await expect(page).toHaveURL(/\/dashboard$/);
  await founder.api.dispose();
});

test("a session that ends mid-edit keeps what was typed, with a way back in", async ({ page, context }) => {
  const founder = await newFounder();
  await signInAs(context, founder.token);
  await page.goto("/dashboard/profile");
  await page.locator('textarea[name="bio"]').fill("Typed before the session ended, and still here afterwards.");
  await founder.api.post("/auth/logout"); // the same session, ended elsewhere
  await page.getByRole("button", { name: "Save", exact: true }).click();

  await expect(page.getByText("You've been signed out, so this wasn't saved.")).toBeVisible();
  await expect(page.locator('textarea[name="bio"]')).toHaveValue(
    "Typed before the session ended, and still here afterwards.",
  );
  await expect(page.getByRole("link", { name: /sign in again/i })).toHaveAttribute(
    "href",
    "/login?next=%2Fdashboard%2Fprofile",
  );
});
