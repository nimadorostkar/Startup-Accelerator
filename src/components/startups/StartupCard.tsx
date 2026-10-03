import type { Locale } from "@/i18n/config";
import { LocalLink as Link } from "@/i18n/client";
import { format } from "@/i18n/format";
import type { Messages } from "@/i18n/messages";
import type { StartupCardData } from "@/lib/application/directory";
import { ArrowRight } from "../icons";
import {
  compactIn,
  dayIn,
  monthIn,
  optionLabel,
  stageName,
} from "./i18n";
import Monogram, { FounderDot } from "./Monogram";
import PublicStatusBadge from "./PublicStatusBadge";

export type StartupCardText = {
  card: Messages["startups"]["card"];
  options: Messages["startups"]["options"];
};

/* Used by the directory (client) and the startup page (server): the language
   and strings come in as props. */
export default function StartupCard({
  s,
  t,
  locale,
}: {
  s: StartupCardData;
  t: StartupCardText;
  locale: Locale;
}) {
  const founded = monthIn(locale, s.foundedOn);
  const facts = [
    stageName(t.options, s.stage),
    s.country,
    founded && format(t.card.founded, { date: founded }),
  ].filter(Boolean) as string[];
  const traction = [
    s.users !== null && format(t.card.users, { count: compactIn(locale, s.users) }),
    s.customers !== null &&
      format(t.card.customers, { count: compactIn(locale, s.customers) }),
  ].filter(Boolean) as string[];

  return (
    <article className="card card-lift group relative flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <Monogram name={s.name} logo={s.logo} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h3
              dir="auto"
              className="min-w-0 font-display text-[19px] leading-tight font-bold tracking-[-0.01em] wrap-anywhere text-ink"
            >
              <Link
                href={`/startups/${s.slug}`}
                className="after:absolute after:inset-0 after:content-['']"
              >
                {s.name}
              </Link>
            </h3>
            <PublicStatusBadge
              status={s.status}
              label={t.options.statuses[s.status]}
            />
          </div>
          {s.industry && (
            <p className="mt-1 text-[12px] font-semibold tracking-[0.06em] text-brand-strong uppercase">
              {optionLabel(t.options.industries, s.industry)}
            </p>
          )}
        </div>
      </div>

      <p
        dir="auto"
        className="mt-4 line-clamp-2 text-[15px] leading-[1.55] wrap-anywhere text-ink-soft/85"
      >
        {s.tagline || t.card.pitchSoon}
      </p>

      {facts.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 text-[13px] text-muted">
          {facts.map((f, i) => (
            <li
              key={i}
              className="flex min-w-0 items-center gap-3 wrap-anywhere"
            >
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="h-1 w-1 rounded-full bg-line"
                />
              )}
              <bdi>{f}</bdi>
            </li>
          ))}
        </ul>
      )}

      {traction.length > 0 && (
        <p className="mt-3 inline-flex flex-wrap gap-2">
          {traction.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </p>
      )}

      <div className="mt-auto flex items-end justify-between gap-4 pt-5">
        <div className="min-w-0">
          <div className="flex items-center">
            {s.founders.slice(0, 3).map((f, i) => (
              <FounderDot
                key={i}
                name={f}
                photo={f === s.founder.name ? s.founder.photo : undefined}
                className={`h-7 w-7 text-[10px] ${i > 0 ? "-ms-2" : ""}`}
              />
            ))}
            <span
              dir="auto"
              className="ms-2.5 truncate text-[13px] font-medium text-ink"
            >
              {s.founders.join(", ") || t.card.foundersSoon}
            </span>
          </div>
          {s.appliedAt && (
            <p className="mt-1.5 text-[12px] text-muted">
              {format(t.card.applied, { date: dayIn(locale, s.appliedAt) })}
            </p>
          )}
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-[background-color,border-color,color] duration-200 group-hover:border-brand group-hover:bg-brand-strong group-hover:text-white">
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
