/* Sign-in plumbing shared by the proxy (src/proxy.ts), the server and the forms.
   No server-only imports here: the proxy and client components use it too. */

/** The sign-in cookie. The API sets the same name when browsers talk to it directly. */
export const SESSION_COOKIE = "vcs_session";

/** Set by the proxy on signed-in pages: the path being visited, so an ended
    session can send the visitor back to it after signing in again. */
export const RETURN_TO_HEADER = "x-fundup-return-to";

/** The areas behind sign-in. Only these can be returned to after signing in. */
const SIGNED_IN_AREAS = ["/dashboard", "/admin"] as const;

/**
 * A `next` path that's safe to send the visitor to after signing in: a path on
 * this site, inside the signed-in areas — never another site ("//evil.example",
 * "/\evil.example") or anything unexpected. Null otherwise.
 */
export function safeReturnTo(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 512) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  // Backslashes (which browsers read as "/") and control characters never belong in our paths.
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return null;
  return areaOf(value) ? value : null;
}

/** "/dashboard" or "/admin" for a path inside that area, else null. */
export function areaOf(path: string): (typeof SIGNED_IN_AREAS)[number] | null {
  const pathname = path.split(/[?#]/)[0];
  return SIGNED_IN_AREAS.find((area) => pathname === area || pathname.startsWith(`${area}/`)) ?? null;
}

/** The sign-in page, coming back to `returnTo` afterwards when it's a safe place to return to. */
export function signInHref(returnTo?: string | null) {
  const next = safeReturnTo(returnTo);
  return next ? `/login?${new URLSearchParams({ next })}` : "/login";
}
