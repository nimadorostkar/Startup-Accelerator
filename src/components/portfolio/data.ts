/**
 * Featured founders for the "Startup Accelerator" section.
 *
 * PLACEHOLDER CONTENT — names, companies and images are fictional.
 * Headshots live in /public/images/founders/<slug>.webp and startup marks in
 * /public/images/startups/<startup>-{logo,badge}.webp.
 */

export type Sector = "Fintech" | "HealthTech" | "EdTech" | "SaaS" | "CleanTech";

export type Founder = {
  slug: string;
  name: string;
  role: string;
  company: string;
  /** File prefix for the startup's logo + badge images */
  startup: string;
  tagline: [string, string];
  sector: Sector;
};

export const FOUNDERS: Founder[] = [
  {
    slug: "sarah-mitchell",
    name: "Sarah Mitchell",
    role: "Founder & CEO",
    company: "NovaPay",
    startup: "novapay",
    tagline: ["Modern payments", "for a global world."],
    sector: "Fintech",
  },
  {
    slug: "daniel-kim",
    name: "Daniel Kim",
    role: "Founder & CEO",
    company: "WellNex",
    startup: "wellnex",
    tagline: ["Better health.", "Longer lives."],
    sector: "HealthTech",
  },
  {
    slug: "priya-sharma",
    name: "Priya Sharma",
    role: "Founder & CEO",
    company: "EduMint",
    startup: "edumint",
    tagline: ["Personalized learning", "for a brighter future."],
    sector: "EdTech",
  },
  {
    slug: "alex-carter",
    name: "Alex Carter",
    role: "Founder & CEO",
    company: "CloudForge",
    startup: "cloudforge",
    tagline: ["Build faster.", "Scale smarter."],
    sector: "SaaS",
  },
  {
    slug: "elena-rossi",
    name: "Elena Rossi",
    role: "Founder & CEO",
    company: "GreenLoop",
    startup: "greenloop",
    tagline: ["Cleaner energy.", "A greener tomorrow."],
    sector: "CleanTech",
  },
];
