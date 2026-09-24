import Reveal from "./motion/Reveal";
import { CalendarIcon } from "./icons";
import ButtonLink from "./ui/ButtonLink";

export default function CtaBand() {
  return (
    <section
      aria-labelledby="cta-title"
      className="relative isolate overflow-hidden bg-ink"
    >
      {/* Faint grid, fading out toward the centre */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 [mask-image:linear-gradient(90deg,#000,rgba(0,0,0,0.35)_45%,#000)] bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:50px_50px]"
      />
      {/* Gold glows: top-right and bottom-left corners */}
      <div
        aria-hidden="true"
        className="cta-glow absolute -top-40 -right-24 -z-10 h-[340px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgba(221,158,66,0.42),transparent)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="cta-glow absolute -bottom-40 -left-32 -z-10 h-[300px] w-[680px] rounded-full bg-[radial-gradient(closest-side,rgba(221,158,66,0.3),transparent)] blur-2xl [--glow-dir:-1]"
      />

      <div className="mx-auto flex max-w-[1720px] flex-col gap-8 px-4 py-14 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-6 xl:py-16">
        <div>
          <Reveal x={-24} y={0}>
            <h2
              id="cta-title"
              className="font-display text-[24px] leading-tight font-bold tracking-[-0.015em] text-white sm:text-[28px]"
            >
              There&rsquo;s no better time than the present.
            </h2>
          </Reveal>
          <Reveal x={-24} y={0} delay={120}>
            <p className="mt-2.5 text-[16px] text-white/75 sm:text-[17px]">
              Apply to the Silicon Valley Fall 2026 program today.
            </p>
          </Reveal>
        </div>

        <Reveal
          x={24}
          y={0}
          delay={220}
          className="flex shrink-0 flex-wrap gap-3"
        >
          <ButtonLink href="#request">Apply now</ButtonLink>
          <ButtonLink href="#summit" variant="outline-dark" icon={CalendarIcon}>
            Join a free event
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
