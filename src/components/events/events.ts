/* PLACEHOLDER events — written to show the layout. Replace with the real
   calendar (or load it from a CMS) before launch. Venues are deliberately
   left as "shared with registered guests". */

export const EVENT_TYPES = [
  "Demo Day",
  "Workshop",
  "Office Hours",
  "Networking",
  "Info Session",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export type SummitEvent = {
  slug: string;
  title: string;
  type: EventType;
  format: "In person" | "Online";
  /** City for in-person events; "Online" otherwise. */
  city: string;
  /** Start and end with the local offset, e.g. 2026-10-22T17:00:00-07:00 */
  start: string;
  end: string;
  /** IANA zone the times are shown in. */
  tz: string;
  capacity: number;
  summary: string;
  about: string[];
  takeaways: string[];
  agenda: { time: string; item: string }[];
  audience: string;
};

export const EVENTS: SummitEvent[] = [
  {
    slug: "demo-day-summer-2026",
    title: "Demo Day: Summer 2026 Cohort",
    type: "Demo Day",
    format: "In person",
    city: "San Francisco",
    start: "2026-10-22T16:00:00-07:00",
    end: "2026-10-22T20:00:00-07:00",
    tz: "America/Los_Angeles",
    capacity: 400,
    summary:
      "Twenty founders pitch to investors from our network of 180+ firms, followed by an evening of open conversations.",
    about: [
      "Demo Day is the final stage of the program. Every company in the Summer 2026 cohort takes the stage for a short pitch, then meets investors one to one.",
      "Founders thinking about applying are welcome: it is the best way to see what ten weeks in the program produces.",
    ],
    takeaways: [
      "Twenty live pitches across fintech, AI, health and climate",
      "Investor matching for the presenting founders",
      "Open networking with mentors, alumni and partners",
    ],
    agenda: [
      { time: "4:00 PM", item: "Doors open and check-in" },
      { time: "4:30 PM", item: "Welcome from the program team" },
      { time: "4:45 PM", item: "Founder pitches, part one" },
      { time: "6:00 PM", item: "Break" },
      { time: "6:15 PM", item: "Founder pitches, part two" },
      { time: "7:15 PM", item: "Reception and investor meetings" },
    ],
    audience:
      "Investors, founders, mentors and anyone considering the program.",
  },
  {
    slug: "info-session-fall-2026",
    title: "Info Session: Silicon Valley Fall 2026",
    type: "Info Session",
    format: "Online",
    city: "Online",
    start: "2026-10-01T09:00:00-07:00",
    end: "2026-10-01T10:00:00-07:00",
    tz: "America/Los_Angeles",
    capacity: 500,
    summary:
      "Everything about the Fall 2026 cohort in one hour: how it works, who it is for, and a live Q&A with the admissions team.",
    about: [
      "A walkthrough of the six stages of the program, how applications are reviewed and what happens after you are accepted.",
      "Bring your questions: half of the hour is live Q&A.",
    ],
    takeaways: [
      "How the application is reviewed",
      "Program costs, scholarships and agreements explained",
      "Live answers from the admissions team",
    ],
    agenda: [
      { time: "9:00 AM", item: "How the program works" },
      { time: "9:25 AM", item: "The application, step by step" },
      { time: "9:30 AM", item: "Live Q&A" },
    ],
    audience: "Founders considering the Fall 2026 cohort.",
  },
  {
    slug: "office-hours-fundraising",
    title: "Founder Office Hours: Fundraising",
    type: "Office Hours",
    format: "Online",
    city: "Online",
    start: "2026-10-06T08:00:00-07:00",
    end: "2026-10-06T09:30:00-07:00",
    tz: "America/Los_Angeles",
    capacity: 60,
    summary:
      "Small-group sessions with investors from our network. Bring your deck, your model or the question keeping you up at night.",
    about: [
      "Founders are split into groups of six, each with an investor from the VC Summit network. Every founder gets focused time on their own questions.",
    ],
    takeaways: [
      "Direct feedback on your deck or model",
      "How investors read your first email",
      "A clear next step for your raise",
    ],
    agenda: [
      { time: "8:00 AM", item: "Welcome and group assignments" },
      { time: "8:10 AM", item: "Small-group sessions" },
      { time: "9:15 AM", item: "Wrap-up" },
    ],
    audience:
      "Pre-seed and seed founders planning a raise in the next six months.",
  },
  {
    slug: "workshop-ai-operating-stack",
    title: "Workshop: Build Your AI Operating Stack",
    type: "Workshop",
    format: "Online",
    city: "Online",
    start: "2026-10-08T10:00:00-07:00",
    end: "2026-10-08T12:00:00-07:00",
    tz: "America/Los_Angeles",
    capacity: 150,
    summary:
      "A hands-on session on running research, marketing and support with agents, taught by founders from our AI cohort.",
    about: [
      "You will leave with a working setup: a research workflow, a drafting assistant for marketing and a weekly report, all reviewed by a human before anything goes out.",
      "No coding experience needed.",
    ],
    takeaways: [
      "A starter stack you can use the same day",
      "Where agents help and where they should not be used",
      "Templates shared after the session",
    ],
    agenda: [
      { time: "10:00 AM", item: "What an AI operating stack looks like" },
      { time: "10:20 AM", item: "Build: research workflow" },
      { time: "11:00 AM", item: "Build: marketing drafts with human review" },
      { time: "11:40 AM", item: "Q&A" },
    ],
    audience: "Early-stage founders and small teams.",
  },
  {
    slug: "pitch-night-istanbul",
    title: "Pitch Night Istanbul",
    type: "Networking",
    format: "In person",
    city: "Istanbul",
    start: "2026-10-15T19:00:00+03:00",
    end: "2026-10-15T22:00:00+03:00",
    tz: "Europe/Istanbul",
    capacity: 120,
    summary:
      "Five local startups pitch, then the floor opens for founders, mentors and investors from the region.",
    about: [
      "An evening for the Istanbul founder community. Five startups pitch for five minutes each and get live feedback from a panel of investors.",
    ],
    takeaways: [
      "Five live pitches with panel feedback",
      "Meet founders and investors in the region",
      "Hear about the program from alumni",
    ],
    agenda: [
      { time: "7:00 PM", item: "Doors open" },
      { time: "7:30 PM", item: "Pitches and panel feedback" },
      { time: "8:30 PM", item: "Networking" },
    ],
    audience: "Founders, operators and investors in Istanbul.",
  },
  {
    slug: "investor-breakfast-london",
    title: "Investor Breakfast London",
    type: "Networking",
    format: "In person",
    city: "London",
    start: "2026-11-05T08:00:00+00:00",
    end: "2026-11-05T10:00:00+00:00",
    tz: "Europe/London",
    capacity: 40,
    summary:
      "An informal breakfast for founders raising in the next quarter to meet investors from the VC Summit network.",
    about: [
      "A small, seated breakfast. Founders are placed at tables with investors whose focus matches their stage and sector.",
    ],
    takeaways: [
      "Warm introductions to relevant investors",
      "Honest feedback on your raise",
      "A small room, so real conversations",
    ],
    agenda: [
      { time: "8:00 AM", item: "Arrivals and coffee" },
      { time: "8:20 AM", item: "Table conversations" },
      { time: "9:30 AM", item: "Open networking" },
    ],
    audience:
      "Founders raising a pre-seed or seed round in the next three months.",
  },
  {
    slug: "lagos-founder-meetup",
    title: "Lagos Founder Meetup",
    type: "Networking",
    format: "In person",
    city: "Lagos",
    start: "2026-11-12T18:00:00+01:00",
    end: "2026-11-12T21:00:00+01:00",
    tz: "Africa/Lagos",
    capacity: 150,
    summary:
      "Meet alumni, mentors and fellow founders, with a fireside chat on building for global markets from day one.",
    about: [
      "A relaxed evening with a short fireside chat with program alumni, followed by open networking.",
    ],
    takeaways: [
      "Fireside chat with program alumni",
      "Meet mentors from the VC Summit network",
      "Learn how the application works",
    ],
    agenda: [
      { time: "6:00 PM", item: "Doors open" },
      { time: "6:45 PM", item: "Fireside chat" },
      { time: "7:30 PM", item: "Networking" },
    ],
    audience: "Founders and operators in Lagos.",
  },
  {
    slug: "validation-sprint-workshop",
    title: "Workshop: The Validation Sprint",
    type: "Workshop",
    format: "Online",
    city: "Online",
    start: "2026-09-10T09:00:00-07:00",
    end: "2026-09-10T11:00:00-07:00",
    tz: "America/Los_Angeles",
    capacity: 200,
    summary:
      "Five questions to answer before you build, and how to test them with real customers in a week.",
    about: [
      "A practical session on the Discover stage: finding the people with the problem, running the first conversations and writing down what you learn.",
    ],
    takeaways: [
      "The five validation questions",
      "A script for your first customer calls",
      "How to decide what to build first",
    ],
    agenda: [
      { time: "9:00 AM", item: "The five questions" },
      { time: "9:40 AM", item: "Running customer conversations" },
      { time: "10:30 AM", item: "Q&A" },
    ],
    audience: "Founders at the idea stage.",
  },
  {
    slug: "singapore-founder-meetup",
    title: "Singapore Founder Meetup",
    type: "Networking",
    format: "In person",
    city: "Singapore",
    start: "2026-08-27T18:30:00+08:00",
    end: "2026-08-27T21:00:00+08:00",
    tz: "Asia/Singapore",
    capacity: 120,
    summary:
      "An evening with founders, mentors and alumni from across Southeast Asia.",
    about: ["Short talks from alumni, then open networking."],
    takeaways: ["Talks from program alumni", "Meet mentors from the region"],
    agenda: [
      { time: "6:30 PM", item: "Doors open" },
      { time: "7:00 PM", item: "Alumni talks" },
      { time: "7:45 PM", item: "Networking" },
    ],
    audience: "Founders and operators in Southeast Asia.",
  },
  {
    slug: "demo-day-spring-2026",
    title: "Demo Day: Spring 2026 Cohort",
    type: "Demo Day",
    format: "In person",
    city: "San Francisco",
    start: "2026-06-18T16:00:00-07:00",
    end: "2026-06-18T20:00:00-07:00",
    tz: "America/Los_Angeles",
    capacity: 400,
    summary: "The Spring 2026 cohort pitched to investors from our network.",
    about: ["The final day of the Spring 2026 program."],
    takeaways: ["Founder pitches", "Investor matching", "Evening reception"],
    agenda: [
      { time: "4:00 PM", item: "Doors open" },
      { time: "4:30 PM", item: "Founder pitches" },
      { time: "7:00 PM", item: "Reception" },
    ],
    audience: "Investors, founders and mentors.",
  },
];

export function isPast(e: SummitEvent, now = Date.now()) {
  return new Date(e.end).getTime() < now;
}

export function upcomingEvents(now = Date.now()) {
  return EVENTS.filter((e) => !isPast(e, now)).sort(
    (a, b) => +new Date(a.start) - +new Date(b.start),
  );
}

export function pastEvents(now = Date.now()) {
  return EVENTS.filter((e) => isPast(e, now)).sort(
    (a, b) => +new Date(b.start) - +new Date(a.start),
  );
}

export function findEvent(slug: string) {
  return EVENTS.find((e) => e.slug === slug);
}

/** Date parts in the event's own time zone. */
export function eventDate(e: SummitEvent) {
  const d = new Date(e.start);
  const part = (o: Intl.DateTimeFormatOptions) =>
    d.toLocaleString("en-US", { ...o, timeZone: e.tz });
  const time = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: e.tz,
    });
  const zone = d
    .toLocaleString("en-US", { timeZone: e.tz, timeZoneName: "short" })
    .split(" ")
    .pop();
  return {
    day: part({ day: "numeric" }),
    month: part({ month: "short" }),
    weekday: part({ weekday: "short" }),
    long: part({
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    time: `${time(e.start)} – ${time(e.end)} ${zone}`,
  };
}

/** Prefilled "add to Google Calendar" link. */
export function googleCalendarUrl(e: SummitEvent) {
  const stamp = (iso: string) =>
    new Date(iso)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${stamp(e.start)}/${stamp(e.end)}`,
    details: e.summary,
    location: e.format === "Online" ? "Online (link sent by email)" : e.city,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
