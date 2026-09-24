"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endSession } from "@/lib/auth";
import { event, LockedError, mutateMyApplication } from "@/lib/application/dal";
import { progress } from "@/lib/application/progress";
import {
  BUSINESS_MODELS,
  COMMITMENTS,
  HEARD_FROM,
  INDUSTRIES,
  STAGES,
  WORKED_TOGETHER,
  type Application,
  type TeamMember,
} from "@/lib/application/types";
import {
  collect,
  maxLength,
  normalizeUrl,
  oneOf,
  optionalEmail,
  optionalLinkedIn,
  optionalPhone,
  optionalUrl,
  readNumber,
  readString,
  type FieldErrors,
} from "@/lib/validation";

export type SaveState = {
  ok?: boolean;
  message?: string;
  errors?: FieldErrors;
  /** What was submitted, echoed back so a failed save keeps the user's input
      (React resets uncontrolled forms after an action). */
  values?: Record<string, string>;
  /** Changes on every successful save, so the form can tell saves apart. */
  savedAt?: string;
};

const ids = <T extends { id: string }>(list: readonly T[]) => list.map((o) => o.id);
const commitmentIds = ids(COMMITMENTS);
const stageIds = ids(STAGES);

function echo(form: FormData) {
  const values: Record<string, string> = {};
  for (const [k, v] of form) if (typeof v === "string" && !k.startsWith("$")) values[k] = v;
  return values;
}

/** Thrown inside a mutation to refuse it with a message (optionally tied to a field). */
class Rejected extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
  }
}

function invalid(form: FormData, errors: FieldErrors): SaveState {
  return {
    ok: false,
    message: "Some fields need another look — they're highlighted below.",
    errors,
    values: echo(form),
  };
}

/** Runs a change, refreshes every dashboard page, and turns the lock into a message. */
async function commit(
  form: FormData | null,
  change: (app: Application) => Application,
  message = "Changes saved.",
): Promise<SaveState> {
  try {
    await mutateMyApplication(change);
  } catch (err) {
    if (err instanceof Rejected && err.field && form)
      return invalid(form, { [err.field]: err.message });
    if (err instanceof LockedError || err instanceof Rejected)
      return { ok: false, message: err.message, values: form ? echo(form) : undefined };
    throw err; // includes Next's redirect signal — never swallow it
  }
  revalidatePath("/dashboard", "layout");
  return { ok: true, message, savedAt: new Date().toISOString() };
}

/* ---------- Profile ---------- */

export async function saveProfile(_prev: SaveState, form: FormData): Promise<SaveState> {
  const fullName = readString(form, "fullName");
  const phone = readString(form, "phone");
  const title = readString(form, "title");
  const country = readString(form, "country");
  const city = readString(form, "city");
  const linkedin = readString(form, "linkedin");
  const bio = readString(form, "bio");
  const experience = readNumber(form, "experienceYears");
  const commitment = readString(form, "commitment");
  const heardFrom = readString(form, "heardFrom");

  const errors = collect([
    ["fullName", maxLength(fullName, 80)],
    ["phone", optionalPhone(phone)],
    ["title", maxLength(title, 80)],
    ["country", maxLength(country, 60)],
    ["city", maxLength(city, 60)],
    ["linkedin", optionalLinkedIn(linkedin)],
    ["bio", maxLength(bio, 1200)],
    [
      "experienceYears",
      experience.error ??
        (experience.value !== null && experience.value > 60 ? "That's more than 60 years." : null),
    ],
    ["commitment", commitment && !oneOf(commitment, commitmentIds) ? "Pick an option." : null],
    ["heardFrom", heardFrom && !oneOf(heardFrom, HEARD_FROM) ? "Pick an option." : null],
  ]);
  if (errors) return invalid(form, errors);

  return commit(form, (app) => ({
    ...app,
    profile: {
      ...app.profile, // email is owned by the account, never taken from the form
      fullName,
      phone,
      title,
      country,
      city,
      linkedin: normalizeUrl(linkedin),
      bio,
      experienceYears: experience.value,
      commitment: commitment as Application["profile"]["commitment"],
      heardFrom,
    },
  }));
}

/* ---------- Startup ---------- */

export async function saveStartup(_prev: SaveState, form: FormData): Promise<SaveState> {
  const s = (k: string) => readString(form, k);
  const text = {
    name: s("name"),
    tagline: s("tagline"),
    website: s("website"),
    industry: s("industry"),
    stage: s("stage"),
    foundedOn: s("foundedOn"),
    country: s("country"),
    incorporated: s("incorporated"),
    businessModel: s("businessModel"),
    problem: s("problem"),
    solution: s("solution"),
    targetCustomer: s("targetCustomer"),
    marketSize: s("marketSize"),
    competitors: s("competitors"),
    advantage: s("advantage"),
    keyMetric: s("keyMetric"),
    useOfFunds: s("useOfFunds"),
    deckUrl: s("deckUrl"),
    demoUrl: s("demoUrl"),
    videoUrl: s("videoUrl"),
  };
  const num = {
    activeUsers: readNumber(form, "activeUsers"),
    payingCustomers: readNumber(form, "payingCustomers"),
    monthlyRevenue: readNumber(form, "monthlyRevenue"),
    growthRate: readNumber(form, "growthRate"),
    raisedToDate: readNumber(form, "raisedToDate"),
    seeking: readNumber(form, "seeking"),
  };

  const thisMonth = new Date().toISOString().slice(0, 7);
  const errors = collect([
    ["name", maxLength(text.name, 60)],
    ["tagline", maxLength(text.tagline, 120)],
    ["website", optionalUrl(text.website)],
    ["industry", text.industry && !oneOf(text.industry, INDUSTRIES) ? "Pick an industry." : null],
    ["stage", text.stage && !oneOf(text.stage, stageIds) ? "Pick a stage." : null],
    [
      "foundedOn",
      text.foundedOn && (!/^\d{4}-\d{2}$/.test(text.foundedOn) || text.foundedOn > thisMonth)
        ? "Pick a month that isn't in the future."
        : null,
    ],
    ["country", maxLength(text.country, 60)],
    ["incorporated", text.incorporated && !oneOf(text.incorporated, ["yes", "no"]) ? "Pick an option." : null],
    ["businessModel", text.businessModel && !oneOf(text.businessModel, BUSINESS_MODELS) ? "Pick a model." : null],
    ["problem", maxLength(text.problem, 1500)],
    ["solution", maxLength(text.solution, 1500)],
    ["targetCustomer", maxLength(text.targetCustomer, 600)],
    ["marketSize", maxLength(text.marketSize, 600)],
    ["competitors", maxLength(text.competitors, 1000)],
    ["advantage", maxLength(text.advantage, 1000)],
    ["keyMetric", maxLength(text.keyMetric, 200)],
    ["useOfFunds", maxLength(text.useOfFunds, 1000)],
    ["deckUrl", optionalUrl(text.deckUrl)],
    ["demoUrl", optionalUrl(text.demoUrl)],
    ["videoUrl", optionalUrl(text.videoUrl)],
    ...Object.entries(num).map(([k, r]) => [k, r.error] as [string, string | null]),
    [
      "growthRate",
      num.growthRate.value !== null && num.growthRate.value > 1000 ? "That looks too high — use % per month." : null,
    ],
  ]);
  if (errors) return invalid(form, errors);

  return commit(form, (app) => ({
    ...app,
    startup: {
      ...text,
      website: normalizeUrl(text.website),
      deckUrl: normalizeUrl(text.deckUrl),
      demoUrl: normalizeUrl(text.demoUrl),
      videoUrl: normalizeUrl(text.videoUrl),
      stage: text.stage as Application["startup"]["stage"],
      incorporated: text.incorporated as Application["startup"]["incorporated"],
      activeUsers: num.activeUsers.value,
      payingCustomers: num.payingCustomers.value,
      monthlyRevenue: num.monthlyRevenue.value,
      growthRate: num.growthRate.value,
      raisedToDate: num.raisedToDate.value,
      seeking: num.seeking.value,
    },
  }));
}

/* ---------- Team ---------- */

export async function saveTeamDetails(_prev: SaveState, form: FormData): Promise<SaveState> {
  const workedTogether = readString(form, "workedTogether");
  const whyUs = readString(form, "whyUs");
  const hiringNeeds = readString(form, "hiringNeeds");

  const errors = collect([
    ["workedTogether", workedTogether && !oneOf(workedTogether, WORKED_TOGETHER) ? "Pick an option." : null],
    ["whyUs", maxLength(whyUs, 1200)],
    ["hiringNeeds", maxLength(hiringNeeds, 800)],
  ]);
  if (errors) return invalid(form, errors);

  return commit(form, (app) => ({
    ...app,
    team: { ...app.team, workedTogether, whyUs, hiringNeeds },
  }));
}

function readMember(form: FormData) {
  const member = {
    name: readString(form, "name"),
    role: readString(form, "role"),
    email: readString(form, "email"),
    linkedin: readString(form, "linkedin"),
    commitment: readString(form, "commitment"),
    isFounder: form.get("isFounder") === "on",
  };
  const equity = readNumber(form, "equity");
  const errors = collect([
    ["name", !member.name ? "Add their name." : maxLength(member.name, 80)],
    ["role", !member.role ? "Add their role, e.g. CTO." : maxLength(member.role, 80)],
    ["email", optionalEmail(member.email)],
    ["linkedin", optionalLinkedIn(member.linkedin)],
    ["equity", equity.error ?? (equity.value !== null && equity.value > 100 ? "Equity can't exceed 100%." : null)],
    ["commitment", member.commitment && !oneOf(member.commitment, commitmentIds) ? "Pick an option." : null],
  ]);
  return {
    errors,
    member: {
      ...member,
      linkedin: normalizeUrl(member.linkedin),
      equity: equity.value,
      commitment: member.commitment as TeamMember["commitment"],
    },
  };
}

/** Equity across the team can't add up to more than 100%. */
function equityError(members: TeamMember[]) {
  const total = members.reduce((n, m) => n + (m.equity ?? 0), 0);
  return total > 100 ? `That brings team equity to ${total}% — it can't exceed 100%.` : null;
}

export async function saveMember(
  memberId: string | null,
  _prev: SaveState,
  form: FormData,
): Promise<SaveState> {
  const { errors, member } = readMember(form);
  if (errors) return invalid(form, errors);

  return commit(
    form,
    (app) => {
      const members = memberId
        ? app.team.members.map((m) => (m.id === memberId ? { ...m, ...member } : m))
        : [...app.team.members, { id: crypto.randomUUID(), ...member }];
      // Checked against the stored team inside the update, so two quick saves
      // can't each pass on their own and add up to more than 100%.
      const overflow = equityError(members);
      if (overflow) throw new Rejected(overflow, "equity");
      return { ...app, team: { ...app.team, members } };
    },
    memberId ? `${member.name} updated.` : `${member.name} added to the team.`,
  );
}

export async function removeMember(memberId: string): Promise<SaveState> {
  return commit(
    null,
    (app) => ({
      ...app,
      team: { ...app.team, members: app.team.members.filter((m) => m.id !== memberId) },
    }),
    "Team member removed.",
  );
}

/* ---------- Submission ---------- */

export async function submitApplication(_prev: SaveState, form: FormData): Promise<SaveState> {
  if (form.get("confirm") !== "on")
    return { ok: false, errors: { confirm: "Please confirm the details are accurate." } };

  return commit(
    null,
    (a) => {
      // Re-checked on the stored record: the disabled button is a hint, this is the rule.
      const { ready, missing } = progress(a);
      if (!ready)
        throw new Rejected(
          `${missing.length} required ${missing.length === 1 ? "answer is" : "answers are"} still missing.`,
        );
      return {
        ...a,
        status: "submitted",
        submittedAt: new Date().toISOString(),
        events: [
          ...a.events,
          event(
            "submitted",
            a.status === "changes_requested"
              ? "Application resubmitted"
              : "Application submitted for review",
          ),
        ],
      };
    },
    "Submitted — the review team has your application.",
  );
}

/** Pull a submission back before review starts, to keep editing. */
export async function withdrawApplication(): Promise<SaveState> {
  try {
    await mutateMyApplication(
      (a) => {
        if (a.status !== "submitted") throw new LockedError();
        return {
          ...a,
          status: "draft",
          submittedAt: null,
          events: [...a.events, event("withdrawn", "Submission withdrawn to make changes")],
        };
      },
      { editable: false },
    );
  } catch (err) {
    if (err instanceof LockedError)
      return { ok: false, message: "Review has already started, so this can't be withdrawn." };
    throw err;
  }
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Withdrawn — your application is back in draft." };
}

export async function signOut() {
  await endSession();
  redirect("/login");
}
