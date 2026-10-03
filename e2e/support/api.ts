import { expect, request, type APIRequestContext, type APIResponse } from "@playwright/test";
import { PASSWORD, PROFILE, startup, TEAM, uid, uniqueEmail, visitorIp } from "./data";
import { API, REVIEWER } from "./env";

/* A small client for the API, as an outside caller sees it: real HTTP, JSON in
   and out. Each client is one visitor (its own X-Forwarded-For address, which
   the dev API trusts because the request comes from the private network), so
   tests running in parallel never share a rate-limit bucket. */

type Body = Record<string, unknown> | undefined;

export class Api {
  private constructor(
    readonly ctx: APIRequestContext,
    readonly ip: string,
    public token?: string,
  ) {}

  static async create(options: { token?: string; ip?: string; headers?: Record<string, string> } = {}) {
    const ip = options.ip ?? visitorIp();
    const ctx = await request.newContext({ extraHTTPHeaders: { "X-Forwarded-For": ip, ...options.headers } });
    return new Api(ctx, ip, options.token);
  }

  private headers(extra?: Record<string, string>) {
    return { ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}), ...extra };
  }

  get(path: string, headers?: Record<string, string>) {
    return this.ctx.get(API + path, { headers: this.headers(headers) });
  }
  post(path: string, data?: Body, headers?: Record<string, string>) {
    return this.ctx.post(API + path, { data, headers: this.headers(headers) });
  }
  patch(path: string, data?: Body, headers?: Record<string, string>) {
    return this.ctx.patch(API + path, { data, headers: this.headers(headers) });
  }
  put(path: string, data?: Body, headers?: Record<string, string>) {
    return this.ctx.put(API + path, { data, headers: this.headers(headers) });
  }
  delete(path: string, headers?: Record<string, string>) {
    return this.ctx.delete(API + path, { headers: this.headers(headers) });
  }

  dispose() {
    return this.ctx.dispose();
  }
}

/** The raw `vcs_session` value from a response that signed someone in. */
export function sessionToken(response: APIResponse): string {
  const cookie = response
    .headersArray()
    .filter((h) => h.name.toLowerCase() === "set-cookie")
    .map((h) => h.value)
    .find((value) => value.startsWith("vcs_session="));
  if (!cookie) throw new Error(`No session cookie in the ${response.status()} response from ${response.url()}`);
  return cookie.split(";")[0].slice("vcs_session=".length);
}

/** The attributes of the `vcs_session` cookie, lower-cased (e.g. { httponly: "", samesite: "Lax" }). */
export function sessionCookieAttributes(response: APIResponse): Record<string, string> {
  const cookie = response
    .headersArray()
    .find((h) => h.name.toLowerCase() === "set-cookie" && h.value.startsWith("vcs_session="))!.value;
  return Object.fromEntries(
    cookie
      .split(";")
      .slice(1)
      .map((part) => {
        const [key, ...value] = part.trim().split("=");
        return [key.toLowerCase(), value.join("=")];
      }),
  );
}

export async function json<T = Record<string, any>>(response: APIResponse): Promise<T> {
  return (await response.json()) as T;
}

export type Founder = { api: Api; email: string; password: string; token: string; id: string; name: string };

/** A new founder account, signed in (Bearer). */
export async function newFounder(name = "Maya Rosen"): Promise<Founder> {
  const api = await Api.create();
  const email = uniqueEmail();
  const response = await api.post("/auth/register", { name, email, password: PASSWORD, terms: true });
  expect(response.status(), await response.text()).toBe(201);
  api.token = sessionToken(response);
  const { user } = await json(response);
  return { api, email, password: PASSWORD, token: api.token, id: user.id, name };
}

/** The dev reviewer, signed in (Bearer). */
export async function reviewer(): Promise<Api> {
  const api = await Api.create();
  const response = await api.post("/auth/login", REVIEWER);
  expect(response.status(), "the reviewer account exists (python manage.py seed_dev_accounts)").toBe(200);
  api.token = sessionToken(response);
  return api;
}

/** Answers every required question; the first member becomes a 60% founder. */
export async function fillApplication(api: Api, startupName = `E2E ${uid()}`) {
  for (const [section, body] of [
    ["profile", PROFILE],
    ["startup", startup(startupName)],
    ["team", TEAM],
  ] as const) {
    const response = await api.patch(`/me/application/${section}`, body);
    expect(response.status(), await response.text()).toBe(200);
  }
  const { application } = await json(await api.get("/me/application"));
  const [first] = application.team.members;
  const edited = await api.patch(`/me/application/team/members/${first.id}`, {
    role: "CEO",
    equity: 60,
    isFounder: true,
  });
  expect(edited.status(), await edited.text()).toBe(200);
  return startupName;
}

/** A founder with a complete, submitted application. */
export async function submittedFounder(startupName?: string) {
  const founder = await newFounder();
  const name = await fillApplication(founder.api, startupName);
  const response = await founder.api.post("/me/application/submit", { confirm: true });
  expect(response.status(), await response.text()).toBe(200);
  return { ...founder, startup: name };
}

/** The public slug of an application, as reviewers see it. */
export async function slugOf(reviewerApi: Api, applicationId: string): Promise<string> {
  const { application } = await json(await reviewerApi.get(`/admin/applications/${applicationId}`));
  return application.slug;
}
