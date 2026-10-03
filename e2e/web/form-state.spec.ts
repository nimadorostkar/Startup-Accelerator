import { newFounder } from "../support/api";
import { expect, signInAs, test } from "../support/web";

/* A save the server refuses must keep everything that was typed or picked,
   dropdowns and choice cards included, so fixing one field is enough. */

test("dashboard: a refused save keeps dropdowns and choices", async ({ page, context }) => {
  const founder = await newFounder();
  await signInAs(context, founder.token);
  await page.goto("/dashboard/profile");
  await page.locator('select[name="heardFrom"]').selectOption("Search");
  await page.locator('input[name="commitment"][value="part-time"]').check();
  await page.locator('input[name="city"]').fill("Lisbon");
  await page.locator('input[name="linkedin"]').fill("twitter.com/someone"); // refused by the server
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Use your LinkedIn profile link (linkedin.com/in/…).")).toBeVisible();

  await expect(page.locator('input[name="city"]')).toHaveValue("Lisbon");
  await expect(page.locator('select[name="heardFrom"]')).toHaveValue("Search");
  await expect(page.locator('input[name="commitment"][value="part-time"]')).toBeChecked();

  await page.locator('input[name="linkedin"]').fill("linkedin.com/in/someone");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Changes saved.")).toBeVisible();
  await page.reload();
  await expect(page.locator('select[name="heardFrom"]')).toHaveValue("Search");
  await expect(page.locator('input[name="commitment"][value="part-time"]')).toBeChecked();
  await founder.api.dispose();
});

test("contact: a refused message keeps the chosen topic", async ({ page }) => {
  await page.goto("/contact");
  await page.locator('input[name="name"]').fill("Lena Ortiz");
  await page.locator('input[name="email"]').fill("lena@e2e.fundup.example");
  await page.locator('select[name="topic"]').selectOption("Press");
  await page.locator('textarea[name="message"]').fill("Too short");
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(page.getByText("Tell us a little more (at least 10 characters).")).toBeVisible();
  await expect(page.locator('select[name="topic"]')).toHaveValue("Press");
});

test("team: a refused member keeps every answer", async ({ page, context }) => {
  const founder = await newFounder();
  const [me] = (await (await founder.api.get("/me/application")).json()).application.team.members;
  await founder.api.patch(`/me/application/team/members/${me.id}`, { role: "CEO", equity: 70 });
  await signInAs(context, founder.token);
  await page.goto("/dashboard/team");
  await page.getByRole("button", { name: "Add team member" }).click();
  const form = page.getByRole("form", { name: "Add team member" });
  await form.locator('input[name="name"]').fill("Tom Achebe");
  await form.locator('input[name="role"]').fill("CTO");
  await form.locator('input[name="equity"]').fill("40"); // 70 + 40 > 100: refused
  await form.locator('input[name="commitment"][value="part-time"]').check();
  await form.locator('input[name="isFounder"]').check();
  await form.getByRole("button", { name: /add|save/i }).last().click();
  await expect(form.getByText("That brings team equity to 110% — it can't exceed 100%.")).toBeVisible();

  await expect(form.locator('input[name="name"]')).toHaveValue("Tom Achebe");
  await expect(form.locator('input[name="commitment"][value="part-time"]')).toBeChecked();
  await expect(form.locator('input[name="isFounder"]')).toBeChecked();
  await founder.api.dispose();
});
