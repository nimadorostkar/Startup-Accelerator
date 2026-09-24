/* ══════════════════════════════════════════════════════════════════════
   PLUG YOUR AUTH PROVIDER IN HERE — this is the only file that needs to
   change. The pages, forms, validation and error handling are finished
   and call into the functions below.

   Each one takes validated input and reports back the same way:
     { ok: true,  redirectTo: "/some-path" }   → the user is signed in
     { ok: true }                              → reset email accepted
     { ok: false, message: "..." }             → shown above the form
     { ok: false, fieldErrors: { email: "…" }} → shown under that field

   Whatever you use (Auth.js, Clerk, Supabase, your own API), do the work
   inside these bodies and set a session cookie before returning ok.
   ══════════════════════════════════════════════════════════════════════ */

import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";

export type AuthResult =
  | { ok: true; redirectTo: string }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

/** Where a user lands once they're signed in. */
export const AFTER_SIGN_IN = "/dashboard";

/* ---------- Sessions ---------- */

export type SessionUser = { id: string; email: string; name: string };

/** Set this cookie (httpOnly, secure, sameSite: "lax") when a sign-in succeeds. */
export const SESSION_COOKIE = "vcs_session";

/* Development only: a stand-in founder so the dashboard can be used before
   sign-in is wired up. `next build` sets NODE_ENV=production, so this can
   never switch on in a deployed app. Delete it once real sessions exist. */
const DEV_USER: SessionUser = {
  id: "dev-founder",
  email: "founder@example.com",
  name: "Alex Rivera",
};

/**
 * The signed-in user, or null. Cached per request, so calling it from a
 * layout, a page and a server action costs one lookup.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) {
    // TODO: verify the token's signature and expiry, then load its user:
    //   return { id: user.id, email: user.email, name: user.name };
  }
  if (process.env.NODE_ENV !== "production") return DEV_USER;
  return null;
});

/**
 * Who can open the admin panel. Set REVIEWER_EMAILS to a comma-separated
 * list of support-team addresses. This trusts the session's email, so it's
 * only as safe as your sign-in: make sure addresses are verified before a
 * session is issued. (Move this to a role column once you have a users table.)
 * In development the stand-in user is a reviewer too, so both sides can be
 * tried from one browser.
 */
export function isReviewer(user: SessionUser) {
  const allowed = (process.env.REVIEWER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.includes(user.email.toLowerCase())) return true;
  return process.env.NODE_ENV !== "production" && user.id === DEV_USER.id;
}

export async function endSession() {
  // TODO: also revoke the session server-side, so a copied cookie stops working.
  (await cookies()).delete(SESSION_COOKIE);
}

/* Shown while the stubs are still in place, so nothing fails silently. */
const notWiredUp = (what: string) =>
  `${what} isn't connected yet. Your details were validated, but there's no account store behind this form.`;

export async function signInWithPassword(input: {
  email: string;
  password: string;
  remember: boolean;
}): Promise<AuthResult> {
  // TODO: look the user up, verify the password hash, create a session.
  // The `remember` flag is meant to control the session cookie's maxAge.
  void input;
  return { ok: false, message: notWiredUp("Sign-in") };
}

export async function createAccount(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  // TODO: reject addresses that already exist with
  //   { ok: false, fieldErrors: { email: "That email is already registered." } }
  // then hash the password, store the user, and create a session.
  void input;
  return { ok: false, message: notWiredUp("Sign-up") };
}

/** Password reset has no redirect on success — the answer is "check your inbox". */
export type ResetRequestResult =
  | { ok: true }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

export async function requestPasswordReset(input: {
  email: string;
}): Promise<ResetRequestResult> {
  // TODO: mint a single-use, expiring token, store its hash against the user,
  // and email a link to /reset-password?token=…
  //
  // Return { ok: true } even when no account matches. Saying "no such user"
  // here would let anyone test which addresses are registered. Reserve
  // { ok: false } for genuine failures, like the mail provider being down.
  void input;
  return { ok: false, message: notWiredUp("Password reset") };
}

/**
 * Returns the URL to send the browser to for Google sign-in.
 *
 * With GOOGLE_CLIENT_ID and NEXT_PUBLIC_SITE_URL set, this builds a real
 * Google consent URL. You still need to handle the redirect back: create
 * a route handler at the `redirect_uri` below that exchanges `code` for
 * tokens (that step needs GOOGLE_CLIENT_SECRET) and starts a session.
 */
export async function startGoogleOAuth(): Promise<AuthResult> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!clientId || !siteUrl) {
    return {
      ok: false,
      message:
        "Google sign-in isn't configured yet. Set GOOGLE_CLIENT_ID and NEXT_PUBLIC_SITE_URL to enable it.",
    };
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: new URL("/api/auth/callback/google", siteUrl).toString(),
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    // TODO: generate a random value, store it in a cookie, and verify it on
    // the way back. Without this check the callback is open to CSRF.
    state: "replace-me-with-a-random-value",
  });

  return {
    ok: true,
    redirectTo: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
  };
}
