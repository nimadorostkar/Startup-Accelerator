import type { Metadata } from "next";
import LegalArticle, { type LegalSection } from "@/components/LegalArticle";

export const metadata: Metadata = {
  title: "Code of conduct — VC Summit",
  description:
    "How we expect everyone to behave at VC Summit events and in the founder community.",
};

/* DRAFT — confirm the reporting route (a named contact or email) before launch. */
const SECTIONS: LegalSection[] = [
  {
    title: "Why this exists",
    paragraphs: [
      "Founders share unfinished products, real numbers and hard problems with us and with each other. That only works in a room where everyone feels safe and respected. This code applies to every VC Summit event, online or in person, to the program, and to any community space we run.",
    ],
  },
  {
    title: "What we expect",
    bullets: [
      "Be respectful and considerate. Disagree with ideas, not people.",
      "Give feedback the way you would want it: honest, specific and kind.",
      "Treat what founders share in the room as confidential unless they say otherwise.",
      "Make space for others: in Q&A, at networking and on panels.",
      "Follow the instructions of organisers and venue staff.",
    ],
  },
  {
    title: "What we don't accept",
    bullets: [
      "Harassment or intimidation of any kind, including unwelcome attention, comments about someone's body, background, gender, sexuality, religion or disability, and deliberate misgendering.",
      "Threats, stalking, or following someone after they have asked you to stop.",
      "Recording, photographing or sharing someone's pitch or private conversation without their permission.",
      "Unsolicited sales pitches, recruiting or fundraising directed at people who did not ask for them.",
      "Disruptive behaviour, including being visibly intoxicated at an event.",
    ],
  },
  {
    title: "How to report a problem",
    paragraphs: [
      "If you experience or witness behaviour that breaks this code, tell an organiser at the event, or contact the team through the contact page as soon as you can. Tell us what happened, when and where, and who was involved if you know. We will take every report seriously, keep it as confidential as we can, and never penalise anyone for reporting in good faith.",
    ],
  },
  {
    title: "What happens next",
    paragraphs: [
      "Depending on what happened, we may have a word with the person, ask them to leave the event without a refund of any fee, exclude them from future events, or remove them from the program or community. Where a law may have been broken, we will involve the relevant authorities.",
    ],
  },
  {
    title: "Investors, mentors and partners",
    paragraphs: [
      "The same rules apply to everyone we invite, whatever their role. Founders should never feel that access to capital or advice depends on putting up with behaviour that breaks this code.",
    ],
  },
];

export default function CodeOfConductPage() {
  return (
    <LegalArticle
      eyebrow="Legal"
      title="Code of conduct"
      updated="2026-09-25"
      current="/code-of-conduct"
      intro="How we expect everyone to behave at our events and in the founder community, and what to do if someone doesn't."
      sections={SECTIONS}
    />
  );
}
