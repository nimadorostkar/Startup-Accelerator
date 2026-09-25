import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "../icons";
import { STAGES } from "../Journey";
import Reveal from "../motion/Reveal";

const N = STAGES.length;
const HERE = STAGES.findIndex((s) => s.id === "demo-day");

/* Road geometry in a 600×200 box that stretches to the container: node i sits
   at x = 50 + 100i, alternating high (even) and low (odd). Cards sit above the
   high nodes and below the low ones. */
const X = (i: number) => 50 + i * 100;
const Y = (i: number) => (i % 2 === 0 ? 50 : 150);
const bend = (i: number, j: number) =>
  `C ${X(i) + 50} ${Y(i)} ${X(j) - 50} ${Y(j)} ${X(j)} ${Y(j)}`;

const PROGRAM_ROAD =
  `M 0 ${Y(0)} L ${X(0)} ${Y(0)} ` +
  Array.from({ length: HERE }, (_, i) => bend(i, i + 1)).join(" ");
const AFTER_ROAD =
  `M ${X(HERE)} ${Y(HERE)} ` +
  Array.from({ length: N - 1 - HERE }, (_, k) =>
    bend(HERE + k, HERE + k + 1),
  ).join(" ") +
  ` L 600 ${Y(N - 1)}`;

function StageCard({ i }: { i: number }) {
  const s = STAGES[i];
  const here = i === HERE;
  const after = i > HERE;
  return (
    <div
      className={`card relative flex h-full flex-col p-4 xl:p-5 ${
        here
          ? "border-gold/60 bg-[linear-gradient(160deg,#fff6e3,#fff_60%)] shadow-[0_28px_56px_-28px_rgba(221,158,66,0.7)]"
          : after
            ? "border-dashed bg-white/70"
            : ""
      }`}
    >
      {here && (
        <span className="absolute -top-3 left-4 rounded-full bg-gold px-2.5 py-1 font-display text-[10px] font-bold tracking-[0.12em] text-gold-ink uppercase xl:left-5">
          The milestone
        </span>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-[11px] font-bold tracking-[0.14em] text-gold-deep uppercase">
          {s.weeks}
        </span>
        <s.Icon className="h-[18px] w-[18px] shrink-0 text-gold" />
      </div>
      <p className="mt-2.5 font-display text-[17px] leading-tight font-bold tracking-[-0.01em] text-ink xl:text-[19px]">
        {s.title}
      </p>
      <p className="mt-2 text-[13px] leading-[1.55] text-muted">
        <span className="font-semibold text-ink-soft">Focus: </span>
        {s.focus}
      </p>
      {here && (
        <Link
          href="#what"
          className="group mt-3 inline-flex items-center gap-1.5 font-display text-[11px] font-bold tracking-[0.06em] text-gold-deep uppercase"
        >
          How it works
          <ArrowRight className="h-3.5 w-3.5 rotate-90 transition-transform duration-200 group-hover:translate-y-0.5" />
        </Link>
      )}
    </div>
  );
}

function Node({ i, className = "" }: { i: number; className?: string }) {
  const here = i === HERE;
  return (
    <span
      className={`node-pop relative flex items-center justify-center rounded-full font-display font-extrabold tabular-nums ${
        here
          ? "h-14 w-14 bg-gold text-[15px] text-gold-ink shadow-[0_12px_30px_-10px_rgba(221,158,66,0.9)] ring-4 ring-white"
          : i > HERE
            ? "h-10 w-10 border-2 border-dashed border-gold/60 bg-white text-[13px] text-gold-deep"
            : "h-10 w-10 bg-white text-[13px] text-ink ring-2 ring-gold"
      } ${className}`}
      style={{ "--i": i } as CSSProperties}
    >
      {here && (
        <span
          aria-hidden="true"
          className="road-ping absolute inset-0 rounded-full bg-gold/60"
        />
      )}
      <span className="relative">{String(i + 1).padStart(2, "0")}</span>
    </span>
  );
}

export default function Roadmap() {
  return (
    <Reveal y={20}>
      {/* Desktop: the winding road */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-6 items-end">
          {STAGES.map((s, i) => (
            <div key={s.id} className="px-2 xl:px-3">
              {i % 2 === 0 && <StageCard i={i} />}
            </div>
          ))}
        </div>

        <div className="relative h-[200px]">
          <svg
            viewBox="0 0 600 200"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="road-gold" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#eadfcb" />
                <stop offset="0.55" stopColor="#dd9e42" />
                <stop offset="1" stopColor="#9c6a19" />
              </linearGradient>
            </defs>
            <path
              d={PROGRAM_ROAD}
              stroke="#eadfcb"
              strokeWidth="10"
              strokeOpacity="0.55"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={PROGRAM_ROAD}
              pathLength={1}
              className="draw"
              stroke="url(#road-gold)"
              strokeWidth="3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={AFTER_ROAD}
              className="art-fade"
              style={{ "--dd": "900ms" } as CSSProperties}
              stroke="#dd9e42"
              strokeOpacity="0.55"
              strokeWidth="3"
              strokeDasharray="7 9"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {STAGES.map((s, i) => {
            const high = i % 2 === 0;
            const left = `${((i + 0.5) * 100) / N}%`;
            return (
              <div key={s.id}>
                {/* Stem from the node to its card */}
                <span
                  aria-hidden="true"
                  className={`absolute h-1/4 w-px border-l-2 border-dashed border-line ${
                    high ? "top-0" : "bottom-0"
                  }`}
                  style={{ left }}
                />
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left, top: high ? "25%" : "75%" }}
                >
                  <Node i={i} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-6 items-start">
          {STAGES.map((s, i) => (
            <div key={s.id} className="px-2 xl:px-3">
              {i % 2 === 1 && <StageCard i={i} />}
            </div>
          ))}
        </div>
      </div>

      {/* Phones and tablets: a vertical timeline */}
      <ol className="relative ml-5 border-l-2 border-dashed border-line pl-9 lg:hidden">
        {STAGES.map((s, i) => (
          <li key={s.id} className="relative pb-6 last:pb-0">
            <div
              className="absolute top-3 -translate-x-1/2"
              style={{ left: "calc(-2.25rem - 1px)" }}
            >
              <Node
                i={i}
                className={i === HERE ? "!h-11 !w-11 !text-[13px]" : ""}
              />
            </div>
            <StageCard i={i} />
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
