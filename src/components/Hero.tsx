import Image from "next/image";
import Link from "next/link";
import Navbar from "./Navbar";
import { ArrowRight, PlayIcon, PlusMark } from "./icons";

// Column padding measured from the design (dividers sit at x=310 and x=554 of 1672).
const STAT_PAD = [
  "lg:pr-[3.83cqw]",
  "lg:pl-[3.11cqw] lg:pr-[2.93cqw]",
  "lg:pl-[3.71cqw]",
];

const STATS = [
  { value: "$420B+", label: "Capital Represented" },
  { value: "180+", label: "Investment Firms" },
  { value: "65+", label: "Markets" },
];

export default function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] w-full overflow-hidden bg-ink lg:h-[100svh] lg:min-h-[640px]">
      {/* Background photo (clean plate — all UI is rendered in code) */}
      <Image
        src="/images/hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-[62%_center] lg:object-center"
      />

      {/* Legibility overlays — only needed where the mobile crop puts text over the skyline */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-white/65 via-white/35 via-55% to-transparent lg:hidden"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-black/50 to-transparent lg:hidden"
      />

      {/* Decorative sweep — shares the photo's 1672×941 frame, so it stays locked to it */}
      <svg
        viewBox="0 0 1672 941"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 -z-10 hidden h-full w-full lg:block"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="hero-sweep"
            gradientUnits="userSpaceOnUse"
            x1="814"
            y1="403"
            x2="1359"
            y2="27"
          >
            <stop offset="0" stopColor="#fff" stopOpacity="0.15" />
            <stop offset="0.12" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="0.7" stopColor="#fff" stopOpacity="0.42" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path
          d="M814 403C900 177 1135 65 1359 27"
          fill="none"
          stroke="url(#hero-sweep)"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <Navbar />

      {/* Content */}
      <div className="mx-auto h-full w-full max-w-[1920px] @container">
        <div className="flex h-full min-h-[100svh] flex-col px-6 pt-[64px] sm:px-8 lg:min-h-0 lg:px-[4.31cqw] lg:pt-[5.8cqw]">
          {/* Upper block */}
          <div className="flex min-w-0 flex-1 items-start justify-between gap-8 pt-8 lg:pt-[3.55cqw]">
            <div>
              {/* Eyebrow */}
              <div className="flex items-center gap-[0.85em] text-[11px] lg:text-[0.75cqw]">
                <span
                  aria-hidden="true"
                  className="h-[1em] w-[1em] shrink-0 rounded-full bg-gold"
                />
                <span className="font-display text-[1em] font-semibold tracking-[0.18em] text-gold uppercase">
                  Registration Open
                </span>
              </div>

              {/* Kicker */}
              <p className="type-wide mt-4 text-[10px] font-bold tracking-[0.2em] text-ink uppercase lg:mt-[0.87cqw] lg:text-[0.7cqw] lg:tracking-[0.25em]">
                <span className="whitespace-nowrap">Private Capital</span>{" "}
                <span aria-hidden="true" className="mx-[0.95em]">
                  /
                </span>{" "}
                <span className="whitespace-nowrap">Global Network</span>{" "}
                <span aria-hidden="true" className="mx-[0.95em]">
                  /
                </span>{" "}
                2026
              </p>

              {/* Headline */}
              <h1 className="type-heavy mt-2 text-[9.9vw] leading-[0.86] text-ink uppercase sm:text-[8vw] md:text-[6.6vw] lg:mt-[1.28cqw] lg:-ml-[0.3cqw] lg:text-[4.96cqw] lg:leading-[0.825]">
                <span className="block tracking-[0.02em]">Ideas</span>
                <span className="block tracking-[-0.002em]">Fund</span>
                <span className="block tracking-[-0.037em]">Tomorrow.</span>
              </h1>

              {/* Sub copy */}
              <p className="mt-5 text-[15px] leading-[1.4] text-ink-soft lg:mt-[0.42cqw] lg:text-[1.04cqw] lg:leading-[1.15] lg:tracking-[0.025em]">
                Exclusive summit for the world&rsquo;s
                <br />
                top investors, founders and decision makers.
              </p>

              {/* CTAs */}
              <div className="mt-7 flex flex-wrap items-center gap-5 lg:mt-[1.54cqw] lg:gap-[2.4cqw]">
                <Link
                  href="#request"
                  className="group inline-flex h-[48px] items-center justify-center gap-6 rounded-full bg-gold-btn px-8 shadow-[0_16px_38px_-16px_rgba(214,150,67,0.85)] transition-[filter] duration-200 hover:brightness-105 lg:h-[2.93cqw] lg:min-h-[42px] lg:w-[15.31cqw] lg:gap-[0.9cqw] lg:px-0"
                >
                  <span className="font-display text-[12px] font-bold tracking-[0.04em] whitespace-nowrap text-gold-ink uppercase lg:text-[max(10px,0.8cqw)]">
                    Request Invitation
                  </span>
                  <ArrowRight className="h-[18px] w-[18px] shrink-0 text-gold-ink transition-transform duration-200 group-hover:translate-x-1 lg:h-[1.1cqw] lg:w-[1.1cqw]" />
                </Link>

                <Link
                  href="#summit"
                  className="group inline-flex items-center gap-3.5 text-[12px] lg:gap-[1.1cqw] lg:text-[max(10px,0.8cqw)]"
                >
                  <span className="font-display text-[1em] font-bold tracking-[0.1em] whitespace-nowrap text-ink uppercase">
                    View Summit
                  </span>
                  <span className="flex h-[3.2em] w-[3.2em] shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink/70 transition-colors duration-200 group-hover:border-ink">
                    <ArrowRight className="h-[1.3em] w-[1.3em] shrink-0 text-ink transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </div>
            </div>

            {/* Corner mark */}
            <div className="hidden shrink-0 items-start gap-[1.05cqw] text-[0.7cqw] lg:-mt-[2.64cqw] lg:mr-[1.2cqw] lg:flex">
              <PlusMark className="h-[3.3em] w-[3.3em] shrink-0 text-ink/70" />
              <p className="font-display text-[1em] leading-[1.4] font-medium tracking-[0.1em] text-ink-soft uppercase">
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
            <dl className="flex w-full items-stretch sm:w-auto">
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`flex min-w-0 flex-1 flex-col-reverse sm:flex-none ${
                    i > 0 ? "border-l border-white/30 pl-3 sm:pl-5" : ""
                  } ${i < STATS.length - 1 ? "pr-3 sm:pr-5" : ""} ${STAT_PAD[i]}`}
                >
                  <dt className="font-display mt-[0.6em] text-[9px] leading-[1.35] font-semibold tracking-[0.08em] text-white/90 uppercase lg:mt-[0.5em] lg:text-[max(9px,0.78cqw)] lg:whitespace-nowrap">
                    {stat.label}
                  </dt>
                  <dd className="font-display text-[22px] leading-none font-extrabold tracking-[-0.01em] text-white sm:text-[27px] lg:text-[2.35cqw]">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Watch */}
            <Link
              href="#highlights"
              className="group flex items-center gap-3.5 text-[10px] lg:mr-[0.3cqw] lg:translate-y-[0.18cqw] lg:gap-[1.2cqw] lg:text-[max(9px,0.61cqw)]"
            >
              <span className="flex h-[6.9em] w-[6.9em] shrink-0 items-center justify-center rounded-full border-[1.5px] border-gold/85 bg-black/30 backdrop-blur-[3px] transition-colors duration-200 group-hover:border-gold">
                <PlayIcon className="h-[3em] w-[3em] translate-x-[0.08em] text-white" />
              </span>
              <span className="type-wide text-[1em] leading-[1.7] font-semibold tracking-[0.07em] whitespace-nowrap text-white uppercase">
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
