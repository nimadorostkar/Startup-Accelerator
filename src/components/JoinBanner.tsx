import Image from "next/image";
import Reveal from "./motion/Reveal";
import ButtonLink from "./ui/ButtonLink";
import { CalendarIcon } from "./icons";

export default function JoinBanner() {
  return (
    <section
      aria-labelledby="join-title"
      className="relative isolate overflow-hidden bg-ink"
    >
      {/* Photo on the right, fading into the ink panel */}
      <div className="absolute inset-y-0 right-0 -z-10 w-full md:w-[58%]">
        <Image
          src="/images/hero.webp"
          alt=""
          fill
          sizes="(min-width: 768px) 58vw, 100vw"
          className="object-cover object-[78%_78%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 via-25% to-transparent max-md:bg-ink/75"
        />
      </div>
      {/* Gold glow bottom-left, like the other dark bands */}
      <div
        aria-hidden="true"
        className="cta-glow absolute -bottom-40 -left-32 -z-10 h-[320px] w-[680px] rounded-full bg-[radial-gradient(closest-side,rgba(221,158,66,0.28),transparent)] blur-2xl [--glow-dir:-1]"
      />

      <div className="mx-auto max-w-[1720px] px-4 py-20 sm:px-8 lg:px-10 xl:py-28">
        <div className="max-w-[520px]">
          <Reveal x={-24} y={0}>
            <p className="type-wide text-[11px] font-semibold tracking-[0.2em] text-gold uppercase">
              Applications open
              <span aria-hidden="true" className="mx-2">
                ·
              </span>
              Silicon Valley Fall 2026
            </p>
          </Reveal>
          <Reveal x={-24} y={0} delay={90}>
            <h2
              id="join-title"
              className="mt-5 font-display text-[40px] leading-[1.02] font-bold tracking-[-0.02em] text-white sm:text-[52px]"
            >
              Stop Planning.
              <br />
              Start Building.
            </h2>
          </Reveal>
          <Reveal x={-24} y={0} delay={180}>
            <p className="mt-6 text-[16px] leading-[1.65] text-white/80">
              Join founders from 65+ markets who turned their ideas into
              funded startups. AI rewrote the rules: you bring the vision, we
              bring everything else.
            </p>
          </Reveal>
          <Reveal
            x={-24}
            y={0}
            delay={260}
            className="mt-9 flex flex-wrap gap-3"
          >
            <ButtonLink href="#request">Apply now</ButtonLink>
            <ButtonLink href="#summit" variant="outline-dark" icon={CalendarIcon}>
              Attend a free event
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
