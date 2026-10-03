import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  completeGoogleSignIn,
  GOOGLE_CALLBACK_PATH,
  OAUTH_STATE_COOKIE,
} from "@/lib/auth";
import { SITE_URL } from "@/lib/site";

/* Google sends the visitor back here after the consent screen. The `state`
   must match the cookie set when they left (lib/auth.ts startGoogleOAuth),
   which proves this sign-in started on our site; then the API exchanges the
   one-time code for their verified identity and starts a session. */

function back(path: string) {
  return NextResponse.redirect(new URL(path, SITE_URL), 303);
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
  jar.delete({ name: OAUTH_STATE_COOKIE, path: GOOGLE_CALLBACK_PATH });

  if (params.get("error")) return back("/login?error=google_cancelled");
  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state || !expected || !same(state, expected)) return back("/login?error=google_state");

  const result = await completeGoogleSignIn(code);
  return back(result.ok ? result.redirectTo : "/login?error=google");
}
