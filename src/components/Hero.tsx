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
    <section className="relative min-h-[100svh] w-full overflow-hidden lg:h-[100svh] lg:min-h-[640px]">
      {/* Background */}
      <Image
        src="/images/hero.webp"
        alt="Investors gathering outside a waterfront summit venue at sunset"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Legibility overlays */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/0 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/15"
      />

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
      <div className="relative z-20 mx-auto h-full w-full max-w-[1920px] @container">
        <div className="flex h-full flex-col px-6 pt-[64px] sm:px-8 lg:px-[4.31cqw] lg:pt-[5.8cqw]">
          {/* Upper block */}
          <div className="flex min-w-0 flex-1 items-start justify-between gap-8 pt-8 lg:pt-[3.55cqw]">
            <div>
              {/* Eyebrow */}
              <div className="flex items-center gap-[0.9em] text-[11px] lg:text-[0.72cqw]">
                <span
                  aria-hidden="true"
                  className="bg-gold h-[0.92em] w-[0.92em] shrink-0 rounded-full"
                />
                <span className="font-display text-gold text-[1em] font-bold tracking-[0.2em] uppercase">
                  Registration Open
                </span>
              </div>

              {/* Kicker */}
              <p className="font-display mt-4 text-[10px] font-semibold tracking-[0.27em] text-ink uppercase lg:mt-[1.35cqw] lg:text-[0.66cqw]">
                Private Capital
                <span className="mx-[1em] text-ink/45">/</span>
                Global Network
                <span className="mx-[1em] text-ink/45">/</span>
                2026
              </p>

              {/* Headline */}
              <h1 className="font-display mt-2 text-[11vw] leading-[0.92] font-black tracking-[-0.035em] text-ink uppercase sm:text-[8.5vw] md:text-[7vw] lg:mt-[0.8cqw] lg:text-[4.51cqw] lg:leading-[0.895]">
                Ideas
                <br />
                Fund
                <br />
                Tomorrow.
              </h1>

              {/* Sub copy */}
              <p className="mt-5 text-[14px] leading-[1.35] font-normal text-ink-soft lg:mt-[1.2cqw] lg:text-[0.9cqw] lg:leading-[1.08]">
                Exclusive summit for the world&rsquo;s
                <br />
                top investors, founders and decision makers.
              </p>

              {/* CTAs */}
              <div className="mt-7 flex flex-wrap items-center gap-5 lg:mt-[1.24cqw] lg:gap-[2.7cqw]">
                <Link
                  href="#request"
                  className="group bg-gold-btn inline-flex h-[48px] items-center justify-center gap-6 rounded-full px-8 shadow-[0_16px_38px_-16px_rgba(214,150,67,0.85)] transition-all duration-200 hover:brightness-105 lg:h-[2.93cqw] lg:max-h-[58px] lg:min-h-[42px] lg:w-[15.31cqw] lg:justify-between lg:px-[2.25cqw]"
                >
                  <span className="font-display text-gold-ink text-[11px] font-bold tracking-[0.12em] whitespace-nowrap uppercase lg:text-[max(9px,0.69cqw)]">
                    Request Invitation
                  </span>
                  <ArrowRight className="text-gold-ink h-[1.25em] w-[1.25em] transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="#summit"
                  className="group inline-flex items-center gap-3.5 text-[11px] lg:gap-[1cqw] lg:text-[max(9px,0.69cqw)]"
                >
                  <span className="font-display text-[1em] font-bold tracking-[0.12em] whitespace-nowrap text-ink uppercase">
                    View Summit
                  </span>
                  <span className="flex h-[3.1em] w-[3.1em] items-center justify-center rounded-full border border-ink/45 transition-colors duration-200 group-hover:border-ink">
                    <ArrowRight className="h-[1.3em] w-[1.3em] text-ink transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </div>
            </div>

            {/* Corner mark */}
            <div className="hidden shrink-0 items-start gap-[1.05cqw] pt-[1.4cqw] text-[0.72cqw] lg:flex">
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
          <div className="mt-12 flex flex-wrap items-end justify-between gap-8 pb-10 lg:mt-0 lg:items-center lg:pb-[3.55cqw]">
            {/* Stats */}
            <div className="flex w-full items-stretch sm:w-auto">
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`min-w-0 flex-1 sm:flex-none ${
                    i > 0
                      ? "border-l border-white/30 pl-3 sm:pl-5 lg:pl-[3.4cqw]"
                      : ""
                  } ${i < STATS.length - 1 ? "pr-3 sm:pr-5 lg:pr-[3.4cqw]" : ""}`}
                >
                  <p className="font-display text-[21px] leading-none font-black tracking-[-0.03em] text-white sm:text-[26px] lg:text-[2.21cqw]">
                    {stat.value}
                  </p>
                  <p className="font-display mt-[0.55em] text-[9px] leading-[1.35] font-medium tracking-[0.1em] text-white/90 uppercase sm:mt-[0.33em] lg:mt-[0.33em] lg:text-[max(9px,0.72cqw)] lg:whitespace-nowrap">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Watch */}
            <Link
              href="#highlights"
              className="group flex items-center gap-3.5 text-[10px] lg:translate-y-[0.68cqw] lg:gap-[1.18cqw] lg:text-[max(9px,0.67cqw)]"
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
      </div>
    </section>
  );
}
