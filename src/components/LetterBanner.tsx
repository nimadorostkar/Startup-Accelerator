import Link from "next/link";
import Reveal from "./motion/Reveal";
import { ArrowRight } from "./icons";

/* PLACEHOLDER — swap the initials avatar for the CEO's real headshot at
   /public/images/ceo.webp once one is available (with their permission to use it here). */
export default function LetterBanner() {
  return (
    <section className="bg-cream pt-10 pb-2 sm:pt-12">
      <Reveal y={28} className="mx-auto max-w-[1720px] px-6 sm:px-16 lg:px-32 xl:px-56">
        <Link
          href="#letter"
          className="group relative isolate flex items-center gap-5 overflow-hidden rounded-[18px] bg-[linear-gradient(100deg,var(--navy)_0%,var(--navy)_40%,var(--green-deep)_100%)] py-3.5 pr-5 pl-4 transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-20px_rgba(0,15,22,0.55)] sm:gap-8 sm:py-4 sm:pr-10 sm:pl-6 lg:pr-12 lg:pl-8"
        >
          {/* Faint grid + gold glow, same treatment as the other dark bands */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:36px_36px]"
          />
          <div
            aria-hidden="true"
            className="cta-glow absolute -top-16 right-1/4 -z-10 h-[160px] w-[360px] rounded-full bg-[radial-gradient(closest-side,rgba(44,110,65,0.5),transparent)]"
          />

          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white/15 to-white/5 font-display text-[13px] font-bold tracking-[0.02em] text-white ring-2 ring-white/10 sm:h-14 sm:w-14 sm:text-[16px]"
          >
            VC
          </span>

          <span className="min-w-0 flex-1">
            <span className="type-wide block text-[10px] font-semibold tracking-[0.2em] text-green-light uppercase sm:text-[11px]">
              A letter from our founder
            </span>
            <span className="mt-1 block font-display text-[16px] leading-tight sm:truncate font-bold tracking-[-0.01em] text-white sm:text-[19px]">
              The Moment VC Summit Was Built For
            </span>
          </span>

          <span className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 text-[13px] font-semibold text-white transition-[border-color,background-color] duration-200 group-hover:border-green-light/50 group-hover:bg-white/[0.09] sm:h-11 sm:px-5 sm:text-[14px]">
            <span className="hidden sm:inline">Read the letter</span>
            <span className="sm:hidden">Read</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-green-light transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </Link>
      </Reveal>
    </section>
  );
}
