import Image from "next/image";
import Link from "next/link";
import Navbar from "./Navbar";
import { ArrowRight, PlayIcon, PlusMark } from "./icons";

const STATS = [
  { value: "$420B+", label: "Capital Represented" },
  { value: "180+", label: "Investment Firms" },
  { value: "65+", label: "Markets" },
];

export default function Hero() {
  return (
    <section className="relative min-h-[720px] w-full overflow-hidden lg:h-screen lg:max-h-[1080px] lg:min-h-[640px]">
      {/* Background */}
      <Image
        src="/images/hero.webp"
        alt="Investors gathering at the Global Capital Summit venue overlooking the Bosphorus at sunset"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Legibility overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/0 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/15" />

      {/* Decorative sweep */}
      <svg
        viewBox="0 0 1672 941"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M745 705C800 425 1000 200 1300 110c130-38 260-58 372-66"
          fill="none"
          stroke="white"
          strokeOpacity="0.55"
          strokeWidth="1.5"
        />
      </svg>

      <Navbar />

      {/* Content */}
      <div className="relative z-20 mx-auto flex h-full w-full max-w-[1920px] flex-col px-6 pt-[64px] sm:px-8 lg:px-[4.31vw] lg:pt-[5.8vw]">
        {/* Upper block */}
        <div className="flex flex-1 items-start justify-between gap-8 pt-8 lg:pt-[3.55vw]">
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-[0.9em] text-[11px] lg:text-[0.72vw]">
              <span className="h-[0.92em] w-[0.92em] shrink-0 rounded-full bg-gold" />
              <span className="font-display text-[1em] font-bold tracking-[0.2em] text-gold uppercase">
                Registration Open
              </span>
            </div>

            {/* Kicker */}
            <p className="mt-[1.35vw] font-display text-[10px] font-semibold tracking-[0.27em] text-ink uppercase lg:text-[0.66vw]">
              Private Capital
              <span className="mx-[1em] text-ink/45">/</span>
              Global Network
              <span className="mx-[1em] text-ink/45">/</span>
              2026
            </p>

            {/* Headline */}
            <h1 className="mt-[0.8vw] font-display text-[13.2vw] leading-[0.895] font-black tracking-[-0.035em] text-ink uppercase lg:text-[4.51vw]">
              Ideas
              <br />
              Fund
              <br />
              Tomorrow.
            </h1>

            {/* Sub copy */}
            <p className="mt-[1.2vw] text-[14px] leading-[1.21] font-normal text-ink-soft lg:text-[0.9vw]">
              Exclusive summit for the world&rsquo;s
              <br />
              top investors, founders and decision makers.
            </p>

            {/* CTAs */}
            <div className="mt-[1.6vw] flex flex-wrap items-center gap-5 lg:gap-[2.7vw]">
              <Link
                href="#request"
                className="group inline-flex h-[48px] items-center justify-center gap-6 rounded-full bg-gold-btn px-8 shadow-[0_16px_38px_-16px_rgba(214,150,67,0.85)] transition-all duration-200 hover:brightness-105 lg:h-[2.93vw] lg:max-h-[58px] lg:min-h-[42px] lg:w-[15.31vw] lg:max-w-[300px] lg:justify-between lg:px-[2.25vw]"
              >
                <span className="font-display text-[11px] font-bold tracking-[0.12em] text-gold-ink uppercase lg:text-[max(9px,0.69vw)]">
                  Request Invitation
                </span>
                <ArrowRight className="h-[1.25em] w-[1.25em] text-gold-ink transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <Link
                href="#summit"
                className="group inline-flex items-center gap-3.5 text-[11px] lg:gap-[1vw] lg:text-[max(9px,0.69vw)]"
              >
                <span className="font-display text-[1em] font-bold tracking-[0.12em] text-ink uppercase">
                  View Summit
                </span>
                <span className="flex h-[3.1em] w-[3.1em] items-center justify-center rounded-full border border-ink/45 transition-colors duration-200 group-hover:border-ink">
                  <ArrowRight className="h-[1.3em] w-[1.3em] text-ink transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>
          </div>

          {/* Corner mark */}
          <div className="hidden shrink-0 items-start gap-[1.05vw] pt-[1.4vw] text-[0.72vw] lg:flex">
            <PlusMark className="h-[2.75em] w-[2.75em] shrink-0 text-white/85" />
            <p className="font-display text-[1em] leading-[1.35] font-medium tracking-[0.12em] text-white uppercase">
              Global
              <br />
              Investment
              <br />
              Forum
            </p>
          </div>
        </div>

        {/* Lower bar */}
        <div className="mt-12 flex flex-wrap items-end justify-between gap-8 pb-10 lg:mt-0 lg:items-center lg:pb-[3.73vw]">
          {/* Stats */}
          <div className="flex items-stretch">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`${i > 0 ? "border-l border-white/30 pl-4 lg:pl-[3.4vw]" : ""} ${
                  i < STATS.length - 1 ? "pr-4 lg:pr-[3.4vw]" : ""
                }`}
              >
                <p className="font-display text-[26px] leading-none font-black tracking-[-0.03em] text-white lg:text-[2.21vw]">
                  {stat.value}
                </p>
                <p className="mt-[0.33em] font-display text-[9px] font-medium tracking-[0.12em] whitespace-nowrap text-white/90 uppercase lg:text-[max(9px,0.72vw)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Watch */}
          <Link
            href="#highlights"
            className="group flex items-center gap-3.5 text-[10px] lg:gap-[1.6vw] lg:text-[max(9px,0.59vw)]"
          >
            <span className="flex h-[7.6em] w-[7.6em] shrink-0 items-center justify-center rounded-full border border-white/70 backdrop-blur-[2px] transition-colors duration-200 group-hover:border-white">
              <PlayIcon className="h-[3.1em] w-[3.1em] translate-x-[0.08em] text-white" />
            </span>
            <span className="font-display text-[1em] leading-[2] font-medium tracking-[0.1em] whitespace-nowrap text-white uppercase">
              Watch
              <br />
              The Highlights
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
