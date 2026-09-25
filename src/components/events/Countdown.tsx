"use client";

import { useSyncExternalStore } from "react";

function subscribe(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}
const nowInSeconds = () => Math.floor(Date.now() / 1000);
// The server can't know the viewer's clock: render dashes, fill in after hydration.
const noTimeOnServer = () => null;

/* Days / hours / minutes / seconds until `to`. Decorative: the date is
   always shown in text next to it, so it's hidden from screen readers. */
export default function Countdown({
  to,
  tone = "dark",
}: {
  to: string;
  tone?: "dark" | "light";
}) {
  const now = useSyncExternalStore(subscribe, nowInSeconds, noTimeOnServer);
  const left =
    now === null ? null : Math.max(0, Math.floor(Date.parse(to) / 1000) - now);

  const units: [string, number | null][] = [
    ["Days", left === null ? null : Math.floor(left / 86400)],
    ["Hours", left === null ? null : Math.floor((left % 86400) / 3600)],
    ["Min", left === null ? null : Math.floor((left % 3600) / 60)],
    ["Sec", left === null ? null : left % 60],
  ];

  return (
    <div aria-hidden="true" className="grid grid-cols-4 gap-2">
      {units.map(([label, n]) => (
        <div
          key={label}
          className={`rounded-[14px] px-2 py-3 text-center ${
            tone === "dark"
              ? "bg-white/[0.06] ring-1 ring-white/10"
              : "bg-cream ring-1 ring-line-soft"
          }`}
        >
          <span
            className={`block font-display text-[26px] leading-none font-extrabold tabular-nums sm:text-[30px] ${
              tone === "dark" ? "text-white" : "text-ink"
            }`}
          >
            {n === null ? "--" : String(n).padStart(2, "0")}
          </span>
          <span
            className={`mt-1.5 block font-display text-[10px] font-semibold tracking-[0.14em] uppercase ${
              tone === "dark" ? "text-white/55" : "text-muted"
            }`}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
