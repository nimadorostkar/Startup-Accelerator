import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { UNAVAILABLE } from "@/lib/api";
import {
  completeGoogleSignIn,
  GOOGLE_CALLBACK_PATH,
  OAUTH_LOCALE_COOKIE,
  OAUTH_RETURN_COOKIE,
  OAUTH_STATE_COOKIE,
  type AuthResult,
} from "@/lib/auth";
import { isLocale, localePath } from "@/i18n/config";
import { SITE_URL } from "@/lib/site";

/* Google sends the visitor back here after the consent screen. The `state`
   must match the cookie set when they left (lib/auth.ts startGoogleOAuth),
   which proves this sign-in started on our site; then the API exchanges the
   one-time code for their verified identity and starts a session. */

function back(path: string) {
  return NextResponse.redirect(new URL(path, SITE_URL), 303);
}

/** Which message the sign-in page shows for an API refusal (see GOOGLE_ERRORS in app/(auth)/login). */
function errorCode(result: Extract<AuthResult, { ok: false }>) {
  if (result.message === UNAVAILABLE) return "google_unavailable"; // API down, or Google sign-in not set up there
  if (result.status === 403) return "google_disabled";
  if (result.status === 429) return "google_busy";
  if (result.status === 400 && result.message?.includes("verified email")) return "google_unverified";
  return "google";
}

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const jar = await cookies();
  const expected = jar.get(OAUTH_STATE_COOKIE)?.value;
  const returnTo = jar.get(OAUTH_RETURN_COOKIE)?.value;
  const lang = jar.get(OAUTH_LOCALE_COOKIE)?.value;
  // Failures go back to the sign-in page in the language the visitor started in.
  const login = (error: string) => localePath(isLocale(lang) ? lang : "en", `/login?error=${error}`);
  jar.delete({ name: OAUTH_LOCALE_COOKIE, path: GOOGLE_CALLBACK_PATH });
  jar.delete({ name: OAUTH_STATE_COOKIE, path: GOOGLE_CALLBACK_PATH });
  jar.delete({ name: OAUTH_RETURN_COOKIE, path: GOOGLE_CALLBACK_PATH });

  if (params.get("error")) return back(login("google_cancelled"));
  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state || !expected || !same(state, expected)) return back(login("google_state"));

  const result = await completeGoogleSignIn(code, returnTo);
  return back(result.ok ? result.redirectTo : login(errorCode(result)));
}
