/**
 * Alumni testimonials for the "From idea to funded" section.
 *
 * PLACEHOLDER CONTENT — names, companies and quotes are fictional.
 * Replace with real, consented alumni testimonials before launch.
 * To use a headshot instead of initials, set `photo` to an image in /public.
 */

export type CountryCode = "fr" | "ng" | "id" | "br";

export type BrandId = "northvale" | "kitebase" | "tidewell" | "restly";

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  photo?: string;
  country?: CountryCode;
  brand?: BrandId;
  cohort?: string;
  outcomes?: string[];
};

export const LEFT: Testimonial[] = [
  {
    quote:
      "Northvale started as a spreadsheet. VC Summit gave me the structure and the deadlines to turn it into a shipped MVP.",
    name: "Léa Marchand",
    role: "Founder, Northvale",
    country: "fr",
    brand: "northvale",
  },
  {
    quote:
      "Without VC Summit, Kitebase would never have closed a single round.",
    name: "Tunde Adeyemi",
    role: "Founder, Kitebase",
    country: "ng",
    brand: "kitebase",
  },
  {
    quote:
      "Every Thursday someone asked for my deck, my data room or my model. By Demo Day it all existed, because I had no choice. That forcing function changed everything.",
    name: "Maya Rosen",
    role: "Founder, Ledgerly",
    cohort: "Silicon Valley AI Cohort 2026",
    outcomes: [
      "First term sheet 2 weeks after Demo Day",
      "Delaware inc. Aug 2026",
    ],
  },
];

export const RIGHT: Testimonial[] = [
  {
    quote:
      "Joining VC Summit was the defining chapter of my founder journey. The pace, the pressure and, above all, the mentorship reshaped the way I think, the way I build and the way I lead the Tidewell team today.",
    name: "Sari Wibowo",
    role: "Founder, Tidewell",
    country: "id",
    brand: "tidewell",
  },
  {
    quote:
      "The program was demanding, but it prepared me for life as a founder. Mentors, local operators and partners across the network helped us close our first round.",
    name: "Camila Ferreira",
    role: "Founder, Restly",
    country: "br",
    brand: "restly",
  },
  {
    quote:
      "Before the program I used AI to draft emails. Ten weeks later I had an agent-run marketing team, 1,500 synthetic customers and a voice agent. I'd never written Python.",
    name: "Marcus Hale",
    role: "Founder and CEO, Relaywave",
    cohort: "Silicon Valley AI Cohort 2026",
    outcomes: ["AI marketing team built", "1,500 synthetic customers"],
  },
];
