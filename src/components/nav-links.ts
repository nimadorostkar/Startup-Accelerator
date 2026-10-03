import type { Messages } from "@/i18n/messages";

/* The header's links; labels come from the common dictionary (nav.*). */
export const NAV_LINKS: { key: keyof Messages["common"]["nav"]; href: string }[] = [
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
  { key: "startups", href: "/startups" },
  { key: "events", href: "/events" },
  { key: "demoDay", href: "/demo-day" },
  { key: "newsletter", href: "/newsletter" },
];
