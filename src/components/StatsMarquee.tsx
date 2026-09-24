/* PLACEHOLDER values — replace with VC Summit's real numbers before launch.
   (The hero already shows $420B+, 180+ firms and 65+ markets, so they are not repeated here.) */
const STATS = [
  { value: "1,200+", label: "Startups Built" },
  { value: "3,500+", label: "Mentors & Investors" },
  { value: "25,000+", label: "Founders Trained" },
  { value: "120+", label: "Company Exits" },
  { value: "30%", label: "Founders from Emerging Markets" },
];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0" aria-hidden={hidden || undefined}>
      {STATS.map((s) => (
        <li
          key={s.label}
          className="group relative w-[240px] shrink-0 border-l border-line-soft px-8 pt-9 pb-8 sm:w-[280px] sm:px-10 sm:pt-10 sm:pb-9"
        >
          <span
            aria-hidden="true"
            className="absolute top-0 left-8 h-[3px] w-9 rounded-b-full bg-gold transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-14 sm:left-10"
          />
          <p className="font-display text-[30px] leading-none font-extrabold tracking-[-0.01em] whitespace-nowrap text-ink sm:text-[36px]">
            {s.value}
          </p>
          <p className="mt-3.5 font-display text-[11px] font-semibold tracking-[0.14em] whitespace-nowrap text-muted uppercase">
            {s.label}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default function StatsMarquee() {
  return (
    <section
      aria-label="VC Summit in numbers"
      className="marquee relative overflow-hidden bg-cream"
    >
      <div className="[mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <div className="marquee-track flex w-max [--marquee-dur:44s]">
          <Row />
          <Row hidden />
        </div>
      </div>
    </section>
  );
}
