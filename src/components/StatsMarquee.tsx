import type { Locale } from "@/i18n/config";
import { formatNumber } from "@/i18n/format";
import type { Messages } from "@/i18n/messages";
import { getDictionary, getLocale } from "@/i18n/server";

type Labels = Messages["landing"]["stats"];

/* PLACEHOLDER values — replace with Fundup Club's real numbers before launch.
   (The hero already shows $420B+, 180+ firms and 65+ markets, so they are not repeated here.) */
const STATS: { label: Exclude<keyof Labels, "label">; value: number; percent?: boolean }[] = [
  { label: "startups", value: 1200 },
  { label: "mentors", value: 3500 },
  { label: "founders", value: 25000 },
  { label: "exits", value: 120 },
  { label: "emerging", value: 0.3, percent: true },
];

/** "1,200+" / "1.200+" / "۱٬۲۰۰+"; "30%" / "%30" / "۳۰٪". */
function figure(locale: Locale, s: (typeof STATS)[number]) {
  return s.percent
    ? formatNumber(locale, s.value, { style: "percent" })
    : `${formatNumber(locale, s.value)}+`;
}

function Row({ t, locale, hidden = false }: { t: Labels; locale: Locale; hidden?: boolean }) {
  return (
    <ul className="flex shrink-0" aria-hidden={hidden || undefined}>
      {STATS.map((s) => (
        <li
          key={s.label}
          className="group relative w-[240px] shrink-0 border-s border-line-soft px-8 pt-9 pb-8 sm:w-[280px] sm:px-10 sm:pt-10 sm:pb-9"
        >
          <span
            aria-hidden="true"
            className="absolute top-0 start-8 h-[3px] w-9 rounded-b-full bg-brand transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-14 sm:start-10"
          />
          <p className="font-display text-[30px] leading-none font-extrabold tracking-[-0.01em] whitespace-nowrap text-ink sm:text-[36px]">
            {figure(locale, s)}
          </p>
          <p className="mt-3.5 font-display text-[11px] font-semibold tracking-[0.14em] whitespace-nowrap text-muted uppercase">
            {t[s.label]}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default async function StatsMarquee() {
  const [{ landing }, locale] = await Promise.all([getDictionary(), getLocale()]);
  const t = landing.stats;
  return (
    <section
      aria-label={t.label}
      className="marquee relative overflow-hidden bg-cream"
    >
      <div className="[mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <div className="marquee-track flex w-max [--marquee-dur:44s]">
          <Row t={t} locale={locale} />
          <Row t={t} locale={locale} hidden />
        </div>
      </div>
    </section>
  );
}
