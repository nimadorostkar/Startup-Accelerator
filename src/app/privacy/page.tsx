import type { Metadata } from "next";
import LegalArticle, { type LegalSection } from "@/components/LegalArticle";

export const metadata: Metadata = {
  title: "Privacy policy — VC Summit",
  description:
    "What VC Summit collects, why, who can see it, and how to ask for changes.",
};

/* DRAFT — written to match what the site actually does today. Have counsel
   review it, and add your legal entity, address and jurisdiction, before launch. */
const SECTIONS: LegalSection[] = [
  {
    title: "Who we are",
    paragraphs: [
      "VC Summit runs a startup accelerator, events and a newsletter. This policy explains what personal information this website collects, why, who can see it, and the choices you have. Questions go to the team through the contact page.",
    ],
  },
  {
    title: "What we collect",
    paragraphs: ["We only collect what you give us on this site:"],
    bullets: [
      "Account details: your name, email address and password, when you create an account.",
      "Your application: everything you enter in the founder dashboard, including your role, location, LinkedIn, bio, phone number, your startup's details, metrics and fundraising figures, your team members' names, roles, emails and equity, and any links you add.",
      "Contact messages: your name, email, company, topic and message.",
      "Newsletter sign-ups: your email address and where on the site you subscribed.",
      "Event registrations: your name, email, company and the event.",
      "Technical data: a session cookie when you sign in, and standard server logs (IP address, browser, pages requested). We do not use advertising or analytics cookies.",
    ],
  },
  {
    title: "How we use it",
    bullets: [
      "To review your application, contact you about it and, if you are accepted, run the program.",
      "To send the newsletter you asked for. Every issue has an unsubscribe link, and you can also ask us to remove you.",
      "To confirm event registrations and send joining details and reminders.",
      "To reply to your messages.",
      "To keep the site secure and working.",
    ],
    after: [
      "We do not sell personal information, and we do not use it for advertising.",
    ],
  },
  {
    title: "The public startup directory",
    paragraphs: [
      "When you submit an application, a public profile of your startup appears in the directory at /startups. It shows: the startup's name, one-line pitch, website, demo and video links, industry, stage, headquarters, founding date, business model, the problem, solution, customer, market, competition and advantage you described, your headline metric, active user and paying customer counts, your team members' names, roles, commitment and LinkedIn profiles, your own title, location, bio and LinkedIn, and the application's status and dated milestones.",
      "It never shows email addresses, phone numbers, equity, revenue, growth rate, money raised or sought, use of funds, your deck, or anything written by the review team. If you would rather not be listed, or want something changed, tell us through the contact page and we will update or remove the listing.",
    ],
  },
  {
    title: "Who can see your information",
    bullets: [
      "The VC Summit team, including the people who review applications.",
      "Service providers that host the site and send our email, who act on our instructions.",
      "Google, if you choose to sign in with Google: Google tells us your name and email, and its own privacy policy applies to your Google account.",
      "Authorities, where the law requires it.",
    ],
  },
  {
    title: "How long we keep it",
    paragraphs: [
      "We keep your account and application for as long as your account exists, and for a reasonable period afterwards so that you can reapply and we can answer questions about past cohorts. Contact messages, registrations and newsletter addresses are kept while they are needed for the purpose you gave them to us. You can ask us to delete any of it at any time.",
    ],
  },
  {
    title: "Your choices and rights",
    paragraphs: [
      "You can see and edit your application in the dashboard while it is a draft. For anything else, contact us to access, correct or delete your information, to object to how we use it, or to withdraw a consent you gave. Depending on where you live, you may also have the right to complain to a data-protection authority.",
    ],
  },
  {
    title: "Children",
    paragraphs: [
      "This site is for people aged 18 and over. We do not knowingly collect information from anyone younger.",
    ],
  },
  {
    title: "Changes to this policy",
    paragraphs: [
      "If we change how we handle personal information, we will update this page and the date at the top. For significant changes we will also tell account holders by email.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalArticle
      eyebrow="Legal"
      title="Privacy policy"
      updated="2026-09-25"
      current="/privacy"
      intro="What we collect when you use this site, why we collect it, who can see it, and how to ask for changes."
      sections={SECTIONS}
    />
  );
}
