/* The Demo Day page (/demo-day) and its program roadmap. The next Demo Day
   itself (title, agenda) comes from the API. "{name}" placeholders are filled
   with format() or rich(); "\n" in a heading is a line break. */
const demoDay = {
  metaTitle: "Demo Day — Fundup Club",
  metaDescription:
    "Ten weeks of building, one afternoon on stage. How Demo Day works, where it sits in the six-stage program, and what founders walk away with.",
  hero: {
    eyebrow: "Stage {stage} of {total} · {weeks}",
    heading: "Demo {accent}",
    headingAccent: "Day",
    lead: "Ten weeks of building, one afternoon on stage. Twenty founders pitch to investors from 180+ firms, then meet the ones who want to go deeper, one to one.",
    reserve: "Reserve a seat",
    apply: "Apply to pitch",
    roadmap: "See the roadmap",
    next: "Next Demo Day",
    details: "Event details and registration",
    soon: "Next date coming soon",
    scheduling: "The next Demo Day is being scheduled.",
    newsletterFirst: "New dates land in the newsletter first.",
    subscribe: "Subscribe",
  },
  /** Format facts, not outcomes. PLACEHOLDER network figures match the landing page. */
  format: [
    { value: "20", label: "Startups on stage" },
    { value: "5 min", label: "Per pitch, then questions" },
    { value: "180+", label: "Firms in the network" },
    { value: "1:1", label: "Investor meetings after" },
  ],
  roadmap: {
    eyebrow: "The program roadmap",
    heading: "Six stages. One that\n{accent}",
    headingAccent: "changes everything.",
    lead: "Ten weeks from the first customer conversation to the stage. Demo Day is stage five: where the work of the first eight weeks meets the people who fund it. Everything before it builds toward it, and everything after it builds on it.",
    inProgram: "In the ten-week program",
    afterProgram: "After the program",
    allStages: "All six stages in detail",
    milestone: "The milestone",
    focus: "Focus: ",
    howItWorks: "How it works",
  },
  what: {
    eyebrow: "What it is",
    heading: "The afternoon the\n{accent}",
    headingAccent: "program is built around",
    lead1:
      "Demo Day closes every cohort. Each founder takes the stage for a five-minute pitch in front of investors from our network, then meets the ones who want to go deeper, one to one.",
    lead2: "It isn’t a competition and there is no prize. The pitch is the door; the meetings after it are the point.",
    walkInTitle: "What every founder walks in with",
    walkIn: [
      "A pitch-ready deck, rehearsed in two mock Demo Days",
      "A data room: cap table, monthly metrics, 18-month model",
      "A shortlist of matched investors in the room",
      "Three customers who will take a reference call",
    ],
    photoAlt: "Four founders gathered around a laptop, smiling",
    photoCaption: "Founders and mentors, working side by side.",
    badgeValue: "180+",
    badgeLabel: "Firms in the network",
  },
  how: {
    eyebrow: "How it works",
    heading: "Before, on the day, {accent}",
    headingAccent: "after",
    runUpLabel: "{weeks} · The run-up",
    runUpTitle: "Two weeks of pitch prep",
    runUp: [
      "Pitch coaching twice a week with program mentors",
      "Deck and narrative reviews until the story is one sentence",
      "Two mock Demo Days in front of investor panels",
      "Data room check: what investors will ask for, ready before they ask",
      "Investor matching by sector, stage and geography",
    ],
    dayLabel: "The day",
    dayTitle: "How {date} runs",
    dayTitleGeneric: "How the afternoon runs",
    /** Shown when the next Demo Day has no agenda yet (or none is scheduled). */
    agenda: [
      { time: "4:00 PM", item: "Doors open and check-in" },
      { time: "4:30 PM", item: "Welcome from the program team" },
      { time: "4:45 PM", item: "Founder pitches" },
      { time: "7:15 PM", item: "Reception and investor meetings" },
    ],
    afterLabel: "After · Fundraise and Scale",
    afterTitle: "Where the round happens",
    after: [
      "Investors mark the founders they want to meet",
      "Introductions go out within 48 hours",
      "Follow-up meetings in the two weeks after",
      "Post-program mentorship through the Scale stage",
    ],
  },
  pitch: {
    eyebrow: "The pitch",
    heading: "Five minutes, {accent}",
    headingAccent: "five beats",
    lead: "The structure every founder is coached on. Investors hear twenty pitches in an afternoon; the ones they remember answer these five questions in this order.",
    /** The bar's accessible name: each beat, joined with `join`. */
    beatLabel: "{beat}: {secs} seconds",
    join: ", ",
    /** On the bar itself. */
    secsShort: "{secs}s",
    /** Above each beat: its number and length. */
    beatHead: "{n} · {length}",
    secs: "{n} sec",
    mins: "{n} min",
    /** The structure every founder is coached on: five beats in five minutes. */
    beats: [
      { beat: "Problem", note: "Who has it, and what it costs them today" },
      { beat: "Product", note: "What you shipped and how it solves it" },
      { beat: "Traction", note: "Users, revenue and what is growing" },
      { beat: "Team", note: "Why you are the ones to build this" },
      { beat: "The ask", note: "How much, and what it buys" },
    ],
  },
  numbers: {
    eyebrow: "The room",
    heading: "Who’s on the other side of the stage",
    lead: "The network founders pitch into, and the track record behind it. Figures across the program to date.",
    items: [
      { value: "$420B+", label: "Capital represented" },
      { value: "180+", label: "Investment firms" },
      { value: "65+", label: "Markets" },
      { value: "1,200+", label: "Startups built" },
      { value: "120+", label: "Company exits" },
      { value: "30%", label: "Founders from emerging markets" },
    ],
  },
  stories: {
    eyebrow: "After the stage",
    heading: "From Demo Day {accent}",
    headingAccent: "to funded",
    onStage: "Founders who have taken the stage",
    portfolio: "Meet the portfolio",
  },
  ways: {
    heading: "Two ways to be at Demo Day",
    audienceLabel: "In the audience",
    audienceTitle: "Come and watch",
    audienceLead: "{title} is on {date}. Seats are free but limited.",
    audienceLeadNone: "The next Demo Day is being scheduled. Follow the events page to hear first.",
    reserve: "Reserve a seat",
    allEvents: "See all events",
    stageLabel: "On the stage",
    stageTitle: "Pitch at the next one",
    stageLead: "Applications for Silicon Valley Fall 2026 are open. Ten weeks later, it’s your five minutes.",
    apply: "Apply now",
  },
  faq: {
    heading: "Demo Day {accent}",
    headingAccent: "questions",
    /** PLACEHOLDER ANSWERS — confirm attendance rules and streaming before launch. */
    items: [
      {
        q: "Who can attend Demo Day?",
        a: "Investors, founders, mentors and anyone considering the program. Seats are free but limited, so register on the event page.",
      },
      {
        q: "Do I have to be in the program to pitch?",
        a: "Yes. Founders pitch at the Demo Day that closes their cohort. If you want to be on stage, apply to the next cohort.",
      },
      {
        q: "How long is a pitch?",
        a: "Five minutes, followed by questions from the room. The coaching in weeks 9–10 is built around exactly that format.",
      },
      {
        q: "What happens after the pitches?",
        a: "Investors mark the founders they want to meet. Introductions go out within 48 hours, and one-to-one meetings follow in the two weeks after.",
      },
      {
        q: "Is there a prize?",
        a: "No. Demo Day isn't a competition; it's an introduction. The pitch opens the door, and the meetings after it are the point.",
      },
    ],
    more: "Something else? {link}",
    ask: "Ask the team",
  },
};

export default demoDay;
