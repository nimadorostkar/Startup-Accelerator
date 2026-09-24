import type React from "react";
import Image from "next/image";
import Flag from "./Flag";
import { BrandBadge } from "./brands";
import type { Testimonial } from "./data";

function QuoteMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 29 19"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M0 12.5C0 6.8 3.6 2.4 10.6.2L12 2.4c-3.6 1.5-5.6 3.2-6.3 3.65A6.5 6.5 0 1 1 0 12.5Z" />
      <path d="M16 12.5C16 6.8 19.6 2.4 26.6.2L28 2.4c-3.6 1.5-5.6 3.2-6.3 3.65A6.5 6.5 0 1 1 16 12.5Z" />
    </svg>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TestimonialCard({
  t,
  className = "",
}: {
  t: Testimonial;
  className?: string;
}) {
  return (
    <figure
      className={`relative rounded-2xl border border-line bg-[linear-gradient(140deg,#fcf6ea_0%,#fff_42%)] px-5 pt-4 pb-3.5 shadow-[0_1px_2px_rgba(0,15,22,0.04),0_14px_34px_-12px_rgba(0,15,22,0.14)] transition-[rotate,scale,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:border-gold/40 hover:shadow-[0_2px_4px_rgba(0,15,22,0.05),0_26px_50px_-16px_rgba(0,15,22,0.24)] xl:hover:rotate-0 ${className}`}
    >
      <QuoteMark className="pop absolute -top-[9px] left-5 h-4 w-6 origin-bottom-left text-gold" />

      <blockquote className="text-[14.5px] leading-[1.5] text-ink-soft">
        <p>{t.quote}</p>
      </blockquote>

      <figcaption className="mt-3 flex items-center gap-x-2.5">
        <span className="relative shrink-0">
          {t.photo ? (
            <Image
              src={t.photo}
              alt=""
              width={34}
              height={34}
              className="h-[34px] w-[34px] rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#faefdb] font-display text-[11px] font-bold tracking-[0.04em] text-gold-deep"
            >
              {initials(t.name)}
            </span>
          )}
          {t.country && (
            <Flag
              code={t.country}
              className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full ring-2 ring-white"
            />
          )}
        </span>

        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13.5px] font-bold text-ink">
            {t.name}
          </span>
          <span className="block truncate text-[12.5px] text-muted">
            {t.role}
          </span>
          {t.cohort && (
            <span className="type-wide mt-0.5 block text-[9.5px] font-semibold tracking-[0.07em] text-muted uppercase">
              {t.cohort}
            </span>
          )}
        </span>

        {t.brand && (
          <span className="ml-auto shrink-0 self-center [&>*]:max-h-5">
            <BrandBadge brand={t.brand} />
          </span>
        )}
      </figcaption>

      {t.outcomes && (
        <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Outcomes">
          {t.outcomes.map((o, i) => (
            <li
              key={o}
              style={{ "--i": i } as React.CSSProperties}
              className="chip chip-in"
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
