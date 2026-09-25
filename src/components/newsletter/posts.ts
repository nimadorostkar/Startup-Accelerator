/* PLACEHOLDER articles — written to show the layout. Replace with real
   issues (or load them from a CMS) before launch. Newest first. */

export const CATEGORIES = [
  "Fundraising",
  "Building",
  "AI",
  "Founder Stories",
  "Program News",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "list"; items: string[] };

export type Post = {
  slug: string;
  issue: number;
  title: string;
  excerpt: string;
  category: Category;
  author: string;
  /** ISO date */
  date: string;
  minutes: number;
  body: Block[];
};

export const POSTS: Post[] = [
  {
    slug: "the-first-term-sheet-playbook",
    issue: 24,
    title:
      "The first term sheet playbook: what investors read before your deck",
    excerpt:
      "Most rounds are decided before the pitch. Here is the data room, the model and the one-page memo that got our last cohort to term sheets.",
    category: "Fundraising",
    author: "VC Summit Program Team",
    date: "2026-09-17",
    minutes: 7,
    body: [
      {
        type: "p",
        text: "By the time an investor opens your deck, they have usually already formed a view. They have seen your traction chart in a forwarded email, skimmed your LinkedIn and asked someone in their network what they think. The pitch confirms or breaks that view. It rarely creates it.",
      },
      { type: "h2", text: "Start with a one-page memo" },
      {
        type: "p",
        text: "A memo forces clarity. Write the problem, who has it, what you have shipped, what is working, and what the money buys, in that order. If a partner can forward it to their team without adding context, it is doing its job.",
      },
      { type: "h2", text: "Have the data room ready before the first call" },
      {
        type: "list",
        items: [
          "A cap table that matches your incorporation documents",
          "Monthly metrics for as far back as you have them, raw and charted",
          "A simple 18-month model with the assumptions written out",
          "Customer references who have agreed to take a call",
        ],
      },
      {
        type: "quote",
        text: "Every Thursday someone asked for my deck, my data room or my model. By Demo Day it all existed, because I had no choice.",
        cite: "Maya Rosen, Founder, Ledgerly",
      },
      { type: "h2", text: "Run the process like a sprint" },
      {
        type: "p",
        text: "Batch your first meetings into two weeks. Momentum is a signal investors read, and spacing meetings out over months hands it away. Keep a simple tracker of every conversation, the next step and who owns it.",
      },
    ],
  },
  {
    slug: "agents-as-your-first-hires",
    issue: 23,
    title:
      "Agents as your first hires: an AI operating stack for two-person teams",
    excerpt:
      "From synthetic customer interviews to a voice agent that books demos, this is the stack our AI cohort used to do the work of a team of ten.",
    category: "AI",
    author: "VC Summit AI Cohort",
    date: "2026-09-03",
    minutes: 6,
    body: [
      {
        type: "p",
        text: "The most striking change in our 2026 AI cohort was not the products. It was how small the teams stayed. Founders who would once have hired for marketing, research and support ran those functions with agents and spent their own time on product and customers.",
      },
      { type: "h2", text: "Research: synthetic customers, real follow-ups" },
      {
        type: "p",
        text: "Synthetic customer panels are fast for sharpening questions and finding obvious objections. They are not a substitute for real conversations. Use them to prepare, then go and talk to people.",
      },
      { type: "h2", text: "Marketing: one founder, many channels" },
      {
        type: "list",
        items: [
          "A writing agent that drafts from your own call notes, not a blank page",
          "A review step where a human approves every public post",
          "Weekly reporting pulled into one sheet you actually read",
        ],
      },
      {
        type: "quote",
        text: "Ten weeks later I had an agent-run marketing team, 1,500 synthetic customers and a voice agent. I'd never written Python.",
        cite: "Marcus Hale, Founder and CEO, Relaywave",
      },
      { type: "h2", text: "Know what not to automate" },
      {
        type: "p",
        text: "Your first twenty customer conversations, your investor updates and your hiring decisions should stay human. Those are where you learn the most, and where trust is built.",
      },
    ],
  },
  {
    slug: "from-spreadsheet-to-shipped-mvp",
    issue: 22,
    title: "From spreadsheet to shipped MVP in ten weeks",
    excerpt:
      "Northvale started as a spreadsheet shared with twelve users. The founder on scoping ruthlessly, weekly deadlines and what she cut.",
    category: "Founder Stories",
    author: "VC Summit Editorial",
    date: "2026-08-20",
    minutes: 5,
    body: [
      {
        type: "p",
        text: "Léa Marchand did not start with a product. She started with a spreadsheet that twelve people used every week, and a hunch that it could be more. Ten weeks later, Northvale had a shipped MVP and its first paying customers.",
      },
      { type: "h2", text: "The spreadsheet was the prototype" },
      {
        type: "p",
        text: "Before writing code, Léa watched how her twelve users bent the spreadsheet to fit their work. The formulas they added themselves became the first feature list. Everything else waited.",
      },
      {
        type: "quote",
        text: "VC Summit gave me the structure and the deadlines to turn it into a shipped MVP.",
        cite: "Léa Marchand, Founder, Northvale",
      },
      { type: "h2", text: "What she cut" },
      {
        type: "list",
        items: [
          "User accounts beyond a simple email link",
          "A settings page (defaults worked for everyone)",
          "Integrations nobody had asked for yet",
        ],
      },
      {
        type: "p",
        text: "The lesson she shares with every new cohort: a deadline you cannot move is the best scoping tool there is.",
      },
    ],
  },
  {
    slug: "validation-before-velocity",
    issue: 21,
    title: "Validation before velocity: five questions to ask before you build",
    excerpt:
      "Speed only helps if you are running in the right direction. The five questions we ask every founder in the Discover stage.",
    category: "Building",
    author: "VC Summit Program Team",
    date: "2026-08-06",
    minutes: 4,
    body: [
      {
        type: "p",
        text: "The Discover stage is the shortest part of the program and the one founders most want to skip. It is also where the most expensive mistakes are avoided.",
      },
      { type: "h2", text: "The five questions" },
      {
        type: "list",
        items: [
          "Who has this problem badly enough to pay to solve it today?",
          "What do they use instead, and what does it cost them?",
          "Why are you the right person to solve it?",
          "What would have to be true for this to be a large company?",
          "What is the smallest thing you could ship to test that?",
        ],
      },
      { type: "h2", text: "Write the answers down" },
      {
        type: "p",
        text: "Answers in your head change to fit your mood. Answers on paper can be checked against what customers actually say. Revisit them after every ten conversations.",
      },
    ],
  },
  {
    slug: "fall-2026-cohort-applications-open",
    issue: 20,
    title: "Applications for Silicon Valley Fall 2026 are open",
    excerpt:
      "Everything you need to know about the new cohort: who it is for, how the application works and what happens after you submit.",
    category: "Program News",
    author: "VC Summit Admissions",
    date: "2026-07-23",
    minutes: 3,
    body: [
      {
        type: "p",
        text: "Applications for the Silicon Valley Fall 2026 cohort are now open. Applying is free, and nothing is signed at the application stage.",
      },
      { type: "h2", text: "How the application works" },
      {
        type: "list",
        items: [
          "Create an account and fill in three short sections: you, your startup and your team",
          "Save as you go and come back any time before you submit",
          "After you submit, our team reviews your application and replies in your dashboard",
        ],
      },
      { type: "h2", text: "Not sure it is the right fit?" },
      {
        type: "p",
        text: "If you are still exploring an idea, join a free event first. If you already have revenue, say so in your application and we will point you to the right track.",
      },
    ],
  },
  {
    slug: "how-kitebase-closed-its-first-round",
    issue: 19,
    title: "How Kitebase closed its first round",
    excerpt:
      "Tunde Adeyemi on investor matching, the objection that nearly ended the round, and what he would do differently.",
    category: "Founder Stories",
    author: "VC Summit Editorial",
    date: "2026-07-09",
    minutes: 5,
    body: [
      {
        type: "p",
        text: "Kitebase went into Demo Day with a working product, a handful of paying customers and no investor relationships. Six weeks later the round was closed.",
      },
      {
        type: "quote",
        text: "Without VC Summit, Kitebase would never have closed a single round.",
        cite: "Tunde Adeyemi, Founder, Kitebase",
      },
      { type: "h2", text: "The objection" },
      {
        type: "p",
        text: "Nearly every investor asked the same question: why would customers switch from what they already use? Tunde stopped answering it in the meeting and started answering it in the deck, with three customer stories on a single slide.",
      },
      { type: "h2", text: "What he would do differently" },
      {
        type: "p",
        text: "Start investor conversations earlier, long before asking for money. The investors who led the round were the ones who had watched Kitebase improve month after month.",
      },
    ],
  },
  {
    slug: "pricing-your-first-product",
    issue: 18,
    title: "Pricing your first product without a pricing team",
    excerpt:
      "Charge earlier than feels comfortable. A simple framework for setting, testing and raising your first prices.",
    category: "Building",
    author: "VC Summit Program Team",
    date: "2026-06-25",
    minutes: 4,
    body: [
      {
        type: "p",
        text: "Most first-time founders underprice. They worry that a high price will scare customers away, when the real risk is learning nothing because nobody has had to make a decision.",
      },
      { type: "h2", text: "A simple starting point" },
      {
        type: "list",
        items: [
          "Estimate what the problem costs your customer each month",
          "Start at a fraction of that, then round up rather than down",
          "Offer one plan, not three, until you know who buys",
        ],
      },
      { type: "h2", text: "Raise prices on purpose" },
      {
        type: "p",
        text: "Raise prices for new customers every few months until you hear real pushback. Keep early customers on their original price; they took a risk on you.",
      },
    ],
  },
];

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
