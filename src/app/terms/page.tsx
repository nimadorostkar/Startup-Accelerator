import type { Metadata } from "next";
import LegalArticle, { type LegalSection } from "@/components/LegalArticle";

export const metadata: Metadata = {
  title: "Terms of use — VC Summit",
  description:
    "The terms that apply when you use the VC Summit website, apply to the program or register for an event.",
};

/* DRAFT — have counsel review it, and add your legal entity, governing law and
   dispute-resolution terms, before launch. Program terms live in the program agreement. */
const SECTIONS: LegalSection[] = [
  {
    title: "These terms",
    paragraphs: [
      "These terms apply to this website and to the accounts, applications, newsletter and event registrations it offers. By using the site you agree to them. The program itself is governed by a separate program agreement that admitted founders receive before they commit to anything.",
    ],
  },
  {
    title: "Who can use the site",
    paragraphs: [
      "You must be 18 or older to create an account, apply to the program or register for an event. If you apply on behalf of a startup, you confirm you are allowed to do so and to share the team information you enter.",
    ],
  },
  {
    title: "Your account",
    bullets: [
      "Keep your password to yourself and tell us if you think someone else has used your account.",
      "Give us accurate information and keep it up to date.",
      "You are responsible for what happens under your account.",
    ],
  },
  {
    title: "Applications",
    bullets: [
      "Applying is free and creates no obligation on either side.",
      "Everything you submit must be true and yours to share. We may decline or withdraw an offer if it is not.",
      "Admission decisions are ours to make and are final for that cohort. You are welcome to apply again in a later cycle.",
      "Once you submit, a public profile of your startup appears in the startup directory, as described in the privacy policy. You can ask us to amend or remove it.",
    ],
  },
  {
    title: "Events",
    bullets: [
      "Event registration is free unless the event page says otherwise. Seats are limited and confirmed by email.",
      "We may change the date, venue, format or speakers of an event, or cancel it, and will tell registered guests as early as we can.",
      "Everyone at our events follows the code of conduct. We may ask anyone who does not to leave.",
    ],
  },
  {
    title: "Your content",
    paragraphs: [
      "You keep ownership of everything you submit. You give us permission to store it, to show it to the review team, and to publish the parts of your application listed in the privacy policy in the startup directory, for as long as your application is on the site. We do not claim any rights in your startup, product or ideas.",
    ],
  },
  {
    title: "Our content",
    paragraphs: [
      "The site's design, text, graphics and code belong to VC Summit or its licensors. You may link to any page and share our newsletter, but please do not copy or republish the site's content without asking.",
    ],
  },
  {
    title: "Acceptable use",
    bullets: [
      "Do not try to access other people's accounts or applications.",
      "Do not scrape the site or the startup directory, or use it to build lists of people to contact.",
      "Do not use the contact form, newsletter or event registration to send spam or anything unlawful.",
      "Do not interfere with how the site works.",
    ],
  },
  {
    title: "No advice, no guarantees",
    paragraphs: [
      "Nothing on this site, in the newsletter or at our events is investment, legal, tax or financial advice. Introductions to investors are introductions only: we do not guarantee any meeting, investment or outcome. The site is provided as it is, and we may change or withdraw parts of it at any time.",
    ],
  },
  {
    title: "Liability",
    paragraphs: [
      "To the extent the law allows, VC Summit is not liable for indirect or consequential losses arising from your use of the site, the newsletter or an event. Nothing in these terms limits liability that cannot be limited by law.",
    ],
  },
  {
    title: "Changes and contact",
    paragraphs: [
      "We may update these terms; the date at the top shows the current version, and significant changes will be announced to account holders by email. Questions about these terms go to the team through the contact page.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalArticle
      eyebrow="Legal"
      title="Terms of use"
      updated="2026-09-25"
      current="/terms"
      intro="The rules for using this site, applying to the program and coming to our events. The program itself has its own agreement."
      sections={SECTIONS}
    />
  );
}
