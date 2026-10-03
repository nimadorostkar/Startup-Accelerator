"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { LOCALE_INFO } from "@/i18n/config";
import { useLocale } from "@/i18n/client";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay before the element animates in, in ms. */
  delay?: number;
  /** Start offset in px (slides from here to its resting place). `x` is
      along the reading direction: negative starts toward the line's start
      (the left in English, the right in Persian). */
  x?: number;
  y?: number;
  as?: "div" | "li";
  style?: CSSProperties;
};

/**
 * Fades + slides its children in the first time they scroll into view.
 * The hidden state only applies once the `js` class is on <html>, so
 * content is always visible without JavaScript. See `.reveal` in globals.css.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  x = 0,
  y = 28,
  as: Tag = "div",
  style,
}: RevealProps) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);
  const rtl = LOCALE_INFO[useLocale()].dir === "rtl";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.dataset.inview = "";
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.inview = "";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={
        {
          "--d": `${delay}ms`,
          "--rx": `${rtl ? -x : x}px`,
          "--ry": `${y}px`,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
