import type { Messages } from "@/i18n/messages";
import enLanding from "@/i18n/messages/en/landing";

/**
 * Alumni testimonials for the "From idea to funded" section.
 *
 * PLACEHOLDER CONTENT — names, companies and quotes are fictional.
 * Replace with real, consented alumni testimonials before launch.
 * To use a headshot instead of initials, set `photo` to an image in /public.
 * The quotes, roles, cohorts and outcomes are in the landing dictionary
 * (`testimonials`, keyed by `id`); names, flags and logos are here.
 */

export type CountryCode = "fr" | "ng" | "id" | "br";

export type BrandId = "northvale" | "kitebase" | "tidewell" | "restly";

type Words = Messages["landing"]["testimonials"];

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

type Person = {
  id: keyof Words;
  name: string;
  photo?: string;
  country?: CountryCode;
  brand?: BrandId;
};

const LEFT_PEOPLE: Person[] = [
  { id: "northvale", name: "Léa Marchand", country: "fr", brand: "northvale" },
  { id: "kitebase", name: "Tunde Adeyemi", country: "ng", brand: "kitebase" },
  { id: "ledgerly", name: "Maya Rosen" },
];

const RIGHT_PEOPLE: Person[] = [
  { id: "tidewell", name: "Sari Wibowo", country: "id", brand: "tidewell" },
  { id: "restly", name: "Camila Ferreira", country: "br", brand: "restly" },
  { id: "relaywave", name: "Marcus Hale" },
];

function withWords(people: Person[], words: Words): Testimonial[] {
  return people.map(({ id, ...person }) => {
    const { quote, role, cohort, outcomes } = words[id];
    return {
      ...person,
      quote,
      role,
      ...(cohort && { cohort }),
      ...(outcomes.length > 0 && { outcomes }),
    };
  });
}

/** The two columns of testimonials in a language: `testimonialsIn(landing)`. */
export function testimonialsIn(landing: Messages["landing"]) {
  return {
    left: withWords(LEFT_PEOPLE, landing.testimonials),
    right: withWords(RIGHT_PEOPLE, landing.testimonials),
  };
}

/** The testimonials in English. Pages in other languages use testimonialsIn(landing). */
export const { left: LEFT, right: RIGHT } = testimonialsIn(enLanding);
