import Link from "next/link";
import Reveal from "./motion/Reveal";
import { ArrowRight } from "./icons";
import Accordion, { type QA } from "./faq/Accordion";

/* PLACEHOLDER ANSWERS — confirm fees, equity and agreement terms before launch. */
const FAQS: QA[] = [
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
];

export default function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="bg-cream px-4 py-20 sm:px-8 sm:py-24 xl:py-28"
    >
      <div className="mx-auto max-w-[760px]">
        <Reveal>
          <h2
            id="faq-title"
            className="text-center font-display text-[30px] leading-[1.08] font-bold tracking-[-0.02em] text-ink sm:text-[40px]"
          >
            Frequently Asked{" "}
            <span className="text-gold-deep">Questions</span>
          </h2>
        </Reveal>

        <Reveal delay={120} className="mt-10">
          <Accordion items={FAQS} />
        </Reveal>

        <Reveal delay={200} className="mt-8 text-center">
          <Link
            href="#faq"
            className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-gold-deep"
          >
            All questions
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
