import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "./hero/Arrow";
import CountUp from "./hero/CountUp";
import FoundersPanel from "./hero/FoundersPanel";
import s from "./hero/Hero.module.css";

/* Port of the VC Summit hero handoff. Layout, sizes and motion are in
   hero/Hero.module.css; the founders panel data is in hero/founders.ts. */

const STATS = [
  { value: 420, prefix: "$", suffix: "B+", label: "Capital represented" },
  { value: 180, suffix: "+", label: "Investment firms" },
  { value: 65, suffix: "+", label: "Markets" },
];

/* Drifting gold light specks: position (% of the hero), size (px), timing (s) */
const SPECKS = [
  { x: 44, y: 33, size: 5, delay: 0, dur: 12 },
  { x: 53, y: 47, size: 4, delay: 2.5, dur: 10 },
  { x: 39, y: 58, size: 3, delay: 5, dur: 13 },
  { x: 62, y: 40, size: 5, delay: 7, dur: 11 },
  { x: 69, y: 62, size: 4, delay: 3.8, dur: 14 },
  { x: 21, y: 69, size: 3, delay: 6.2, dur: 12 },
  { x: 86, y: 53, size: 5, delay: 1.4, dur: 12.5 },
];

/** Entrance delay for one block of the staggered reveal. */
const at = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default function Hero() {
  return (
    <section className={s.hero} aria-labelledby="hero-title">
      {/* Photo (clean plate — all UI is rendered in code) + the sweep drawn in
          its 1672×941 frame, drifting together */}
      <div className={s.media} aria-hidden="true">
        <Image
          src="/images/hero.webp"
          alt=""
          fill
          preload
          quality={55}
          sizes="100vw"
          className={s.photo}
        />
        <svg
          viewBox="0 0 1672 941"
          preserveAspectRatio="xMidYMid slice"
          className={s.sweep}
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
      </div>
      <div className={s.shade} aria-hidden="true" />
      <div className={s.glow} aria-hidden="true" />

      <div className={s.inner}>
        {/* Decorative orbit ring + light specks */}
        <div className={s.orbit} style={at(1300)} aria-hidden="true">
          <div className={s.orbitRing}>
            <span className={s.orbitDot} />
          </div>
          <div className={s.orbitInner} />
        </div>
        {SPECKS.map((p) => (
          <span
            key={`${p.x}-${p.y}`}
            aria-hidden="true"
            className={s.speck}
            style={
              {
                left: `${p.x}%`,
                top: `${p.y}%`,
                "--size": `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`,
              } as CSSProperties
            }
          />
        ))}

        <div className={s.copy}>
          <p className={`${s.label} ${s.rise}`} style={at(150)}>
            <span className={`${s.dot} ${s.pulse}`} aria-hidden="true" />
            Registration open
          </p>
          <p className={`${s.meta} ${s.rise}`} style={at(280)}>
            Private capital <span aria-hidden="true">/</span> Global network{" "}
            <span aria-hidden="true">/</span> 2026
          </p>
          <h1 id="hero-title" className={s.title}>
            <span className={s.line}>
              <span style={at(400)}>Ideas fund</span>
            </span>{" "}
            <span className={`${s.line} ${s.lineGold}`}>
              <span style={at(520)}>Tomorrow.</span>
            </span>
          </h1>
          <p className={`${s.lede} ${s.rise}`} style={at(660)}>
            Exclusive summit for the world&rsquo;s top investors, founders and
            decision makers.
          </p>
          <div className={`${s.ctas} ${s.rise}`} style={at(800)}>
            <Link href="/dashboard" className={`${s.btn} ${s.primary}`}>
              Apply now
              <Arrow />
            </Link>
            <Link href="/events" className={`${s.btn} ${s.textBtn}`}>
              View summit
              <span className={s.circle}>
                <Arrow />
              </span>
            </Link>
          </div>
        </div>

        {/* Stats before the panel: that's the stacked (tablet/phone) order */}
        <div className={`${s.stats} ${s.rise}`} style={at(1100)}>
          <span className={s.statsRule} aria-hidden="true" />
          <dl className={s.statsRow}>
            {STATS.map((stat) => (
              <div key={stat.label} className={s.stat}>
                <dt className={s.statCap}>{stat.label}</dt>
                <dd className={s.statNum}>
                  <CountUp
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <FoundersPanel style={at(950)} />
      </div>
    </section>
  );
}
