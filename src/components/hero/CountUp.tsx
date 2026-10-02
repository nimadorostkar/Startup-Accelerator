"use client";

import { useEffect, useState } from "react";

/**
 * Counts a stat up from 0 (ease-out-cubic) shortly after mount. The server
 * render and reduced-motion users get the final value; screen readers always
 * read the final value, never the moving one.
 */
export default function CountUp({
  value,
  prefix = "",
  suffix = "",
  delay = 900,
  duration = 1700,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
  duration?: number;
}) {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now() + delay;
    let raf = requestAnimationFrame(function tick(now) {
      const p = Math.min(1, Math.max(0, (now - start) / duration));
      setShown(Math.round(value * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(raf);
      setShown(value);
    };
  }, [value, delay, duration]);

  const text = (n: number) => `${prefix}${n}${suffix}`;
  return (
    <>
      <span aria-hidden="true">{text(shown)}</span>
      <span className="sr-only">{text(value)}</span>
    </>
  );
}
