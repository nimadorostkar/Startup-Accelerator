import { deflateSync } from "node:zlib";
import { Api, fillApplication, json, newFounder, reviewer, submittedFounder } from "../support/api";
import { uid } from "../support/data";
import { expect, signInAs, test } from "../support/web";

/* A startup's logo and its founder's photo: uploaded from the dashboard, stored
   and resized by the API, and shown on the public pages once it has applied. */

/** A plain 64 × 64 orange PNG, built here so the suite carries no image files. */
function png() {
  const chunk = (type: string, data: Buffer) => {
    const body = Buffer.concat([Buffer.from(type), data]);
    const out = Buffer.alloc(body.length + 8);
    out.writeUInt32BE(data.length, 0);
    body.copy(out, 4);
    out.writeUInt32BE(crc(body), body.length + 4);
    return out;
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(64, 0);
  header.writeUInt32BE(64, 4);
  header.set([8, 2, 0, 0, 0], 8); // 8 bits per channel, RGB
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(64 * 3, Buffer.from([0xc2, 0x47, 0x0a]))]);
  const pixels = deflateSync(Buffer.concat(Array.from({ length: 64 }, () => row)));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", pixels),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function crc(data: Buffer) {
  let c = ~0;
  for (const byte of data) {
    c ^= byte;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

test("a founder uploads a logo and a photo, and the public page shows them", async ({ page, context }) => {
  const founder = await newFounder();
  const name = await fillApplication(founder.api, `E2E Logo ${uid()}`);
  await signInAs(context, founder.token);

  // Not an image: refused in words, nothing stored.
  await page.goto("/dashboard/startup");
  await page.locator('input[type="file"]').setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("hello") });
  await expect(page.getByText("Use a PNG, JPEG or WebP image.").first()).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles({ name: "logo.png", mimeType: "image/png", buffer: png() });
  await expect(page.getByText("Logo saved.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Change logo" })).toBeVisible();

  await page.goto("/dashboard/profile");
  await page.locator('input[type="file"]').setInputFiles({ name: "me.png", mimeType: "image/png", buffer: png() });
  await expect(page.getByText("Photo saved.")).toBeVisible();

  const { application } = await json(await founder.api.get("/me/application"));
  expect(application.logo).toMatch(/^\/api\/v1\/media\/startups\/[0-9a-f]{32}\.webp$/);
  expect(application.photo).toMatch(/^\/api\/v1\/media\/founders\/[0-9a-f]{32}\.webp$/);

  // The browser can load it from the website's own address.
  const image = await page.request.get(application.logo);
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toBe("image/webp");

  // Once submitted, the directory and the startup's page show the logo.
  expect((await founder.api.post("/me/application/submit", { confirm: true })).status()).toBe(200);
  // (Submitted through the API: the first visit may still get the previous copy.)
  const card = page.getByRole("article").filter({ hasText: name });
  await expect(async () => {
    await page.goto("/startups");
    await page.getByRole("searchbox").fill(name);
    await expect(card.locator(`img[src="${application.logo}"]`)).toBeVisible({ timeout: 3000 });
  }).toPass({ timeout: 30_000 });
  await card.getByRole("link", { name }).click();
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  await expect(page.locator(`img[src="${application.logo}"]`).first()).toBeVisible();
  await expect(page.locator(`img[src="${application.photo}"]`).first()).toBeVisible();
  await founder.api.dispose();
});

test("a founder can remove their logo", async ({ page, context }) => {
  const founder = await newFounder();
  await signInAs(context, founder.token);
  await page.goto("/dashboard/startup");
  await page.locator('input[type="file"]').setInputFiles({ name: "logo.png", mimeType: "image/png", buffer: png() });
  await expect(page.getByText("Logo saved.")).toBeVisible();
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText("Logo removed.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Upload logo" })).toBeVisible();
  expect((await json(await founder.api.get("/me/application"))).application.logo).toBe("");
  await founder.api.dispose();
});

test("home: every featured founder is a startup from the directory", async ({ page }) => {
  // A cohort startup of our own, so the panel has something to show on an empty stack too.
  const founder = await submittedFounder(`E2E Featured ${uid()}`);
  const r = await reviewer();
  expect((await r.post(`/admin/applications/${founder.id}/decisions`, { decision: "accept" })).status()).toBe(200);
  const anon = await Api.create();
  const { startups } = await json(await anon.get("/startups"));
  const known = new Set(startups.map((s: { slug: string }) => `/startups/${s.slug}`));

  await expect(async () => {
    await page.goto("/");
    const links = await page
      .locator("#founders a[href^='/startups/']")
      .evaluateAll((cards) => cards.map((card) => card.getAttribute("href")));
    expect(links.length).toBeGreaterThan(0);
    for (const href of links) expect(known.has(href!), `${href} is in the directory`).toBe(true);
  }).toPass({ timeout: 30_000 });
  await expect(page.locator("#founders")).toContainText("Meet our portfolio");
  await Promise.all([anon.dispose(), r.dispose(), founder.api.dispose()]);
});
