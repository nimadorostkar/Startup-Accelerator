"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api, BackendUnavailable, UNAVAILABLE } from "@/lib/api";
import { changePassword, endSession, renameAccount, resendVerification } from "@/lib/auth";
import { RETURN_TO_HEADER, SIGNED_OUT, signInHref } from "@/lib/session";
import { checkName, checkNewPassword, collect, readString, type FieldErrors } from "@/lib/validation";

/* The dashboard's forms. Each sends what was typed to the API, which checks
   every rule against the stored application (edit lock, equity cap, "complete
   before submit") and answers with the same field names and messages the
   forms show. See backend/apps/applications/services.py. */

export type SaveState = {
  ok?: boolean;
  message?: string;
  errors?: FieldErrors;
  /** What was submitted, echoed back so a failed save keeps the user's input
      (React resets uncontrolled forms after an action). */
  values?: Record<string, string>;
  /** Changes on every successful save, so the form can tell saves apart. */
  savedAt?: string;
  /** The session ended: nothing was saved, and this signs in again (in a new tab, keeping the form). */
  signInHref?: string;
};

function echo(form: FormData) {
  const values: Record<string, string> = {};
  for (const [k, v] of form) if (typeof v === "string" && !k.startsWith("$")) values[k] = v;
  return values;
}

/** The named fields as trimmed strings ("" when absent); the API parses and checks them. */
function fields(form: FormData, names: string[]): Record<string, string> {
  return Object.fromEntries(names.map((name) => [name, readString(form, name)]));
}

/** Sends one change, refreshes every dashboard page, and turns refusals into messages. */
async function send(
  form: FormData | null,
  path: string,
  method: "PATCH" | "POST" | "DELETE",
  body: unknown,
  message = "Changes saved.",
): Promise<SaveState> {
  const values = form ? echo(form) : undefined;
  let result;
  try {
    result = await api(path, { method, body, auth: true });
  } catch (err) {
    if (err instanceof BackendUnavailable) {
      console.error(err);
      return { ok: false, message: UNAVAILABLE, values };
    }
    throw err;
  }
  if (result.status === 401) {
    // Not a redirect: that would throw away everything typed into the form.
    return { ok: false, message: SIGNED_OUT, values, signInHref: signInHref((await headers()).get(RETURN_TO_HEADER)) };
  }
  if (!result.ok) {
    // The application changed underneath this page (locked for review, a member
    // removed in another tab, an answer cleared before submitting): refresh it so
    // it shows what's true now, e.g. the list of answers still missing.
    if (result.status === 409 || result.status === 404 || result.error.missing) revalidatePath("/dashboard", "layout");
    return {
      ok: false,
      message: result.error.message ?? "That didn't save. Please try again.",
      errors: result.error.errors,
      values,
    };
  }
  revalidatePath("/dashboard", "layout");
  return { ok: true, message, savedAt: new Date().toISOString() };
}

/* ---------- Profile ---------- */

const PROFILE_FIELDS = [
  "fullName",
  "phone",
  "title",
  "country",
  "city",
  "linkedin",
  "bio",
  "experienceYears",
  "commitment",
  "heardFrom",
];

export async function saveProfile(_prev: SaveState, form: FormData): Promise<SaveState> {
  // The email belongs to the account: it's never read from the form.
  return send(form, "/me/application/profile", "PATCH", fields(form, PROFILE_FIELDS));
}

/* ---------- Startup ---------- */

const STARTUP_FIELDS = [
  "name",
  "tagline",
  "website",
  "industry",
  "stage",
  "foundedOn",
  "country",
  "incorporated",
  "businessModel",
  "problem",
  "solution",
  "targetCustomer",
  "marketSize",
  "competitors",
  "advantage",
  "activeUsers",
  "payingCustomers",
  "monthlyRevenue",
  "growthRate",
  "keyMetric",
  "raisedToDate",
  "seeking",
  "useOfFunds",
  "deckUrl",
  "demoUrl",
  "videoUrl",
];

export async function saveStartup(_prev: SaveState, form: FormData): Promise<SaveState> {
  return send(form, "/me/application/startup", "PATCH", fields(form, STARTUP_FIELDS));
}

/* ---------- Team ---------- */

export async function saveTeamDetails(_prev: SaveState, form: FormData): Promise<SaveState> {
  return send(form, "/me/application/team", "PATCH", fields(form, ["workedTogether", "whyUs", "hiringNeeds"]));
}

export async function saveMember(
  memberId: string | null,
  _prev: SaveState,
  form: FormData,
): Promise<SaveState> {
  const name = readString(form, "name");
  const member: Record<string, string | boolean> = {
    ...fields(form, ["name", "role", "email", "linkedin", "equity", "commitment"]),
    isFounder: form.get("isFounder") === "on",
  };
  // The equity cap is checked by the API inside the save, so two quick saves
  // can't each pass on their own and add up to more than 100%.
  return memberId
    ? send(form, `/me/application/team/members/${encodeURIComponent(memberId)}`, "PATCH", member, `${name} updated.`)
    : send(form, "/me/application/team/members", "POST", member, `${name} added to the team.`);
}

export async function removeMember(memberId: string): Promise<SaveState> {
  return send(
    null,
    `/me/application/team/members/${encodeURIComponent(memberId)}`,
    "DELETE",
    undefined,
    "Team member removed.",
  );
}

/* ---------- Submission ---------- */

export async function submitApplication(_prev: SaveState, form: FormData): Promise<SaveState> {
  if (form.get("confirm") !== "on")
    return { ok: false, errors: { confirm: "Please confirm the details are accurate." } };

  // The API re-checks every required answer on the stored record.
  const state = await send(
    null,
    "/me/application/submit",
    "POST",
    { confirm: true },
    "Submitted — the review team has your application.",
  );
  if (state.ok) revalidateTag("startups", "max");
  return state;
}

/** Pull a submission back before review starts, to keep editing. */
export async function withdrawApplication(): Promise<SaveState> {
  const state = await send(
    null,
    "/me/application/withdraw",
    "POST",
    undefined,
    "Withdrawn — your application is back in draft.",
  );
  if (state.ok) revalidateTag("startups", "max");
  return state;
}

/* ---------- Account ---------- */

export async function resendVerificationEmail(): Promise<SaveState> {
  const result = await resendVerification();
  return { ok: result.ok, message: result.message, savedAt: new Date().toISOString() };
}

export async function signOut() {
  await endSession();
  redirect("/login");
}

/* ---------- Account settings ---------- */

export async function saveAccountName(_prev: SaveState, form: FormData): Promise<SaveState> {
  const name = readString(form, "name");
  const error = checkName(name);
  if (error) return { ok: false, errors: { name: error }, values: { name } };
  const result = await renameAccount(name);
  if (!result.ok) return { ok: false, message: result.message, errors: result.fieldErrors, values: { name } };
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Name saved.", savedAt: new Date().toISOString() };
}

export async function savePassword(_prev: SaveState, form: FormData): Promise<SaveState> {
  // Trimmed like every other sign-in form (the API does the same); never echoed back to the page.
  const currentPassword = readString(form, "currentPassword");
  const newPassword = readString(form, "newPassword");
  const errors = collect([["newPassword", checkNewPassword(newPassword)]]);
  if (errors) return { ok: false, errors };
  const result = await changePassword({ currentPassword, newPassword });
  if (!result.ok) return { ok: false, message: result.message, errors: result.fieldErrors };
  revalidatePath("/dashboard", "layout");
  return {
    ok: true,
    message: "Password changed. You've been signed out everywhere else.",
    savedAt: new Date().toISOString(),
  };
}
