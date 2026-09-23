import Link from "next/link";
import { ArrowRight } from "./icons";
import Globe from "./results/Globe";
import TestimonialCard from "./results/TestimonialCard";
import { KitebaseMark, LedgerlyMark, RelaywaveMark } from "./results/brands";
import { LEFT, RIGHT } from "./results/data";

/* Per-card tilt/width on the wide layout, measured from the design. */
const LEFT_STYLE = [
  "xl:-rotate-[2.4deg]",
  "xl:mt-[47px] xl:w-[90%] xl:-rotate-[0.7deg]",
  "xl:mt-[48px] xl:w-[90%] xl:rotate-[0.6deg]",
];
const RIGHT_STYLE = [
  "xl:-rotate-[1.4deg]",
  "xl:mt-[48px] xl:ml-auto xl:w-[90%] xl:rotate-[1deg]",
  "xl:mt-[49px] xl:ml-auto xl:w-[90%] xl:-rotate-[0.6deg]",
];

export default function Results() {
  return (
    <section
      id="results"
      aria-labelledby="results-title"
      className="relative isolate overflow-hidden bg-white py-16 sm:py-20 xl:pt-[68px] xl:pb-[46px]"
    >
      <Globe className="pointer-events-none absolute top-6 left-1/2 -z-10 w-[640px] max-w-none -translate-x-1/2 xl:top-[43px] xl:w-[900px]" />

      <div className="mx-auto box-content grid max-w-[1240px] gap-6 px-6 sm:px-10 md:grid-cols-2 lg:px-16 xl:grid-cols-[minmax(0,1fr)_440px_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,1fr)_460px_minmax(0,1fr)] xl:gap-x-0 xl:px-20 2xl:px-24">
        {/* Center: heading, logos, CTA (first on small screens) */}
        <div className="relative order-first mb-8 flex flex-col items-center text-center md:col-span-2 xl:col-span-1 xl:col-start-2 xl:row-start-1 xl:mb-0 xl:-translate-y-[5px] xl:self-center xl:pt-6">
          <h2
            id="results-title"
            className="text-[34px] leading-[1.1] font-bold tracking-[-0.03em] text-[#081722] sm:text-[42px] 2xl:text-[46px]"
          >
            From idea to funded,
            <br />
            <span className="text-[#408141]">in their words</span>
          </h2>

          <p className="mt-[18px] max-w-[500px] text-[17px] leading-[1.6] text-[#4b505b] 2xl:text-[20px]">
            Founders from 65+ markets and our 2026 AI cohorts on what the
            program changed.
          </p>

          <ul
            aria-label="Alumni companies"
            className="mt-[39px] flex flex-wrap items-center justify-center gap-x-8 gap-y-6 xl:gap-x-6"
          >
            <li>
              <RelaywaveMark className="h-9 w-auto xl:h-7" />
              <span className="sr-only">Relaywave</span>
            </li>
            <li>
              <LedgerlyMark className="text-[30px] xl:text-[24px]" />
            </li>
            <li>
              <KitebaseMark className="text-[31px] leading-none xl:text-[25px]" />
            </li>
            <li>
              <span className="font-display text-[30px] font-bold xl:text-[24px] tracking-[-0.05em] text-[#1c1d1f] italic">
                Restly.
              </span>
            </li>
          </ul>

          <Link
            href="#alumni"
            className="group mt-[42px] inline-flex h-14 items-center gap-3 rounded-xl bg-gradient-to-b from-[#579162] to-[#40814d] px-8 text-[18px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(47,110,60,0.7),inset_0_1px_0_rgba(255,255,255,0.18)] transition-[filter] duration-200 hover:brightness-110"
          >
            View more alumni
            <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Left column */}
        <div className="flex flex-col gap-6 xl:col-start-1 xl:row-start-1 xl:gap-0 xl:pt-[82px]">
          {LEFT.map((t, i) => (
            <TestimonialCard key={t.name} t={t} className={LEFT_STYLE[i]} />
          ))}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6 xl:col-start-3 xl:row-start-1 xl:gap-0 xl:pt-[6px]">
          {RIGHT.map((t, i) => (
            <TestimonialCard key={t.name} t={t} className={RIGHT_STYLE[i]} />
          ))}
        </div>
      </div>
    </section>
  );
}
