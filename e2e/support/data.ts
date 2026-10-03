import { randomBytes, randomInt } from "node:crypto";
import { EMAIL_DOMAIN } from "./env";

/** A run-unique token, so parallel tests never touch each other's data. */
export function uid() {
  return `${Date.now().toString(36)}${randomBytes(3).toString("hex")}`;
}

export function uniqueEmail(label = "founder") {
  return `${label}.${uid()}@${EMAIL_DOMAIN}`;
}

/** A visitor address from the documentation ranges (RFC 5737): never one of ours,
    so the API counts it as a real visitor for its rate limits. */
export function visitorIp() {
  const nets = ["192.0.2", "198.51.100", "203.0.113"];
  return `${nets[randomInt(nets.length)]}.${randomInt(1, 255)}`;
}

export const PASSWORD = "e2e-Pass-2026";

export const PROFILE = {
  fullName: "Maya Rosen",
  title: "CEO & co-founder",
  country: "United Kingdom",
  city: "London",
  linkedin: "linkedin.com/in/maya-rosen",
  commitment: "full-time",
  experienceYears: "6",
  phone: "+44 20 7946 0000",
  heardFrom: "Search",
  bio: "Former agency finance lead who closed the books for 40 agencies and hated every month of it.",
};

export function startup(name: string) {
  return {
    name,
    tagline: "Month-end close for agencies, done in a day",
    website: "ledgerly.example",
    industry: "Fintech",
    businessModel: "Subscription (B2B)",
    country: "United Kingdom",
    foundedOn: "2024-03",
    incorporated: "yes",
    stage: "traction",
    problem:
      "Creative agencies spend six to nine days closing each month because hours and expenses live in four tools.",
    solution:
      "It connects time tracking, billing and banking and closes the month automatically, with a review step.",
    targetCustomer: "Agencies with 10–200 staff",
    marketSize: "40k agencies in the UK and US",
    competitors: "Spreadsheets, accounting add-ons",
    advantage: "We were agency finance leads; our templates encode years of closes.",
    activeUsers: "1,400",
    payingCustomers: "140",
    monthlyRevenue: "21000",
    growthRate: "12.5",
    keyMetric: "Close time down from 7 days to 1",
    raisedToDate: "250000",
    seeking: "1,200,000",
    useOfFunds: "Hiring two engineers",
    deckUrl: "docsend.example/deck",
    demoUrl: "",
    videoUrl: "",
  };
}

export const TEAM = {
  workedTogether: "1–3 years",
  whyUs: "We ran finance at agencies for a decade and built the internal tool that became this company.",
  hiringNeeds: "A senior backend engineer",
};
