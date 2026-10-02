/* Development only: fills the local store with sample applications so the
   review queue has something to work with.

     npm run seed:demo            add / refresh the sample applications
     npm run seed:demo -- --reset remove them again

   Sample records use ids starting "demo-" and are the only ones this script
   touches — real applications in the file are left alone. Every name,
   company and number below is invented. */

import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Scorecard, StageId, Status, StoredApplication } from "../src/lib/application/types";

const FILE = path.join(process.cwd(), ".data", "applications.json");
const DAY = 86_400_000;
const now = Date.now();
const ago = (days: number, hours = 0) => new Date(now - days * DAY - hours * 3_600_000).toISOString();
const id = () => crypto.randomUUID();

const REVIEWERS = {
  maya: { id: "reviewer-maya", name: "Maya Chen" },
  jonas: { id: "reviewer-jonas", name: "Jonas Weber" },
  // The development stand-in user, so "Assigned to me" has something in it.
  you: { id: "dev-founder", name: "Alex Rivera" },
};

type Spec = {
  slug: string;
  startup: string;
  tagline: string;
  industry: string;
  stage: StageId;
  model: string;
  country: string;
  founder: string;
  cofounder: string;
  status: Status;
  submittedDaysAgo: number | null;
  mrr: number | null;
  users: number | null;
  seeking: number | null;
  problem: string;
  assignee?: keyof typeof REVIEWERS;
  scorecards?: [keyof typeof REVIEWERS, number[], Scorecard["recommendation"], string][];
  supportEvents?: [daysAgo: number, title: string, body?: string][];
  note?: [keyof typeof REVIEWERS, string];
  incomplete?: boolean;
};

const SPECS: Spec[] = [
  {
    slug: "ledgerly", startup: "Ledgerly", tagline: "Month-end close for agencies, done in a day", industry: "Fintech",
    stage: "traction", model: "Subscription (B2B)", country: "United Kingdom", founder: "Maya Rosen", cofounder: "Tom Achebe",
    status: "submitted", submittedDaysAgo: 8, mrr: 21000, users: 140, seeking: 1_200_000,
    problem: "Creative agencies spend 6–9 days closing each month because billable hours, retainers and expenses live in four different tools.",
  },
  {
    slug: "tidewell", startup: "Tidewell", tagline: "Flood-risk forecasts for small coastal councils", industry: "Climate & energy",
    stage: "mvp", model: "Subscription (B2B)", country: "Indonesia", founder: "Sari Wibowo", cofounder: "Daniel Hart",
    status: "submitted", submittedDaysAgo: 6, mrr: null, users: 4, seeking: 500_000,
    problem: "Coastal councils plan flood defences from 10-year-old maps; they can't afford consultancies and get no warning of new risk zones.",
  },
  {
    slug: "kitebase", startup: "Kitebase", tagline: "Feature flags your support team can safely use", industry: "B2B software / SaaS",
    stage: "validation", model: "Subscription (B2B)", country: "Nigeria", founder: "Tunde Adeyemi", cofounder: "Ife Okafor",
    status: "submitted", submittedDaysAgo: 2, mrr: 1800, users: 36, seeking: 400_000,
    problem: "Support teams wait days for engineers to toggle features for a single customer, because flag tools are built only for developers.",
  },
  {
    slug: "restly", startup: "Restly", tagline: "Sleep coaching for night-shift nurses", industry: "Health & biotech",
    stage: "validation", model: "Subscription (B2C)", country: "Brazil", founder: "Camila Ferreira", cofounder: "Rafael Souza",
    status: "in_review", submittedDaysAgo: 5, mrr: 3200, users: 900, seeking: 600_000, assignee: "maya",
    problem: "Night-shift nurses average under five hours of sleep; generic sleep apps assume a 9-to-5 schedule and make rotating shifts worse.",
    scorecards: [["maya", [4, 4, 3, 5, 3], "interview", "Strong founder–market fit (Camila was an ICU nurse). Retention data is early but promising."]],
    supportEvents: [[4, "Review started"]],
  },
  {
    slug: "relaywave", startup: "Relaywave", tagline: "An AI marketing team for one-person companies", industry: "AI & machine learning",
    stage: "traction", model: "Subscription (B2B)", country: "United States", founder: "Marcus Hale", cofounder: "Lena Ortiz",
    status: "in_review", submittedDaysAgo: 3, mrr: 12500, users: 1500, seeking: 1_500_000, assignee: "you",
    problem: "Solo founders know they should market consistently but can't afford an agency, so campaigns start and stall within weeks.",
    supportEvents: [[2, "Review started"]],
    note: ["jonas", "Check how much of the MRR is from their previous agency clients — could flatter the numbers."],
  },
  {
    slug: "orbitly", startup: "Orbitly", tagline: "Tutoring marketplace for rural secondary schools", industry: "Education",
    stage: "mvp", model: "Marketplace / take rate", country: "Kenya", founder: "Amina Otieno", cofounder: "Peter Kamau",
    status: "changes_requested", submittedDaysAgo: 9, mrr: 600, users: 310, seeking: 350_000, assignee: "jonas",
    problem: "Rural schools have one maths teacher for 200 students, and qualified tutors in cities have no reliable way to reach them.",
    scorecards: [["jonas", [4, 3, 2, 4, 2], "interview", "Great mission, but supply side is unproven. Need tutor retention numbers."]],
    supportEvents: [
      [8, "Review started"],
      [6, "Changes requested", "Thanks — compelling problem. Before interviews, please add:\n• How many tutors have completed 4+ sessions\n• Your cost to acquire a school"],
    ],
  },
  {
    slug: "greenloop", startup: "Greenloop", tagline: "Returnable packaging for grocery delivery", industry: "Climate & energy",
    stage: "fundraising", model: "Transactional / usage-based", country: "Netherlands", founder: "Eva de Vries", cofounder: "Joost Bakker",
    status: "accepted", submittedDaysAgo: 21, mrr: 34000, users: 5200, seeking: 2_000_000, assignee: "maya",
    problem: "Online grocers ship each order in 6–10 single-use bags; customers hate the waste and grocers pay for packaging every time.",
    scorecards: [
      ["maya", [5, 4, 4, 5, 5], "accept", "Clear winner. Two grocer contracts signed, packaging reused 38 times on average."],
      ["jonas", [4, 4, 4, 4, 5], "accept", "Operationally complex but they've proven the loop works."],
    ],
    supportEvents: [[19, "Review started"], [12, "Application accepted", "Welcome to the Fall 2026 cohort! Onboarding call invites are on their way."]],
  },
  {
    slug: "parcelhive", startup: "Parcelhive", tagline: "Shared parcel lockers for apartment blocks", industry: "Mobility & logistics",
    stage: "idea", model: "Hardware sales", country: "Poland", founder: "Kasia Nowak", cofounder: "Piotr Zielinski",
    status: "declined", submittedDaysAgo: 18, mrr: null, users: null, seeking: 250_000, assignee: "jonas",
    problem: "Couriers leave parcels in apartment lobbies where they get stolen, and landlords won't pay for a locker from each courier company.",
    scorecards: [["jonas", [3, 2, 2, 3, 1], "decline", "Crowded space and no pilot yet. Encourage them to reapply with a building partner."]],
    supportEvents: [[15, "Review started"], [11, "Application not selected", "Thank you for applying. We'd love to see a pilot with a building partner — please apply again next cycle."]],
  },
  // ── More of the cohort ──
  {
    slug: "cobaltry", startup: "Cobaltry", tagline: "Battery health passports for second-life EV packs", industry: "Climate & energy",
    stage: "scaling", model: "Transactional / usage-based", country: "Germany", founder: "Lea Hoffmann", cofounder: "Emre Yilmaz",
    status: "accepted", submittedDaysAgo: 26, mrr: 48000, users: 60, seeking: 3_000_000, assignee: "jonas",
    problem: "Used EV batteries are scrapped or sold blind because buyers can't verify how much capacity is left in each pack.",
    scorecards: [["jonas", [5, 4, 5, 4, 5], "accept", "Recyclers and storage integrators already pay per passport. Strong unit economics."]],
    supportEvents: [[24, "Review started"], [17, "Application accepted", "Welcome to the Fall 2026 cohort! Onboarding call invites are on their way."]],
  },
  {
    slug: "pillpath", startup: "Pillpath", tagline: "Medication reminders families can see", industry: "Health & biotech",
    stage: "traction", model: "Subscription (B2C)", country: "India", founder: "Ananya Rao", cofounder: "Vikram Mehta",
    status: "accepted", submittedDaysAgo: 24, mrr: 15500, users: 8200, seeking: 1_000_000, assignee: "maya",
    problem: "Elderly parents miss doses and their adult children only find out at the next doctor's visit.",
    scorecards: [["maya", [5, 4, 4, 4, 4], "accept", "Retention is excellent: 71% of families still active after 90 days."]],
    supportEvents: [[22, "Review started"], [15, "Application accepted", "Welcome to the Fall 2026 cohort! Onboarding call invites are on their way."]],
  },
  {
    slug: "quarrylane", startup: "Quarrylane", tagline: "Building materials, ordered by the truckload, for small builders", industry: "Marketplaces",
    stage: "traction", model: "Marketplace / take rate", country: "Mexico", founder: "Lucia Navarro", cofounder: "Diego Ramos",
    status: "accepted", submittedDaysAgo: 23, mrr: 27000, users: 640, seeking: 1_800_000, assignee: "maya",
    problem: "Small builders spend a day a week phoning yards for cement and steel prices, and still overpay versus big contractors.",
    scorecards: [["maya", [4, 4, 5, 4, 4], "accept", "Big, fragmented market and a clear wedge. Repeat orders are strong."]],
    supportEvents: [[21, "Review started"], [14, "Application accepted", "Welcome to the Fall 2026 cohort! Onboarding call invites are on their way."]],
  },
  // ── More in review ──
  {
    slug: "lumora", startup: "Lumora", tagline: "Low-cost light sensors that tell growers when to pick", industry: "Deep tech & hardware",
    stage: "mvp", model: "Hardware sales", country: "Chile", founder: "Valentina Rojas", cofounder: "Matias Silva",
    status: "in_review", submittedDaysAgo: 7, mrr: null, users: 12, seeking: 800_000, assignee: "jonas",
    problem: "Vineyards judge ripeness by tasting grapes row by row, so harvest timing is a guess across hundreds of hectares.",
    supportEvents: [[5, "Review started"]],
  },
  {
    slug: "tallybird", startup: "Tallybird", tagline: "Bookkeeping over WhatsApp for market traders", industry: "Fintech",
    stage: "validation", model: "Subscription (B2C)", country: "Ghana", founder: "Kwame Mensah", cofounder: "Abena Owusu",
    status: "in_review", submittedDaysAgo: 4, mrr: 900, users: 2300, seeking: 450_000, assignee: "you",
    problem: "Market traders keep accounts in notebooks, so banks can't see their income and won't lend to them.",
    supportEvents: [[3, "Review started"]],
  },
  {
    slug: "shiftnest", startup: "Shiftnest", tagline: "Shift swaps for hourly retail teams, approved in a tap", industry: "B2B software / SaaS",
    stage: "traction", model: "Subscription (B2B)", country: "Canada", founder: "Olivia Tremblay", cofounder: "Noah Chen",
    status: "in_review", submittedDaysAgo: 6, mrr: 9800, users: 4100, seeking: 1_100_000, assignee: "maya",
    problem: "Store managers lose hours a week texting staff to cover shifts, and no-shows cost retailers sales every weekend.",
    supportEvents: [[5, "Review started"]],
  },
  // ── More applied ──
  {
    slug: "wordloom", startup: "Wordloom", tagline: "A reading tutor that listens while kids read aloud", industry: "Education",
    stage: "validation", model: "Subscription (B2C)", country: "Ireland", founder: "Aoife Byrne", cofounder: "Sean Walsh",
    status: "submitted", submittedDaysAgo: 1, mrr: 2100, users: 1200, seeking: 600_000,
    problem: "Children need someone to listen as they practise reading, and most parents don't have twenty spare minutes every evening.",
  },
  {
    slug: "haulbridge", startup: "Haulbridge", tagline: "Return loads for regional truckers, matched in minutes", industry: "Mobility & logistics",
    stage: "validation", model: "Marketplace / take rate", country: "Turkey", founder: "Elif Demir", cofounder: "Can Aksoy",
    status: "submitted", submittedDaysAgo: 3, mrr: 3400, users: 280, seeking: 700_000,
    problem: "A third of regional trucks drive home empty because finding a return load still happens through phone calls and brokers.",
  },
  {
    slug: "crumbly", startup: "Crumbly", tagline: "Surprise boxes of unsold bakery goods at closing time", industry: "Consumer",
    stage: "traction", model: "Marketplace / take rate", country: "France", founder: "Chloe Martin", cofounder: "Hugo Laurent",
    status: "submitted", submittedDaysAgo: 4, mrr: 7600, users: 15000, seeking: 900_000,
    problem: "Bakeries throw away up to a fifth of what they bake each day, while customers would happily buy it at a discount.",
  },
  {
    slug: "clausewise", startup: "Clausewise", tagline: "Contract review for freelancers, in plain language", industry: "AI & machine learning",
    stage: "mvp", model: "Subscription (B2C)", country: "Spain", founder: "Marta Gil", cofounder: "Pablo Ortega",
    status: "submitted", submittedDaysAgo: 2, mrr: 450, users: 520, seeking: 400_000,
    problem: "Freelancers sign client contracts they don't fully understand because a lawyer costs more than the project is worth.",
  },
  {
    slug: "rootcell", startup: "Rootcell", tagline: "Climate control software for small vertical farms", industry: "Climate & energy",
    stage: "mvp", model: "Subscription (B2B)", country: "Singapore", founder: "Wei Lin Tan", cofounder: "Arjun Nair",
    status: "submitted", submittedDaysAgo: 5, mrr: 1200, users: 9, seeking: 650_000,
    problem: "Small vertical farms lose crops to temperature swings because industrial control systems are priced for giant facilities.",
  },
  {
    slug: "mendmark", startup: "Mendmark", tagline: "Repair-first returns for outdoor gear brands", industry: "E-commerce & retail",
    stage: "validation", model: "Transactional / usage-based", country: "Sweden", founder: "Elin Lindqvist", cofounder: "Oskar Berg",
    status: "submitted", submittedDaysAgo: 7, mrr: 2800, users: 14, seeking: 500_000,
    problem: "Outdoor brands refund or landfill returned jackets with small faults that a local repair shop could fix for a few euros.",
  },
  {
    slug: "vetlane", startup: "Vetlane", tagline: "Video vet triage for rural pet owners", industry: "Health & biotech",
    stage: "idea", model: "Subscription (B2C)", country: "Australia", founder: "Grace Mitchell", cofounder: "Liam O'Connor",
    status: "submitted", submittedDaysAgo: 9, mrr: null, users: null, seeking: 300_000,
    problem: "Rural pet owners drive hours to a vet without knowing whether it's an emergency or something that could wait until morning.",
  },
  {
    slug: "quillary", startup: "Quillary", tagline: "Grant applications drafted in hours, not weeks", industry: "AI & machine learning",
    stage: "traction", model: "Subscription (B2B)", country: "South Africa", founder: "Thandi Nkosi", cofounder: "Ruan Botha",
    status: "submitted", submittedDaysAgo: 10, mrr: 11200, users: 380, seeking: 1_000_000,
    problem: "Small nonprofits miss funding because each grant application takes weeks of staff time they don't have.",
  },
  {
    slug: "mintleaf", startup: "Mintleaf", tagline: "", industry: "Consumer",
    stage: "idea", model: "", country: "", founder: "Jordan Lee", cofounder: "",
    status: "draft", submittedDaysAgo: null, mrr: null, users: null, seeking: null, incomplete: true,
    problem: "Houseplants die because owners guess at watering.",
  },
];

function build(s: Spec): StoredApplication {
  const created = ago((s.submittedDaysAgo ?? 3) + 4);
  const submittedAt = s.submittedDaysAgo === null ? null : ago(s.submittedDaysAgo);
  const email = `${s.founder.split(" ")[0].toLowerCase()}@${s.startup.toLowerCase()}.example`;
  const full = !s.incomplete;

  const events: StoredApplication["events"] = [
    { id: id(), at: created, by: "founder", kind: "created", title: "Application started" },
  ];
  if (submittedAt)
    events.push({ id: id(), at: submittedAt, by: "founder", kind: "submitted", title: "Application submitted for review" });
  for (const [days, title, body] of s.supportEvents ?? [])
    events.push({ id: id(), at: ago(days), by: "support", kind: "status", title, ...(body ? { body } : {}) });

  const scorecards: Scorecard[] = (s.scorecards ?? []).map(([who, [problem, solution, market, team, traction], recommendation, summary]) => ({
    reviewerId: REVIEWERS[who].id,
    reviewerName: REVIEWERS[who].name,
    scores: { problem, solution, market, team, traction },
    recommendation,
    summary,
    updatedAt: ago(Math.max((s.submittedDaysAgo ?? 1) - 1, 0)),
  }));

  return {
    userId: `demo-${s.slug}`,
    status: s.status,
    createdAt: created,
    updatedAt: events[events.length - 1].at,
    submittedAt,
    events,
    profile: {
      fullName: s.founder,
      email,
      phone: full ? "+44 20 7946 0000" : "",
      title: full ? "CEO & co-founder" : "",
      country: s.country,
      city: "",
      linkedin: full ? `https://linkedin.com/in/${s.founder.toLowerCase().replace(/\s+/g, "-")}` : "",
      bio: full ? `Previously built products in ${s.industry.toLowerCase()} for six years; started ${s.startup} after seeing the problem first-hand.` : "",
      experienceYears: full ? 6 : null,
      commitment: full ? "full-time" : "",
      heardFrom: "Fundup Club event",
    },
    startup: {
      name: s.startup,
      tagline: s.tagline,
      website: full ? `https://${s.startup.toLowerCase()}.example` : "",
      industry: s.industry,
      stage: s.stage,
      foundedOn: full ? "2025-06" : "",
      country: s.country,
      incorporated: full ? "yes" : "",
      businessModel: s.model,
      problem: s.problem,
      solution: full
        ? `${s.startup} gives them a simple product that fixes this end to end, priced for small teams and live within a day of signing up.`
        : "",
      targetCustomer: full ? "Small and mid-sized organisations in our home market first." : "",
      marketSize: full ? "Bottom-up: ~40k target customers at ~$1,500 a year." : "",
      competitors: full ? "Spreadsheets and enterprise suites that are too heavy for this segment." : "",
      advantage: full ? "Founders lived this problem for years and already have the first customers lined up." : "",
      activeUsers: s.users,
      payingCustomers: s.mrr ? Math.round(s.mrr / 150) : null,
      monthlyRevenue: s.mrr,
      growthRate: s.mrr ? 14 : null,
      keyMetric: "",
      raisedToDate: s.mrr ? 150_000 : 0,
      seeking: s.seeking,
      useOfFunds: full ? "Engineering hires and 18 months of runway." : "",
      deckUrl: full ? `https://docsend.example/${s.slug}` : "",
      demoUrl: "",
      videoUrl: "",
    },
    team: {
      members: [
        { id: id(), name: s.founder, role: "CEO & co-founder", email, linkedin: "", equity: s.cofounder ? 55 : 100, commitment: "full-time", isFounder: true },
        ...(s.cofounder
          ? [{ id: id(), name: s.cofounder, role: "CTO & co-founder", email: "", linkedin: "", equity: 45, commitment: "full-time" as const, isFounder: true }]
          : []),
      ],
      workedTogether: full ? "1–3 years" : "",
      whyUs: full ? `${s.founder.split(" ")[0]} spent years on the customer side of this problem; ${s.cofounder.split(" ")[0] || "the team"} built the technical core at a previous company.` : "",
      hiringNeeds: "",
    },
    review: {
      assigneeId: s.assignee ? REVIEWERS[s.assignee].id : null,
      assigneeName: s.assignee ? REVIEWERS[s.assignee].name : null,
      scorecards,
      notes: s.note
        ? [{ id: id(), at: ago(1), authorId: REVIEWERS[s.note[0]].id, authorName: REVIEWERS[s.note[0]].name, body: s.note[1] }]
        : [],
    },
  };
}

let all: Record<string, StoredApplication> = {};
try {
  all = JSON.parse(readFileSync(FILE, "utf8"));
} catch {
  // No store yet — start one.
}

for (const key of Object.keys(all)) if (key.startsWith("demo-")) delete all[key];
const reset = process.argv.includes("--reset");
if (!reset) for (const spec of SPECS) all[`demo-${spec.slug}`] = build(spec);

mkdirSync(path.dirname(FILE), { recursive: true });
writeFileSync(`${FILE}.tmp`, JSON.stringify(all, null, 2));
renameSync(`${FILE}.tmp`, FILE);

console.log(
  reset
    ? "Removed the sample applications."
    : `Seeded ${SPECS.length} sample applications (${Object.keys(all).length} in the store). Open /admin to review them.`,
);
