/* The landing page: hero, numbers strip, program stages, alumni stories,
   call-to-action bands and the admissions FAQ. Some pieces are shared with
   other pages (the stages with /about and /demo-day, the testimonials with
   /demo-day, the closing "unicorn" band with /about and /startups). */
const landing = {
  hero: {
    eyebrow: "Where founders find their next",
    titleLine1: "Built to launch.",
    titleLine2: "Made to connect.",
    lede: "A home for bold startups and the people building them.",
    exploreStartups: "Explore startups",
    joinClub: "Join the club",
    /** {founders} and {firms} are shown in bold. */
    proof: "{founders} trained · {firms} investment firms",
    proofFounders: "25,000+ founders",
    proofFirms: "180+",
  },
  founders: {
    label: "Featured founders",
    title: "Meet our portfolio",
    titleAccent: "founders & startups.",
    tag: "Talented founders. Innovative ideas. Real impact.",
    empty: "The first founders are applying now. Yours could be the first card here.",
    allStartups: "All startups",
    /** A founder who hasn't given their role yet. */
    founder: "Founder",
  },
  /** Short industry names on the founder and pitch cards. */
  sectors: {
    ai: "AI",
    saas: "SaaS",
    climate: "CleanTech",
    consumer: "Consumer",
    deepTech: "Deep tech",
    retail: "Retail",
    education: "EdTech",
    fintech: "Fintech",
    health: "HealthTech",
    marketplaces: "Marketplaces",
    logistics: "Logistics",
    other: "Other",
  },
  demoDay: {
    eyebrow: "Demo Day",
    title: "Tomorrow’s big ideas.",
    titleAccent: "Live on stage.",
    lede: "Meet emerging founders. Watch the pitches. Find your next opportunity.",
    explore: "Explore Demo Day",
    nextEdition: "Next edition · {date}",
    dateSoon: "Next edition · Date soon",
    online: "Online",
    liveIn: "Live in {city}",
    newsletter: "Get the date first in the newsletter",
  },
  stats: {
    label: "Fundup Club in numbers",
    startups: "Startups Built",
    mentors: "Mentors & Investors",
    founders: "Founders Trained",
    exits: "Company Exits",
    emerging: "Founders from Emerging Markets",
  },
  program: {
    eyebrow: "The program",
    title: "One founder journey",
    lead: "From first idea to post-program scale: the path every founder takes with us, one milestone at a time.",
    learnMore: "Learn more",
    learnMoreAbout: "Learn more about {title}",
  },
  stages: {
    discover: {
      eyebrow: "Discovery",
      title: "Discover",
      body: "Validate the problem & founder-market fit.",
      weeks: "Weeks 1–2",
      focus: "Talk to 20 customers and write down the problem worth solving.",
    },
    build: {
      eyebrow: "Build",
      title: "Build MVP",
      body: "Define value prop, ship lean product.",
      weeks: "Weeks 2–4",
      focus: "Ship the smallest product that delivers the value proposition.",
    },
    validate: {
      eyebrow: "Validation",
      title: "Validate",
      body: "Get real users, test & iterate on KPIs.",
      weeks: "Weeks 4–6",
      focus: "Put it in front of real users and iterate on three KPIs.",
    },
    traction: {
      eyebrow: "Traction",
      title: "Get Traction",
      body: "First revenue/paying customers, growth experiments.",
      weeks: "Weeks 6–8",
      focus: "Land the first paying customers and run growth experiments.",
    },
    demoDay: {
      eyebrow: "Demo Day",
      title: "Demo Day/ Fundraise",
      body: "Pitch-ready deck + investor matching.",
      weeks: "Weeks 9–10",
      focus: "Pitch coaching, deck, data room and investor matching.",
    },
    scale: {
      eyebrow: "Scale",
      title: "Scale",
      body: "Hire, systematize ops, post-program mentorship.",
      weeks: "After Demo Day",
      focus: "Close the round, hire, systematize operations.",
    },
  },
  cta: {
    title: "There’s no better time than the present.",
    lede: "Apply to the Silicon Valley Fall 2026 program today.",
    apply: "Apply now",
    event: "Join a free event",
  },
  results: {
    eyebrow: "Alumni stories",
    titleLine1: "From idea",
    titleLine2: "to funded,",
    titleAccent: "in their words",
    lead: "Founders from 65+ markets and our 2026 AI cohorts on what the program changed.",
    viewMore: "View more alumni",
    companies: "Alumni companies",
    outcomes: "Outcomes",
    countries: {
      fr: "France",
      ng: "Nigeria",
      id: "Indonesia",
      br: "Brazil",
    },
  },
  /* PLACEHOLDER CONTENT — the people and quotes are fictional (see results/data.ts). */
  testimonials: {
    northvale: {
      quote:
        "Northvale started as a spreadsheet. Fundup Club gave me the structure and the deadlines to turn it into a shipped MVP.",
      role: "Founder, Northvale",
      cohort: "",
      outcomes: [] as string[],
    },
    kitebase: {
      quote: "Without Fundup Club, Kitebase would never have closed a single round.",
      role: "Founder, Kitebase",
      cohort: "",
      outcomes: [] as string[],
    },
    ledgerly: {
      quote:
        "Every Thursday someone asked for my deck, my data room or my model. By Demo Day it all existed, because I had no choice. That forcing function changed everything.",
      role: "Founder, Ledgerly",
      cohort: "Silicon Valley AI Cohort 2026",
      outcomes: ["First term sheet 2 weeks after Demo Day", "Delaware inc. Aug 2026"],
    },
    tidewell: {
      quote:
        "Joining Fundup Club was the defining chapter of my founder journey. The pace, the pressure and, above all, the mentorship reshaped the way I think, the way I build and the way I lead the Tidewell team today.",
      role: "Founder, Tidewell",
      cohort: "",
      outcomes: [] as string[],
    },
    restly: {
      quote:
        "The program was demanding, but it prepared me for life as a founder. Mentors, local operators and partners across the network helped us close our first round.",
      role: "Founder, Restly",
      cohort: "",
      outcomes: [] as string[],
    },
    relaywave: {
      quote:
        "Before the program I used AI to draft emails. Ten weeks later I had an agent-run marketing team, 1,500 synthetic customers and a voice agent. I'd never written Python.",
      role: "Founder and CEO, Relaywave",
      cohort: "Silicon Valley AI Cohort 2026",
      outcomes: ["AI marketing team built", "1,500 synthetic customers"],
    },
  },
  join: {
    open: "Applications open",
    cohort: "Silicon Valley Fall 2026",
    titleLine1: "Stop Planning.",
    titleLine2: "Start Building.",
    body: "Join thousands of founders who turned their ideas into funded startups. AI rewrote the rules, you bring the vision, we bring everything else.",
    apply: "Apply now",
    event: "Attend a free event",
    photoAlt:
      "The Fundup Club team: ten people in suits, three seated in front and seven standing behind them",
  },
  /* PLACEHOLDER ANSWERS — confirm fees, equity and agreement terms before launch. */
  faq: {
    title: "Frequently Asked {accent}",
    titleAccent: "Questions",
    items: [
      {
        q: "Which program should I apply to?",
        a: "Most founders apply to the Silicon Valley Fall 2026 cohort. If you're still exploring an idea, join a free event first; if you already have revenue, say so in your application and we'll point you to the right track.",
      },
      {
        q: "How much does it cost?",
        a: "Applying is free. Program fees and any available scholarships are shared with admitted founders before they commit to anything.",
      },
      {
        q: "Is there an equity component?",
        a: "The terms for each cohort are set out in the program agreement. You'll see every term before joining, and nothing is signed at the application stage.",
      },
      {
        q: "Where can I see the agreements?",
        a: "Program agreements are available on request and are sent to every admitted founder ahead of onboarding, so you can review them with your co-founders or advisors.",
      },
      {
        q: "Can I talk to someone about the program?",
        a: "Yes. Book a call with the admissions team, or come to a free event to meet mentors and alumni in person.",
      },
    ],
    ask: "Still have a question? Ask the team",
  },
  unicorn: {
    capital: "$420B+ capital represented",
    firms: "180+ investment firms",
    title: "Turn your idea into the next unicorn",
    body: "Founders from 65+ markets have used the program to build, launch and fund their companies. Yours could be next.",
    apply: "Apply now",
  },
};

export default landing;
