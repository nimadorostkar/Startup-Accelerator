import type { CSSProperties } from "react";
import Reveal from "./motion/Reveal";
import ButtonLink from "./ui/ButtonLink";
import Eyebrow from "./ui/Eyebrow";
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
      className="relative isolate overflow-hidden bg-white py-20 sm:py-24 xl:py-28"
    >
      <Reveal
        y={0}
        className="pointer-events-none absolute top-16 left-1/2 -z-10 w-[640px] max-w-none -translate-x-1/2 xl:top-[96px] xl:w-[720px]"
      >
        <Globe className="h-auto w-full" />
      </Reveal>

      <div className="mx-auto box-content grid max-w-[1080px] gap-6 px-6 sm:px-10 md:grid-cols-2 lg:px-16 xl:grid-cols-[minmax(0,1fr)_400px_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,1fr)_420px_minmax(0,1fr)] xl:gap-x-0 xl:px-24 2xl:px-28">
        {/* Center: heading, logos, CTA (first on small screens) */}
        <div className="relative order-first mb-8 flex min-w-0 flex-col items-center text-center md:col-span-2 xl:col-span-1 xl:col-start-2 xl:row-start-1 xl:mb-0 xl:self-center">
          {/* Eyebrow — same pattern as the hero */}
          <Reveal delay={0}>
            <Eyebrow>Alumni stories</Eyebrow>
          </Reveal>

          <Reveal delay={90}>
            <h2
              id="results-title"
              className="title-section mt-4 xl:text-[30px] 2xl:text-[34px]"
            >
              From idea
              <br />
              to funded,
              <br />
              <span className="text-gold-deep">in their words</span>
            </h2>
          </Reveal>

          <Reveal delay={180}>
            <p className="lead mt-5 max-w-[400px]">
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
            <ButtonLink href="#alumni" className="mt-8">
              View more alumni
            </ButtonLink>
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
