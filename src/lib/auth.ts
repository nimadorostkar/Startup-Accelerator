/* ══════════════════════════════════════════════════════════════════════
   ACCOUNTS AND SESSIONS — backed by the Django API (backend/apps/accounts).

   The API owns users, password hashes and sessions. Signing in returns a
   session token in the `vcs_session` cookie; this module copies that
   cookie onto the response to the browser, and forwards it on every
   signed-in call (lib/api.ts). The API keeps only the token's hash, so
   signing out (or a password reset) ends the session everywhere.

   Each function reports back the way the forms expect:
     { ok: true,  redirectTo: "/some-path" }   → the user is signed in
     { ok: true }                              → reset email accepted
     { ok: false, message: "..." }             → shown above the form
     { ok: false, fieldErrors: { email: "…" }} → shown under that field
   ══════════════════════════════════════════════════════════════════════ */

import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { api, BackendUnavailable, SESSION_COOKIE, UNAVAILABLE, type ApiResult } from "./api";
import { SITE_URL } from "./site";

export { SESSION_COOKIE };

export type AuthResult =
  | { ok: true; redirectTo: string }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

/** Password reset has no redirect on success — the answer is "check your inbox". */
export type ResetRequestResult =
  | { ok: true }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

/** Where a founder lands once they're signed in. */
export const AFTER_SIGN_IN = "/dashboard";
/** Reviewers go straight to the queue (visiting /dashboard would start a founder application for them). */
export const AFTER_REVIEWER_SIGN_IN = "/admin";

/* ---------- Sessions ---------- */

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "founder" | "reviewer";
  /** Reviewer role on a verified address: may open the review panel. */
  isReviewer: boolean;
  emailVerified: boolean;
};

/** Send the cookie over HTTPS only (COOKIE_SECURE=false for plain-http local runs). */
const COOKIE_SECURE = process.env.COOKIE_SECURE
  ? process.env.COOKIE_SECURE !== "false"
  : process.env.NODE_ENV === "production";

/** Short-lived cookie holding the Google sign-in `state`, checked on the way back. */
export const OAUTH_STATE_COOKIE = "vcs_oauth_state";
export const GOOGLE_CALLBACK_PATH = "/api/auth/callback/google";

/**
 * The signed-in user, or null. Cached per request, so calling it from a
 * layout, a page and a server action costs one call to the API.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  if (!(await cookies()).get(SESSION_COOKIE)?.value) return null;
  const result = await api<{ user: SessionUser }>("/me", { auth: true });
  return result.ok ? result.data.user : null; // 401: expired or revoked
});

/** Who can open the review panel: the API's reviewer role, on a verified address. */
export function isReviewer(user: SessionUser) {
  return user.isReviewer;
}

/** Copies the session cookie the API just issued onto our response to the browser. */
async function keepSession(response: Response) {
  for (const raw of response.headers.getSetCookie()) {
    const [pair, ...attributes] = raw.split(";");
    const eq = pair.indexOf("=");
    if (pair.slice(0, eq).trim() !== SESSION_COOKIE) continue;
    const maxAge = attributes
      .map((a) => a.trim().split("="))
      .find(([key]) => key.toLowerCase() === "max-age")?.[1];
    (await cookies()).set(SESSION_COOKIE, pair.slice(eq + 1).trim(), {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: "lax",
      path: "/",
      ...(maxAge ? { maxAge: Number(maxAge) } : {}),
    });
    return;
  }
  throw new Error("The API signed the user in but sent no session cookie.");
}

/** Turns an API refusal into what the forms show. */
function refusal(result: Extract<ApiResult<unknown>, { ok: false }>) {
  return {
    ok: false as const,
    message: result.error.errors ? undefined : (result.error.message ?? "That didn't work. Please try again."),
    fieldErrors: result.error.errors,
  };
}

/** Runs an API call, turning "the API is down" into a message instead of an error page. */
async function guarded<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (err) {
    if (err instanceof BackendUnavailable) {
      console.error(err);
      return fallback;
    }
    throw err;
  }
}

const unavailable = { ok: false as const, message: UNAVAILABLE };

async function signIn(path: string, body: unknown): Promise<AuthResult> {
  return guarded<AuthResult>(async () => {
    const result = await api<{ user: SessionUser }>(path, { method: "POST", body });
    if (!result.ok) return refusal(result);
    await keepSession(result.response);
    return { ok: true, redirectTo: result.data.user.isReviewer ? AFTER_REVIEWER_SIGN_IN : AFTER_SIGN_IN };
  }, unavailable);
}

export async function signInWithPassword(input: {
  email: string;
  password: string;
  remember: boolean;
}): Promise<AuthResult> {
  return signIn("/auth/login", input);
}

export async function createAccount(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  // The form already required the terms box; the API records the consent.
  return signIn("/auth/register", { ...input, terms: true });
}

export async function endSession() {
  await guarded(() => api("/auth/logout", { method: "POST", auth: true }), null);
  (await cookies()).delete(SESSION_COOKIE);
}

/* ---------- Password reset ---------- */

/**
 * The API answers the same way whether or not the address has an account,
 * so this never reveals who is registered. The email (if any) is sent in
 * the background.
 */
export async function requestPasswordReset(input: { email: string }): Promise<ResetRequestResult> {
  return guarded<ResetRequestResult>(async () => {
    const result = await api("/auth/password-reset", { method: "POST", body: input });
    return result.ok ? { ok: true as const } : refusal(result);
  }, unavailable);
}

/** Sets a new password from the emailed link, then signs the user in. */
export async function resetPassword(input: { token: string; password: string }): Promise<AuthResult> {
  return signIn("/auth/password-reset/confirm", input);
}

/* ---------- Email verification ---------- */

export async function verifyEmail(token: string): Promise<{ ok: boolean; message?: string }> {
  return guarded(async () => {
    const result = await api("/auth/verify-email", { method: "POST", body: { token } });
    return result.ok ? { ok: true } : { ok: false, message: result.error.message };
  }, unavailable);
}

export async function resendVerification(): Promise<{ ok: boolean; message?: string }> {
  return guarded(async () => {
    const result = await api<{ message?: string }>("/auth/verify-email/resend", { method: "POST", auth: true });
    return result.ok
      ? { ok: true, message: result.data?.message }
      : { ok: false, message: result.error.message };
  }, unavailable);
}

/* ---------- Google sign-in ---------- */

/**
 * Returns the URL to send the browser to for Google sign-in, after storing a
 * random `state` in a short-lived cookie. Google sends the visitor back to
 * GOOGLE_CALLBACK_PATH (app/api/auth/callback/google), which checks the
 * state and hands the code to the API.
 */
export async function startGoogleOAuth(): Promise<AuthResult> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return {
      ok: false,
      message: "Google sign-in isn't configured yet. Set GOOGLE_CLIENT_ID (and the secret on the API) to enable it.",
    };
  }

  const state = randomBytes(24).toString("base64url");
  (await cookies()).set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: GOOGLE_CALLBACK_PATH,
    maxAge: 600,
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: new URL(GOOGLE_CALLBACK_PATH, SITE_URL).toString(),
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
    state,
  });
  return { ok: true, redirectTo: `https://accounts.google.com/o/oauth2/v2/auth?${params}` };
}

/** Second half, called by the callback route once `state` checks out. */
export async function completeGoogleSignIn(code: string): Promise<AuthResult> {
  return signIn("/auth/google", { code });
}
