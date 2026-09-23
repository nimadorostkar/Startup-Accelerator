import type { CSSProperties } from "react";
import Link from "next/link";
import Reveal from "./motion/Reveal";
import { ArrowRight } from "./icons";
import Globe from "./results/Globe";
import TestimonialCard from "./results/TestimonialCard";
import LogoMarquee from "./results/LogoMarquee";
import { LEFT, RIGHT } from "./results/data";

/* Per-card layout + tilt on the wide layout, measured from the design.
   `wrap` positions the card (and carries reveal/float motion); `tilt` rotates it. */
const LEFT_STYLE = [
  { wrap: "", tilt: "xl:-rotate-[2.4deg]" },
  { wrap: "xl:mt-[22px] xl:w-[90%]", tilt: "xl:-rotate-[0.7deg]" },
  { wrap: "xl:mt-[22px] xl:w-[90%]", tilt: "xl:rotate-[0.6deg]" },
];
const RIGHT_STYLE = [
  { wrap: "", tilt: "xl:-rotate-[1.4deg]" },
  { wrap: "xl:mt-[22px] xl:ml-auto xl:w-[90%]", tilt: "xl:rotate-[1deg]" },
  { wrap: "xl:mt-[22px] xl:ml-auto xl:w-[90%]", tilt: "xl:-rotate-[0.6deg]" },
];

/* Idle float: each card breathes on its own rhythm. */
const float = (i: number, side: number) =>
  ({
    "--fdur": `${5.5 + ((i + side) % 3) * 0.9}s`,
    "--fdel": `${-(i * 1.3 + side * 0.7)}s`,
  }) as CSSProperties;

export default function Results() {
  return (
    <section
      id="results"
      aria-labelledby="results-title"
      className="relative isolate overflow-hidden bg-white pt-24 pb-16 sm:pt-28 sm:pb-20 xl:pt-36 xl:pb-24"
    >
      <Reveal
        y={0}
        className="pointer-events-none absolute top-16 left-1/2 -z-10 w-[640px] max-w-none -translate-x-1/2 xl:top-[112px] xl:w-[720px]"
      >
        <Globe className="h-auto w-full" />
      </Reveal>

      <div className="mx-auto box-content grid max-w-[1080px] gap-6 px-6 sm:px-10 md:grid-cols-2 lg:px-16 xl:grid-cols-[minmax(0,1fr)_400px_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,1fr)_420px_minmax(0,1fr)] xl:gap-x-0 xl:px-24 2xl:px-28">
        {/* Center: heading, logos, CTA (first on small screens) */}
        <div className="relative order-first mb-8 flex min-w-0 flex-col items-center text-center md:col-span-2 xl:col-span-1 xl:col-start-2 xl:row-start-1 xl:mb-0 xl:self-center">
          {/* Eyebrow — same pattern as the hero */}
          <Reveal
            delay={0}
            className="flex items-center gap-[0.85em] text-[11px]"
          >
            <span
              aria-hidden="true"
              className="h-[1em] w-[1em] shrink-0 rounded-full bg-gold"
            />
            <span className="font-display font-semibold tracking-[0.18em] text-gold-deep uppercase">
              Alumni Stories
            </span>
          </Reveal>

          <Reveal delay={90}>
            <h2
              id="results-title"
              className="type-heavy mt-4 text-[30px] leading-[0.95] tracking-[-0.01em] text-ink uppercase sm:text-[36px] xl:text-[30px] 2xl:text-[34px]"
            >
              From idea
              <br />
              to funded,
              <br />
              <span className="text-gold-deep">in their words</span>
            </h2>
          </Reveal>

          <Reveal delay={180}>
            <p className="mt-5 max-w-[400px] text-[15px] leading-[1.6] text-ink-soft/80">
              Founders from 65+ markets and our 2026 AI cohorts on what the
              program changed.
            </p>
          </Reveal>

          <Reveal
            delay={260}
            y={16}
            className="mt-7 w-full max-w-[420px] min-w-0"
          >
            <LogoMarquee />
          </Reveal>

          <Reveal delay={560}>
            <Link
              href="#alumni"
              className="group btn-shine mt-8 inline-flex h-12 items-center gap-4 rounded-full bg-gold-btn px-7 shadow-[0_16px_38px_-16px_rgba(214,150,67,0.85)] transition-[filter] duration-200 hover:brightness-105"
            >
              <span className="font-display text-[12px] font-bold tracking-[0.06em] text-gold-ink uppercase">
                View more alumni
              </span>
              <ArrowRight className="h-[18px] w-[18px] shrink-0 text-gold-ink transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        {/* Left column */}
        <div className="flex min-w-0 flex-col gap-6 xl:col-start-1 xl:row-start-1 xl:gap-0 xl:pt-[52px]">
          {LEFT.map((t, i) => (
            <Reveal
              key={t.name}
              delay={120 + i * 150}
              x={-56}
              y={12}
              className={`float ${LEFT_STYLE[i].wrap}`}
              style={float(i, 0)}
            >
              <TestimonialCard t={t} className={LEFT_STYLE[i].tilt} />
            </Reveal>
          ))}
        </div>

        {/* Right column */}
        <div className="flex min-w-0 flex-col gap-6 xl:col-start-3 xl:row-start-1 xl:gap-0">
          {RIGHT.map((t, i) => (
            <Reveal
              key={t.name}
              delay={195 + i * 150}
              x={56}
              y={12}
              className={`float ${RIGHT_STYLE[i].wrap}`}
              style={float(i, 1)}
            >
              <TestimonialCard t={t} className={RIGHT_STYLE[i].tilt} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
