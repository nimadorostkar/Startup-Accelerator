import { expect, test } from "@playwright/test";
import { Api, json } from "../support/api";
import { API } from "../support/env";

test.describe("health and basics", () => {
  let api: Api;
  test.beforeAll(async () => {
    api = await Api.create();
  });
  test.afterAll(() => api.dispose());

  test("liveness and readiness", async () => {
    const live = await api.get("/health");
    expect(live.status()).toBe(200);
    expect(await live.json()).toEqual({ status: "ok" });

    const ready = await api.get("/health/ready");
    expect(ready.status()).toBe(200);
    expect(await ready.json()).toEqual({ status: "ok", database: "ok", cache: "ok" });
  });

  test("option lists", async () => {
    const options = await json(await api.get("/options"));
    expect(options.stages.map((s: { id: string }) => s.id)).toEqual([
      "idea",
      "mvp",
      "validation",
      "traction",
      "fundraising",
      "scaling",
    ]);
    expect(options.industries).toHaveLength(12);
    expect(options.businessModels).toHaveLength(8);
    expect(options.decisions.map((d: { id: string }) => d.id)).toEqual([
      "start_review",
      "request_changes",
      "accept",
      "decline",
      "reopen",
    ]);
  });

  test("request ids are echoed or created", async () => {
    const echoed = await api.get("/health", { "X-Request-ID": "e2e-request-0001" });
    expect(echoed.headers()["x-request-id"]).toBe("e2e-request-0001");
    expect((await api.get("/health")).headers()["x-request-id"]).toMatch(/^[0-9a-f]{32}$/);
  });

  test("errors have one shape", async () => {
    const missing = await api.get("/no-such-endpoint");
    expect(missing.status()).toBe(404);
    expect(await missing.json()).toEqual({ message: "Not found." });

    const signedOut = await api.get("/me");
    expect(signedOut.status()).toBe(401);
    expect(await signedOut.json()).toEqual({ message: "Sign in to continue." });
    expect(signedOut.headers()["www-authenticate"]).toContain("Bearer");
  });

  test("malformed JSON, or JSON that isn't an object, is a 400 with a message", async () => {
    const send = (raw: string) =>
      api.ctx.post(`${API}/contact`, { data: Buffer.from(raw), headers: { "Content-Type": "application/json" } });
    const broken = await send("{not json");
    expect(broken.status()).toBe(400);
    expect(await broken.json()).toEqual({ message: "The request body isn't valid JSON." });
    for (const raw of ['"just a string"', "[1, 2]"]) {
      const response = await send(raw);
      expect(response.status()).toBe(400);
      expect(await response.json()).toEqual({ message: "The request body must be a JSON object." });
    }
  });
});
