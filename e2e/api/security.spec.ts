import { expect, test } from "@playwright/test";
import { Api, newFounder } from "../support/api";
import { SITE } from "../support/env";

test.describe("security boundaries", () => {
  test("cookie sessions can only change data from the site itself", async () => {
    const founder = await newFounder();
    const browser = await Api.create({ headers: { Cookie: `vcs_session=${founder.token}` } });
    const body = { fullName: "Changed By Someone Else" };

    const noOrigin = await browser.patch("/me/application/profile", body);
    expect(noOrigin.status()).toBe(403);
    const otherSite = await browser.patch("/me/application/profile", body, { Origin: "https://evil.example" });
    expect(otherSite.status()).toBe(403);
    const ownSite = await browser.patch("/me/application/profile", body, { Origin: SITE });
    expect(ownSite.status()).toBe(200);
    const fromReferer = await browser.patch("/me/application/profile", body, { Referer: `${SITE}/dashboard/profile` });
    expect(fromReferer.status()).toBe(200);
    await Promise.all([browser.dispose(), founder.api.dispose()]);
  });

  test("a made-up or ended token is refused, not ignored", async () => {
    const forged = await Api.create({ token: "made-up-token" });
    expect((await forged.get("/me")).status()).toBe(401);
    // …while a stale cookie just means "signed out" on public reads.
    const stale = await Api.create({ headers: { Cookie: "vcs_session=stale-value" } });
    expect((await stale.get("/events")).status()).toBe(200);
    expect((await stale.get("/me")).status()).toBe(401);
    await Promise.all([forged.dispose(), stale.dispose()]);
  });

  test("bodies that aren't JSON are refused", async () => {
    const api = await Api.create();
    const form = await api.ctx.post(`${process.env.E2E_API_URL ?? ""}`.length ? "" : "", {});
    void form;
    const response = await api.ctx.fetch(
      `${(await import("../support/env")).API}/auth/login`,
      { method: "POST", data: "email=a@b.co&password=x", headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );
    expect(response.status()).toBe(415);
    await api.dispose();
  });
});
