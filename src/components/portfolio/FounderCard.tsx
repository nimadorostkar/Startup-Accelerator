import Image from "next/image";
import type { Founder } from "./data";

export default function FounderCard({ f }: { f: Founder }) {
  return (
    <article className="card card-lift group relative flex h-full flex-col p-5 pt-4">
      <div className="flex items-start justify-between">
        <span className="chip">{f.sector}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_-2px_rgba(0,15,22,0.14)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.8,0.64,1)] group-hover:scale-110 group-hover:rotate-[-8deg]">
          <Image
            src={`/images/startups/${f.startup}-badge.webp`}
            alt=""
            width={22}
            height={22}
            className="h-[22px] w-[22px]"
          />
        </span>
      </div>

      <div className="relative mt-1 ml-1 h-[88px] w-[88px]">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-gold/30 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"
        />
        <Image
          src={`/images/founders/${f.slug}.webp`}
          alt={`${f.name}, ${f.role} of ${f.company}`}
          width={88}
          height={88}
          className="relative h-full w-full rounded-full object-cover ring-4 ring-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      </div>

      <h4 className="mt-4 text-[16px] leading-tight font-bold text-ink">
        {f.name}
      </h4>
      <p className="mt-1 text-[13px] text-muted">{f.role}</p>

      <p className="mt-3.5 flex items-center gap-2 font-display text-[18px] font-bold tracking-[-0.01em] text-ink">
        <Image
          src={`/images/startups/${f.startup}-logo.webp`}
          alt=""
          width={26}
          height={26}
          className="h-[26px] w-[26px] shrink-0"
        />
        {f.company}
      </p>
      <p className="mt-2.5 mb-5 text-[13px] leading-[1.6] text-muted">
        {f.tagline[0]}
        <br />
        {f.tagline[1]}
      </p>

      <span className="chip mt-auto self-start">{f.sector}</span>
    </article>
  );
}
