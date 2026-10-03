import { execSync } from "node:child_process";
import { request } from "@playwright/test";
import { API, MAILPIT, REVIEWER, SITE } from "./env";

/* Before anything runs: the website, the API (with its database and Redis),
   Mailpit and the test reviewer must all answer. Each failure says what to start. */

async function check(name: string, url: string, hint: string) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`answered ${response.status}`);
  } catch (err) {
    throw new Error(`${name} isn't reachable at ${url} (${(err as Error).message}). ${hint}`);
  }
}

export function purge() {
  if (process.env.E2E_PURGE === "0") return;
  try {
    execSync(
      "docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T backend python manage.py purge_e2e_data",
      { stdio: "pipe", timeout: 60_000 },
    );
  } catch {
    console.warn("Couldn't remove earlier test data (run `manage.py purge_e2e_data` in the API container).");
  }
}

export default async function globalSetup() {
  const devStack = "Start it with: docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d";
  await check("The API", `${API}/health/ready`, devStack);
  await check("Mailpit", `${MAILPIT}/api/v1/messages?limit=1`, devStack);
  await check("The website", `${SITE}/robots.txt`, "Start it with: npm run dev");

  const api = await request.newContext({ extraHTTPHeaders: { "X-Forwarded-For": "192.0.2.250" } });
  const login = await api.post(`${API}/auth/login`, { data: REVIEWER });
  await api.dispose();
  if (login.status() !== 200)
    throw new Error(
      `The test reviewer ${REVIEWER.email} can't sign in (${login.status()}). Create it with: ` +
        "docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py seed_dev_accounts",
    );

  purge();
}
