import type { BrowserContext } from "@playwright/test";
import { SITE } from "./env";

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
