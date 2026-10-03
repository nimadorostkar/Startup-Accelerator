import { expect, test } from "../support/web";

/* The public site in English, Turkish and Persian (src/i18n). */

test("each language has its own address, direction and words", async ({ page, request }) => {
  await page.goto("/events");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");

  await page.goto("/tr/events");
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  const trNav = page.getByRole("navigation", { name: "Ana menü" });
  await expect(trNav.getByRole("link", { name: "Etkinlikler" })).toHaveAttribute("href", "/tr/events");

  await page.goto("/fa/events");
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  const faNav = page.getByRole("navigation", { name: "منوی اصلی" });
  await expect(faNav.getByRole("link", { name: "رویدادها" })).toHaveAttribute("href", "/fa/events");
  // The dashboard is English only, whatever the page's language.
  await expect(page.getByRole("link", { name: "درخواست بدهید" }).first()).toHaveAttribute("href", "/dashboard");

  // /en/… is the bare path's other name.
  const en = await request.get("/en/events", { maxRedirects: 0 });
  expect(en.status()).toBe(308);
  expect(en.headers()["location"]).toMatch(/\/events$/);
});

test("the switcher keeps the page (and its filters) when changing language", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  // Wait for the page to be up (switching keeps the query once its JavaScript runs).
  await page.goto("/startups?status=cohort", { waitUntil: "networkidle" });
  await page.getByLabel("Language: English").click();
  await page.getByRole("link", { name: "Türkçe" }).click();
  await expect(page).toHaveURL(/\/tr\/startups\?status=cohort$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");

  await page.waitForLoadState("networkidle");
  await page.getByLabel("Dil: Türkçe").click();
  await page.getByRole("link", { name: "فارسی" }).click();
  await expect(page).toHaveURL(/\/fa\/startups\?status=cohort$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  await page.waitForLoadState("networkidle");
  await page.getByLabel("زبان: فارسی").click();
  await page.getByRole("link", { name: "English" }).click();
  await expect(page).toHaveURL(/\/startups\?status=cohort$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("on phones the menu has the languages side by side", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/about");
  await page.getByRole("button", { name: "Open menu" }).click();
  const languages = page.getByRole("navigation", { name: "Language" });
  await expect(languages.getByRole("link", { name: "English" })).toHaveAttribute("aria-current", "true");
  await languages.getByRole("link", { name: "فارسی" }).click();
  await expect(page).toHaveURL(/\/fa\/about$/);
});

test("unknown pages are a 404 in the visitor's language; the sitemap lists every language", async ({ page, request }) => {
  const missing = await page.goto("/tr/no-such-page");
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Bu sayfa");

  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/fa/events</loc>");
  expect(sitemap).toMatch(/hreflang="tr-TR"/);
});
