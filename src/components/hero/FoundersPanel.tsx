import Image from "next/image";
import { LocalLink as Link } from "@/i18n/client";
import type { Messages } from "@/i18n/messages";
import { initials } from "../dashboard/initials";
import { Arrow } from "./Arrow";
import { panelRows, type PanelFounder } from "./founders";
import s from "./Hero.module.css";

/* The hero's "Featured founders" panel: founders and startups from the API's
   public directory (chosen in founders.ts), in one or two marquee rows. */

function FounderCard({ f, copy }: { f: PanelFounder; copy: boolean }) {
  return (
    // The second copy only exists to make the loop seamless: it is inert, so
    // it is skipped by keyboard and screen readers.
    <li className={s.cardItem} inert={copy || undefined}>
      <Link href={`/startups/${f.slug}`} className={s.card}>
        {f.photo ? (
          <Image
            src={f.photo}
            alt=""
            width={64}
            height={64}
            unoptimized
            className={s.avatar}
          />
        ) : (
          <span className={s.initials} aria-hidden="true">
            {initials(f.name)}
          </span>
        )}
        <span className={s.cardBody}>
          <span className={s.cardName}>{f.name}</span>
          <span className={s.cardRole}>{f.role}</span>
          <span className={s.cardCo}>
            {f.logo && (
              <Image src={f.logo} alt="" width={22} height={22} unoptimized />
            )}
            <span>{f.company}</span>
            {f.sector && (
              <>
                <span className={s.cardSector} aria-hidden="true">
                  ·
                </span>
                <span className={s.cardSector}>{f.sector}</span>
              </>
            )}
          </span>
        </span>
      </Link>
    </li>
  );
}

export default function FoundersPanel({
  founders,
  t,
}: {
  founders: PanelFounder[];
  t: Messages["landing"]["founders"];
}) {
  const rows = panelRows(founders);

  return (
    <section
      id="founders"
      aria-labelledby="founders-title"
      className={s.panel}
    >
      <div className={s.panelHead}>
        <div className={s.panelIntro}>
          <p className={`${s.label} ${s.panelLabel}`}>
            <span className={s.dot} aria-hidden="true" />
            {t.label}
          </p>
          <h2 id="founders-title" className={s.panelTitle}>
            {t.title} <span>{t.titleAccent}</span>
          </h2>
          <p className={s.panelTag}>
            {rows.length > 0 ? t.tag : t.empty}
          </p>
        </div>
        <Link href="/startups" className={`${s.btn} ${s.ghost}`}>
          {t.allStartups}
          <Arrow />
        </Link>
      </div>

      {rows.length > 0 && (
        <div className={s.rows}>
          {rows.map((row, i) => (
            <div
              key={i}
              className={`${s.marquee} ${i % 2 ? s.marqueeReverse : ""}`}
            >
              <ul className={s.track}>
                {[false, true].map((copy) =>
                  row.map((f) => (
                    <FounderCard key={`${f.slug}-${copy}`} f={f} copy={copy} />
                  )),
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
