import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { eventDate, upcomingEvents } from "./events/events";
import { Arrow } from "./hero/Arrow";
import { PITCHES } from "./hero/demo-day";
import FoundersPanel from "./hero/FoundersPanel";
import s from "./hero/Hero.module.css";
import { FOUNDERS } from "./portfolio/data";

/* Landing hero (Fundup Club design): a light intro with the featured-founders
   showcase, over a dark Demo Day band. Layout and motion live in
   hero/Hero.module.css; data in hero/founders.ts and hero/demo-day.ts. */

/** Entrance delay for one block of the staggered reveal. */
const at = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

function CalendarGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="M8 14h2M14 14h2M8 17h2" />
    </svg>
  );
}

export default function Hero() {
  const next = upcomingEvents().find((e) => e.type === "Demo Day");
  const when = next && eventDate(next);

  return (
    <section className={s.hero} aria-labelledby="hero-title">
      {/* ---------------------------------------------------------- intro */}
      <div className={s.intro}>
        <div className={s.introGlow} aria-hidden="true" />
        <div className={s.introInner}>
          <div className={s.copy}>
            <p className={`${s.eyebrow} ${s.rise}`} style={at(100)}>
              Where founders find their next
            </p>
            <h1 id="hero-title" className={s.title}>
              <span className={s.line}>
                <span style={at(220)}>Built to launch.</span>
              </span>{" "}
              <span className={`${s.line} ${s.lineAccent}`}>
                <span style={at(340)}>Made to connect.</span>
              </span>
            </h1>
            <p className={`${s.lede} ${s.rise}`} style={at(480)}>
              A home for bold startups and the people building them.
            </p>
            <div className={`${s.ctas} ${s.rise}`} style={at(600)}>
              <Link href="/startups" className={`${s.btn} ${s.btnSolid}`}>
                Explore startups
                <Arrow />
              </Link>
              <Link href="/dashboard" className={`${s.btn} ${s.btnOutline}`}>
                Join the club
              </Link>
            </div>
            <div className={`${s.proof} ${s.rise}`} style={at(720)}>
              <span className={s.faces} aria-hidden="true">
                {FOUNDERS.map((f) => (
                  <Image
                    key={f.slug}
                    src={`/images/founders/${f.slug}.webp`}
                    alt=""
                    width={64}
                    height={64}
                  />
                ))}
              </span>
              <p>
                <strong>25,000+ founders</strong> trained ·{" "}
                <strong>180+</strong> investment firms
              </p>
            </div>
          </div>

          {/* Showcase: the skyline photo with the founders panel over it */}
          <div className={`${s.showcase} ${s.rise}`} style={at(450)}>
            <div className={s.showcaseMedia} aria-hidden="true">
              <Image
                src="/images/hero.webp"
                alt=""
                fill
                preload
                quality={55}
                sizes="(min-width: 1101px) 60vw, 150vw"
                className={s.showcasePhoto}
              />
            </div>
            <div className={s.showcaseShade} aria-hidden="true" />
            <FoundersPanel />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------- Demo Day band */}
      <div className={s.band}>
        <div className={s.bandGlow} aria-hidden="true" />
        <div className={s.bandInner}>
          <div className={`${s.bandCopy} ${s.rise}`} style={at(800)}>
            <p className={s.bandEyebrow}>Demo Day</p>
            <h2 className={s.bandTitle}>
              Tomorrow&rsquo;s big ideas. <span>Live on stage.</span>
            </h2>
            <p className={s.bandLede}>
              Meet emerging founders. Watch the pitches. Find your next
              opportunity.
            </p>
            <div className={s.bandActions}>
              <Link href="/demo-day" className={`${s.btn} ${s.btnSolid}`}>
                Explore Demo Day
                <Arrow />
              </Link>
              <div className={s.edition}>
                <CalendarGlyph />
                {next && when ? (
                  <p>
                    <Link href={`/events/${next.slug}`}>
                      Next edition · {when.month} {when.day}
                    </Link>
                    <span>
                      {next.format === "Online"
                        ? "Online"
                        : `Live in ${next.city}`}{" "}
                      · {when.start}
                    </span>
                  </p>
                ) : (
                  <p>
                    <Link href="/newsletter">Next edition · Date soon</Link>
                    <span>Get the date first in the newsletter</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <ol className={s.pitches}>
            {PITCHES.map((p, i) => (
              <li
                key={p.name}
                className={`${s.pitch} ${s.rise}`}
                style={at(900 + i * 110)}
              >
                <Link href="/demo-day" className={s.pitchLink}>
                  <Image
                    src={p.photo}
                    alt=""
                    width={316}
                    height={404}
                    sizes="(min-width: 1101px) 12vw, 160px"
                    className={s.pitchPhoto}
                  />
                  <span className={s.pitchBody}>
                    <span className={s.pitchNum} aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={s.pitchSector}>{p.sector}</span>
                    <span className={s.pitchName}>{p.name}</span>
                    <span className={s.pitchBlurb}>{p.blurb}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
