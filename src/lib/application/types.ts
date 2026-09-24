/* The founder application: everything a startup submits for review.
   Option lists live here so the forms and the server-side validation read
   from the same source. Safe to import from client components. */

/* ---------- Option lists ---------- */

/** Mirrors the six stages of the programme on the landing page. */
export const STAGES = [
  { id: "idea", label: "Discover", hint: "Exploring a problem, no product yet" },
  { id: "mvp", label: "Build MVP", hint: "Building the first version" },
  { id: "validation", label: "Validate", hint: "Real users are testing it" },
  { id: "traction", label: "Traction", hint: "Paying customers, growing usage" },
  { id: "fundraising", label: "Fundraise", hint: "Raising a round now" },
  { id: "scaling", label: "Scale", hint: "Hiring and expanding markets" },
] as const;
export type StageId = (typeof STAGES)[number]["id"];

export const INDUSTRIES = [
  "AI & machine learning",
  "B2B software / SaaS",
  "Climate & energy",
  "Consumer",
  "Deep tech & hardware",
  "E-commerce & retail",
  "Education",
  "Fintech",
  "Health & biotech",
  "Marketplaces",
  "Mobility & logistics",
  "Other",
] as const;

export const BUSINESS_MODELS = [
  "Subscription (B2B)",
  "Subscription (B2C)",
  "Marketplace / take rate",
  "Transactional / usage-based",
  "Hardware sales",
  "Advertising",
  "Licensing",
  "Not decided yet",
] as const;

export const COMMITMENTS = [
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
] as const;
export type Commitment = (typeof COMMITMENTS)[number]["id"];

export const WORKED_TOGETHER = [
  "Less than 6 months",
  "6–12 months",
  "1–3 years",
  "More than 3 years",
  "Solo founder",
] as const;

export const HEARD_FROM = [
  "Friend or alumni referral",
  "VC Summit event",
  "Social media",
  "Search",
  "Press or podcast",
  "Other",
] as const;

/* ---------- Review status ---------- */

export const STATUSES = {
  draft: {
    label: "Draft",
    headline: "Finish and submit",
    tone: "neutral",
    blurb: "Finish each section, then submit your application for review.",
  },
  submitted: {
    label: "Submitted",
    headline: "In the review queue",
    tone: "gold",
    blurb:
      "Your application is in the queue. The team usually starts a review within 5 working days.",
  },
  in_review: {
    label: "In review",
    headline: "Our team is reviewing your startup",
    tone: "gold",
    blurb:
      "Our team is validating your idea and analysing the market. We'll be in touch here.",
  },
  changes_requested: {
    label: "Changes requested",
    headline: "The review team needs a bit more",
    tone: "warn",
    blurb:
      "The review team asked for more detail. Update your application and submit it again.",
  },
  accepted: {
    label: "Accepted",
    headline: "You're in the cohort",
    tone: "green",
    blurb: "Congratulations — you're in. Watch your inbox for onboarding.",
  },
  declined: {
    label: "Not selected",
    headline: "Not this cohort",
    tone: "neutral",
    blurb:
      "This cohort wasn't the right fit. You're welcome to apply again next cycle.",
  },
} as const;
export type Status = keyof typeof STATUSES;

/** Founders can edit only while the application isn't with the review team. */
export const EDITABLE: readonly Status[] = ["draft", "changes_requested"];

/* ---------- The record ---------- */

export type Profile = {
  fullName: string;
  /** Comes from the account; shown read-only in the profile form. */
  email: string;
  phone: string;
  title: string;
  country: string;
  city: string;
  linkedin: string;
  bio: string;
  experienceYears: number | null;
  commitment: Commitment | "";
  heardFrom: string;
};

export type Startup = {
  name: string;
  tagline: string;
  website: string;
  industry: string;
  stage: StageId | "";
  foundedOn: string; // YYYY-MM
  country: string;
  incorporated: "yes" | "no" | "";
  businessModel: string;

  problem: string;
  solution: string;
  targetCustomer: string;
  marketSize: string;
  competitors: string;
  advantage: string;

  activeUsers: number | null;
  payingCustomers: number | null;
  monthlyRevenue: number | null; // USD
  growthRate: number | null; // % month over month
  keyMetric: string;

  raisedToDate: number | null; // USD
  seeking: number | null; // USD
  useOfFunds: string;

  deckUrl: string;
  demoUrl: string;
  videoUrl: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  linkedin: string;
  equity: number | null; // %
  commitment: Commitment | "";
  isFounder: boolean;
};

export type Team = {
  members: TeamMember[];
  workedTogether: string;
  whyUs: string;
  hiringNeeds: string;
};

export type TimelineEvent = {
  id: string;
  at: string; // ISO timestamp
  by: "founder" | "support";
  kind: "created" | "submitted" | "withdrawn" | "status" | "note";
  title: string;
  body?: string;
};

export type Application = {
  userId: string;
  status: Status;
  profile: Profile;
  startup: Startup;
  team: Team;
  events: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
};

/* ---------- Reviewer-only data ----------
   Stored next to the application but never sent to the founder: the
   founder-facing DAL strips `review` before anything renders. */

export const SCORE_AREAS = [
  { id: "problem", label: "Problem", hint: "Real, painful, frequent — and validated?" },
  { id: "solution", label: "Solution", hint: "Clearly better than today's alternatives?" },
  { id: "market", label: "Market", hint: "Big enough, with a credible bottom-up estimate?" },
  { id: "team", label: "Team", hint: "Founder–market fit, commitment, complementary skills?" },
  { id: "traction", label: "Traction", hint: "Evidence of pull for their stage?" },
] as const;
export type ScoreArea = (typeof SCORE_AREAS)[number]["id"];

export const RECOMMENDATIONS = [
  { id: "accept", label: "Accept" },
  { id: "interview", label: "Interview" },
  { id: "decline", label: "Decline" },
] as const;
export type Recommendation = (typeof RECOMMENDATIONS)[number]["id"];

/** One reviewer's assessment. Each reviewer keeps their own. */
export type Scorecard = {
  reviewerId: string;
  reviewerName: string;
  scores: Partial<Record<ScoreArea, number>>; // 1–5
  recommendation: Recommendation | "";
  summary: string;
  updatedAt: string;
};

export type InternalNote = {
  id: string;
  at: string;
  authorId: string;
  authorName: string;
  body: string;
};

export type ReviewData = {
  assigneeId: string | null;
  assigneeName: string | null;
  scorecards: Scorecard[];
  notes: InternalNote[];
};

/** What the store holds. Founders only ever see the `Application` part. */
export type StoredApplication = Application & { review?: ReviewData };

/* ---------- Helpers ---------- */

export function stageLabel(id: string) {
  return STAGES.find((s) => s.id === id)?.label ?? "Not set";
}

export function formatMoney(n: number | null) {
  if (n === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: n >= 100_000 ? "compact" : "standard",
    maximumFractionDigits: n >= 100_000 ? 1 : 0,
  }).format(n);
}

export function formatNumber(n: number | null) {
  return n === null ? "—" : new Intl.NumberFormat("en-US").format(n);
}
