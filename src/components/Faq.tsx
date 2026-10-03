import { LocalLink as Link } from "@/i18n/client";
import { getDictionary } from "@/i18n/server";
import Reveal from "./motion/Reveal";
import { ArrowRight } from "./icons";
import Accordion from "./faq/Accordion";
import { rich } from "@/i18n/rich";

/* The admissions FAQ; the questions and answers (PLACEHOLDER answers: confirm
   fees, equity and agreement terms before launch) are in the landing
   dictionary, `faq.items`. */

export default async function Faq() {
  const t = (await getDictionary()).landing.faq;
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
            {rich(t.title, {
              accent: <span className="text-brand-strong">{t.titleAccent}</span>,
            })}
          </h2>
        </Reveal>

        <Reveal delay={120} className="mt-10">
          <Accordion items={t.items} />
        </Reveal>

        <Reveal delay={200} className="mt-8 text-center">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-strong"
          >
            {t.ask}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
