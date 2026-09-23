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
      className={`relative rounded-[18px] border border-[#e6eee8] bg-[linear-gradient(140deg,#f1fbf5_0%,#fff_42%)] px-6 pt-[22px] pb-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_14px_34px_-12px_rgba(20,60,35,0.12)] ${className}`}
    >
      <QuoteMark className="absolute -top-[11px] left-6 h-[19px] w-[29px] text-[#63b66c]" />

      <blockquote className="text-[16px] leading-[1.6] text-[#252c34] 2xl:text-[17px] 2xl:leading-[1.6]">
        <p>{t.quote}</p>
      </blockquote>

      <figcaption className="mt-4 flex flex-wrap items-center gap-x-3.5 gap-y-3">
        <span className="relative shrink-0">
          {t.photo ? (
            <Image
              src={t.photo}
              alt=""
              width={46}
              height={46}
              className="h-[46px] w-[46px] rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#e6f6ec] text-[15px] font-semibold text-[#3e784a]"
            >
              {initials(t.name)}
            </span>
          )}
          {t.country && (
            <Flag
              code={t.country}
              className="absolute -right-1 -bottom-1 h-[20px] w-[20px] rounded-full ring-2 ring-white"
            />
          )}
        </span>

        <span className="min-w-[10rem] flex-1 leading-tight">
          <span className="block text-[15px] font-bold text-[#0f1a23] 2xl:text-[16px]">
            {t.name}
          </span>
          <span className="mt-0.5 block text-[14px] text-[#8e9097] 2xl:text-[15px]">
            {t.role}
          </span>
          {t.cohort && (
            <span className="mt-1 block font-mono text-[12px] tracking-[0.06em] text-[#8e9097] uppercase">
              {t.cohort}
            </span>
          )}
        </span>

        {t.brand && (
          <span className="ml-auto shrink-0 self-center">
            <BrandBadge brand={t.brand} />
          </span>
        )}
      </figcaption>

      {t.outcomes && (
        <ul
          className="mt-[7px] flex flex-col items-start gap-[5px]"
          aria-label="Outcomes"
        >
          {t.outcomes.map((o) => (
            <li
              key={o}
              className="rounded-md border border-[#d3eedc] bg-[#f0fcf6] px-2.5 py-1 text-[13px] text-[#3f7549] 2xl:text-[14px]"
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
