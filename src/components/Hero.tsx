import type { CSSProperties } from "react";
import Image from "next/image";
import { LOCALE_INFO, type Locale } from "@/i18n/config";
import { LocalLink as Link } from "@/i18n/client";
import { format, formatNumber } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/server";
import { listPublicStartups } from "@/lib/application/public";
import { nextDemoDay } from "@/lib/events";
import { eventDate, type SummitEvent } from "./events/events";
import { Arrow } from "./hero/Arrow";
import { pitches } from "./hero/demo-day";
import { featured } from "./hero/founders";
import FoundersPanel from "./hero/FoundersPanel";
import s from "./hero/Hero.module.css";
import { rich } from "@/i18n/rich";

/* Landing hero (Fundup Club design): a light intro with the featured-founders
   panel, over a dark Demo Day band. Layout and motion live in
   hero/Hero.module.css. The founders, startups and pitches come from the API's
   public directory, chosen in hero/founders.ts and hero/demo-day.ts. */

/** Entrance delay for one block of the staggered reveal. */
const at = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** The next edition's date ("Oct 22") and start time ("4:00 PM PDT") in the
    page's language, in the event's own time zone. */
function editionWhen(e: SummitEvent, locale: Locale) {
  const { zone } = eventDate(e);
  let timeZone = e.tz;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
  } catch {
    timeZone = "UTC";
  }
  const intl = LOCALE_INFO[locale].intl;
  const start = new Date(e.start);
  const date = new Intl.DateTimeFormat(intl, { month: "short", day: "numeric", timeZone }).format(start);
  const time = new Intl.DateTimeFormat(intl, { hour: "numeric", minute: "2-digit", timeZone }).format(start);
  return { date, start: `${time} ${zone}` };
}

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

export default async function Hero() {
  const [next, startups, { landing }, locale] = await Promise.all([
    nextDemoDay(),
    listPublicStartups(),
    getDictionary(),
    getLocale(),
  ]);
  const t = landing.hero;
  const band = landing.demoDay;
  const when = next && editionWhen(next, locale);
  const founders = featured(startups, undefined, {
    sectors: landing.sectors,
    founder: landing.founders.founder,
  });
  const faces = founders.filter((f) => f.photo).slice(0, 5);
  const onStage = pitches(startups, landing.sectors);

  return (
    <section className={s.hero} aria-labelledby="hero-title">
      {/* ---------------------------------------------------------- intro */}
      <div className={s.intro}>
        <div className={s.introGlow} aria-hidden="true" />
        <div className={s.introInner}>
          <div className={s.copy}>
            <p className={`${s.eyebrow} ${s.rise}`} style={at(100)}>
              {t.eyebrow}
            </p>
            <h1 id="hero-title" className={s.title}>
              <span className={s.line}>
                <span style={at(220)}>{t.titleLine1}</span>
              </span>{" "}
              <span className={`${s.line} ${s.lineAccent}`}>
                <span style={at(340)}>{t.titleLine2}</span>
              </span>
            </h1>
            <p className={`${s.lede} ${s.rise}`} style={at(480)}>
              {t.lede}
            </p>
            <div className={`${s.ctas} ${s.rise}`} style={at(600)}>
              <Link href="/startups" className={`${s.btn} ${s.btnSolid}`}>
                {t.exploreStartups}
                <Arrow />
              </Link>
              <Link href="/dashboard" className={`${s.btn} ${s.btnOutline}`}>
                {t.joinClub}
              </Link>
            </div>
            <div className={`${s.proof} ${s.rise}`} style={at(720)}>
              {faces.length > 0 && (
                <span className={s.faces} aria-hidden="true">
                  {faces.map((f) => (
                    <Image
                      key={f.slug}
                      src={f.photo}
                      alt=""
                      width={64}
                      height={64}
                      unoptimized
                    />
                  ))}
                </span>
              )}
              <p>
                {rich(t.proof, {
                  founders: <strong>{t.proofFounders}</strong>,
                  firms: <strong>{t.proofFirms}</strong>,
                })}
              </p>
            </div>
          </div>

          {/* Featured founders */}
          <div className={`${s.showcase} ${s.rise}`} style={at(450)}>
            <FoundersPanel founders={founders} t={landing.founders} />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------- Demo Day band */}
      <div className={s.band}>
        <div className={s.bandGlow} aria-hidden="true" />
        <div className={s.bandInner}>
          <div className={`${s.bandCopy} ${s.rise}`} style={at(800)}>
            <p className={s.bandEyebrow}>{band.eyebrow}</p>
            <h2 className={s.bandTitle}>
              {band.title} <span>{band.titleAccent}</span>
            </h2>
            <p className={s.bandLede}>{band.lede}</p>
            <div className={s.bandActions}>
              <Link href="/demo-day" className={`${s.btn} ${s.btnSolid}`}>
                {band.explore}
                <Arrow />
              </Link>
              <div className={s.edition}>
                <CalendarGlyph />
                {next && when ? (
                  <p>
                    <Link href={`/events/${next.slug}`}>
                      {format(band.nextEdition, { date: when.date })}
                    </Link>
                    <span>
                      {next.format === "Online"
                        ? band.online
                        : format(band.liveIn, { city: next.city })}{" "}
                      · {when.start}
                    </span>
                  </p>
                ) : (
                  <p>
                    <Link href="/newsletter">{band.dateSoon}</Link>
                    <span>{band.newsletter}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <ol className={s.pitches}>
            {onStage.map((p, i) => (
              <li
                key={p.slug}
                className={`${s.pitch} ${s.rise}`}
                style={at(900 + i * 110)}
              >
                <Link href={`/startups/${p.slug}`} className={s.pitchLink}>
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
                      {formatNumber(locale, i + 1, { minimumIntegerDigits: 2 })}
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
