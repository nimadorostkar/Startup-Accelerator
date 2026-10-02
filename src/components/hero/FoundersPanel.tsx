import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Arrow } from "./Arrow";
import { PANEL_ROWS, type PanelFounder, type PanelMark } from "./founders";
import s from "./Hero.module.css";

const MARKS: Record<PanelMark, ReactNode> = {
  bolt: <path d="M11 2L4 11h5l-1 7 8-10h-5z" fill="#3BAE7A" />,
  kernel: (
    <>
      <path d="M3 3h14v14H3z" fill="#8B5CF6" />
      <path
        d="M7 7l3 3-3 3"
        stroke="#fff"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  orbit: (
    <>
      <circle cx="10" cy="10" r="7" fill="none" stroke="#E06A4A" strokeWidth="1.8" />
      <circle cx="10" cy="10" r="2" fill="#E06A4A" />
    </>
  ),
};

function FounderCard({ f, copy }: { f: PanelFounder; copy: boolean }) {
  return (
    // The second copy only exists to make the loop seamless: it is inert, so
    // it is skipped by keyboard and screen readers.
    <li className={s.cardItem} inert={copy || undefined}>
      <Link href="/startups" className={s.card}>
        {f.photo ? (
          <Image
            src={f.photo}
            alt=""
            width={64}
            height={64}
            className={s.avatar}
          />
        ) : (
          <span className={s.initials} aria-hidden="true">
            {f.initials}
          </span>
        )}
        <span className={s.cardBody}>
          <span className={s.cardName}>{f.name}</span>
          <span className={s.cardRole}>{f.role}</span>
          <span className={s.cardCo}>
            {f.logo ? (
              <Image src={f.logo} alt="" width={22} height={22} />
            ) : (
              f.mark && (
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  {MARKS[f.mark]}
                </svg>
              )
            )}
            <span>{f.company}</span>
            <span className={s.cardSector} aria-hidden="true">
              ·
            </span>
            <span className={s.cardSector}>{f.sector}</span>
          </span>
        </span>
      </Link>
    </li>
  );
}

export default function FoundersPanel({ style }: { style?: CSSProperties }) {
  return (
    <section
      id="founders"
      aria-labelledby="founders-title"
      className={`${s.panel} ${s.rise}`}
      style={style}
    >
      <div className={s.panelHead}>
        <div className={s.panelIntro}>
          <p className={`${s.label} ${s.panelLabel}`}>
            <span className={s.dot} aria-hidden="true" />
            Featured founders
          </p>
          <h2 id="founders-title" className={s.panelTitle}>
            Meet our portfolio <span>founders &amp; startups.</span>
          </h2>
          <p className={s.panelTag}>
            Talented founders. Innovative ideas. Real impact.
          </p>
        </div>
        <Link href="/startups" className={`${s.btn} ${s.ghost}`}>
          All startups
          <Arrow />
        </Link>
      </div>

      <div className={s.rows}>
        {PANEL_ROWS.map((row, i) => (
          <div key={i} className={`${s.marquee} ${i % 2 ? s.marqueeReverse : ""}`}>
            <ul className={s.track}>
              {[false, true].map((copy) =>
                row.map((f) => (
                  <FounderCard key={`${f.name}-${copy}`} f={f} copy={copy} />
                )),
              )}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
