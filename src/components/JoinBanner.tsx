import Image from "next/image";
import Reveal from "./motion/Reveal";
import { CalendarIcon } from "./icons";
import ButtonLink from "./ui/ButtonLink";

export default function JoinBanner() {
  return (
    <section
      aria-labelledby="join-title"
      className="relative isolate overflow-hidden bg-night"
    >
      {/* Faint grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:50px_50px]"
      />
      {/* Green glow, bottom-left */}
      <div
        aria-hidden="true"
        className="cta-glow absolute -bottom-44 -left-40 -z-10 h-[380px] w-[760px] rounded-full bg-[radial-gradient(closest-side,rgba(239,111,35,0.55),transparent)] [--glow-dir:-1]"
      />

      {/* The team photo, whole: on the right half, as tall as its own shape
          makes it (4:3), standing on the bottom edge. On wide screens it fills
          the panel's height and only the floor is cropped; nobody at the sides
          is cut off. Its left and top edges fade into the dark panel. On
          phones it is a dimmed backdrop behind the text. */}
      <div className="absolute right-0 bottom-0 -z-10 w-full max-md:inset-y-0 md:aspect-[1237/932] md:max-h-full md:w-1/2">
        <Image
          src="/images/fundup-team.png"
          alt="The Fundup Club team: ten people in suits, three seated in front and seven standing behind them"
          fill
          quality={75}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-top"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-night via-night/25 via-8% to-transparent to-20% max-md:bg-night/80"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-night to-transparent max-md:hidden"
        />
      </div>

      <div className="mx-auto max-w-[1720px] px-4 py-20 sm:px-8 sm:py-24 lg:px-10 xl:py-28">
        <div className="max-w-[600px]">
          <Reveal x={-24} y={0}>
            <p className="type-wide text-[11px] font-semibold tracking-[0.2em] text-brand-soft uppercase">
              <span className="block sm:inline">Applications open</span>
              <span aria-hidden="true" className="mx-2.5 hidden sm:inline">
                ·
              </span>
              <span className="block sm:inline">Silicon Valley Fall 2026</span>
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
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <ButtonLink href="/dashboard" variant="bright">
              Apply now
            </ButtonLink>
            <ButtonLink href="/events" variant="outline-dark" icon={CalendarIcon}>
              Attend a free event
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
