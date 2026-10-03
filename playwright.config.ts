import { defineConfig, devices } from "@playwright/test";
import { SITE } from "./e2e/support/env";

/* End-to-end tests against a running stack (see docs/deployment.md → Testing):
     e2e/api  — every API endpoint, over HTTP
     e2e/web  — the website in a browser: pages, forms, the whole application lifecycle

   npx playwright test                 everything
   npx playwright test --project=api   just the API */

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  globalSetup: "./e2e/support/global-setup.ts",
  globalTeardown: "./e2e/support/global-teardown.ts",
  use: {
    baseURL: SITE,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "api", testDir: "e2e/api" },
    { name: "web", testDir: "e2e/web", use: { ...devices["Desktop Chrome"] } },
  ],
});
