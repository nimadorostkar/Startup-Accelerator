import "server-only";
import { cookies, headers } from "next/headers";

/* ══════════════════════════════════════════════════════════════════════
   THE BACKEND — every read and write goes through here.

   The Django API (backend/) owns the data and enforces every rule. The
   website's server calls it: forms through Server Actions, pages through
   the helpers in lib/. The browser never needs to talk to it directly.

   - Signed-in calls forward the visitor's `vcs_session` cookie as a
     Bearer token, so the API acts as that visitor and nobody else.
   - Public reads (events, articles, the startup directory) are cached
     for a minute and tagged, so the API can refresh them the moment they
     change (see app/api/revalidate).
   - Errors come back in one shape: { message, errors?: { field: msg } },
     with the same field names as the forms.
   ══════════════════════════════════════════════════════════════════════ */

/** Where the website's server reaches the API: http://backend:8000 inside Docker. */
export const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:8000").replace(/\/+$/, "");

/** The sign-in cookie. The API sets the same name when browsers talk to it directly. */
export const SESSION_COOKIE = "vcs_session";

/** How long public data is cached before it's fetched again (seconds). */
export const PUBLIC_TTL = 60;

export type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string>;
  retryAfter?: number;
  [key: string]: unknown;
};

export type ApiResult<T> =
  | { ok: true; status: number; data: T; response: Response }
  | { ok: false; status: number; error: ApiErrorBody; response: Response };

/** The API couldn't be reached, timed out or failed on its side (5xx). */
export class BackendUnavailable extends Error {
  constructor(detail: string) {
    super(`The API is unavailable: ${detail}`);
    this.name = "BackendUnavailable";
  }
}

/** Shown on forms when the API can't be reached. */
export const UNAVAILABLE = "We couldn't reach the server just now. Please try again in a moment.";

type Options = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Act as the signed-in visitor (forwards their session). */
  auth?: boolean;
  /** Cache a public GET for `PUBLIC_TTL` seconds under these tags. */
  tags?: string[];
  /** Leave a successful response's body unread, to stream it on (file downloads). */
  raw?: boolean;
};

/** Who's asking, so the API's rate limits and logs see the visitor, not this server. */
async function forwardedHeaders(): Promise<Record<string, string>> {
  const incoming = await headers();
  const out: Record<string, string> = {};
  const forwarded = incoming.get("x-forwarded-for") ?? incoming.get("x-real-ip");
  if (forwarded) out["X-Forwarded-For"] = forwarded.split(",")[0].trim();
  const agent = incoming.get("user-agent");
  if (agent) out["User-Agent"] = agent.slice(0, 300);
  const requestId = incoming.get("x-request-id");
  if (requestId) out["X-Request-ID"] = requestId;
  return out;
}

export async function api<T = unknown>(path: string, options: Options = {}): Promise<ApiResult<T>> {
  const { method = "GET", body, auth = false, tags, raw = false } = options;
  const cached = Boolean(tags) && method === "GET" && !auth;

  const requestHeaders: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) requestHeaders["Content-Type"] = "application/json";
  if (!cached) Object.assign(requestHeaders, await forwardedHeaders());
  if (auth) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/v1${path}`, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
      ...(cached ? { next: { revalidate: PUBLIC_TTL, tags } } : { cache: "no-store" as const }),
    });
  } catch (err) {
    throw new BackendUnavailable(`${method} ${path}: ${(err as Error).message}`);
  }
  if (response.status >= 500) throw new BackendUnavailable(`${method} ${path} answered ${response.status}`);

  const data =
    response.status === 204 || (raw && response.ok) ? null : await response.json().catch(() => null);
  return response.ok
    ? { ok: true, status: response.status, data: data as T, response }
    : { ok: false, status: response.status, error: (data ?? {}) as ApiErrorBody, response };
}

