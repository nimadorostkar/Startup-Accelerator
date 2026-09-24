import Image from "next/image";
import Reveal from "./motion/Reveal";
import { CalendarIcon } from "./icons";
import ButtonLink from "./ui/ButtonLink";

export default function JoinBanner() {
  return (
    <section
      aria-labelledby="join-title"
      className="relative isolate overflow-hidden bg-navy"
    >
      {/* Faint grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:50px_50px]"
      />
      {/* Green glow, bottom-left */}
      <div
        aria-hidden="true"
        className="cta-glow absolute -bottom-44 -left-40 -z-10 h-[380px] w-[760px] rounded-full bg-[radial-gradient(closest-side,rgba(44,110,65,0.55),transparent)] blur-2xl [--glow-dir:-1]"
      />

      {/* Photo on the right half, fading into the navy panel.
          PLACEHOLDER — third-party photo showing Founder Institute branding;
          replace with your own cohort photo (or confirm permission) before launch. */}
      <div className="absolute inset-y-0 right-0 -z-10 w-full md:w-1/2">
        <Image
          src="/images/cohort.webp"
          alt="A cohort of founders and mentors posing together at a program event"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-[60%_center]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-navy via-navy/35 via-15% to-transparent to-35% max-md:bg-navy/80"
        />
      </div>

      <div className="mx-auto max-w-[1720px] px-4 py-20 sm:px-8 sm:py-24 lg:px-10 xl:py-28">
        <div className="max-w-[600px]">
          <Reveal x={-24} y={0}>
            <p className="type-wide text-[11px] font-semibold tracking-[0.2em] text-green-light uppercase">
              Applications open
              <span aria-hidden="true" className="mx-2.5">
                ·
              </span>
              Silicon Valley Fall 2026
            </p>
          </Reveal>
          <Reveal x={-24} y={0} delay={90}>
            <h2
              id="join-title"
              className="mt-5 font-display text-[40px] leading-[1.04] font-bold tracking-[-0.025em] text-white sm:text-[52px]"
            >
              Stop Planning.
              <br />
              Start Building.
            </h2>
          </Reveal>
          <Reveal x={-24} y={0} delay={180}>
            <p className="mt-6 max-w-[560px] text-[16px] leading-[1.7] text-white/80 sm:text-[17px]">
              Join thousands of founders who turned their ideas into funded
              startups. AI rewrote the rules, you bring the vision, we bring
              everything else.
            </p>
          </Reveal>
          <Reveal
            x={-24}
            y={0}
            delay={260}
            className="mt-9 flex flex-wrap gap-3"
          >
            <ButtonLink href="#request" variant="green">
              Apply now
            </ButtonLink>
            <ButtonLink href="#summit" variant="outline-dark" icon={CalendarIcon}>
              Attend a free event
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
