import Image from "next/image";
import Link from "next/link";
import Reveal from "./motion/Reveal";
import { ArrowRight, CalendarIcon } from "./icons";

export default function JoinBanner() {
  return (
    <section
      aria-labelledby="join-title"
      className="relative isolate overflow-hidden bg-[#0d1d2a]"
    >
      {/* Faint grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:50px_50px]"
      />
      {/* Green glow, bottom-left */}
      <div
        aria-hidden="true"
        className="cta-glow absolute -bottom-44 -left-40 -z-10 h-[380px] w-[760px] rounded-full bg-[radial-gradient(closest-side,rgba(72,150,96,0.45),transparent)] blur-2xl [--glow-dir:-1]"
      />

      {/* Photo on the right half, fading into the navy panel.
          PLACEHOLDER — replace with your own cohort/event photo. */}
      <div className="absolute inset-y-0 right-0 -z-10 w-full md:w-1/2">
        <Image
          src="/images/hero.webp"
          alt=""
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-[80%_80%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0d1d2a] via-[#0d1d2a]/40 via-20% to-transparent to-45% max-md:bg-[#0d1d2a]/80"
        />
      </div>

      <div className="mx-auto max-w-[1720px] px-4 py-20 sm:px-8 lg:px-10 xl:py-32">
        <div className="max-w-[600px]">
          <Reveal x={-24} y={0}>
            <p className="font-mono text-[12px] font-semibold tracking-[0.14em] text-[#82c991] uppercase sm:text-[13px]">
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
              className="mt-6 font-sans text-[42px] leading-[1.06] font-bold tracking-[-0.025em] text-white sm:text-[58px]"
            >
              Stop Planning.
              <br />
              Start Building.
            </h2>
          </Reveal>
          <Reveal x={-24} y={0} delay={180}>
            <p className="mt-6 max-w-[590px] text-[16px] leading-[1.75] text-white/85 sm:text-[18px]">
              Join thousands of founders who turned their ideas into funded
              startups. AI rewrote the rules, you bring the vision, we bring
              everything else.
            </p>
          </Reveal>
          <Reveal
            x={-24}
            y={0}
            delay={260}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              href="#request"
              className="group inline-flex h-[54px] items-center gap-2.5 rounded-[10px] bg-[linear-gradient(180deg,#569262,#3b7f48)] px-6 text-[17px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_28px_-12px_rgba(59,127,72,0.8)] transition-[filter,translate] duration-200 hover:-translate-y-0.5 hover:brightness-110"
            >
              Apply Now
              <ArrowRight className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="#summit"
              className="group inline-flex h-[54px] items-center gap-3 rounded-[10px] border border-white/15 bg-white/[0.05] px-6 text-[17px] font-medium text-white/90 transition-[border-color,background-color,translate] duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.09]"
            >
              <CalendarIcon className="h-[18px] w-[18px] text-white/70" />
              Attend a Free Event
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
