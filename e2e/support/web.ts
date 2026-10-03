import { test as base, type BrowserContext } from "@playwright/test";
import { visitorIp } from "./data";
import { SITE } from "./env";

/**
 * The website tests' `test`: each test is a visitor of its own, with its own
 * address (X-Forwarded-For, which the dev website passes on to the API), so
 * rate limits never carry over between tests, parallel workers or earlier runs.
 * In local development every real visitor would otherwise share one address.
 */
export const test = base.extend({
  extraHTTPHeaders: async ({}, provide) => {
    await provide({ "X-Forwarded-For": visitorIp() });
  },
});
export { expect } from "@playwright/test";

/** Signs a browser in with a session created through the API (skips the form when it isn't under test). */
export async function signInAs(context: BrowserContext, token: string) {
  await context.addCookies([{ name: "vcs_session", value: token, url: SITE, httpOnly: true, sameSite: "Lax" }]);
}

/** "Oct 22", the way the site shows an event's date, in the event's own time zone. */
export function monthDay(iso: string, tz: string) {
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "short", timeZone: tz });
  const day = d.toLocaleString("en-US", { day: "numeric", timeZone: tz });
  return `${month} ${day}`;
}
