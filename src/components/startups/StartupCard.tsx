import Link from "next/link";
import {
  compact,
  formatDay,
  formatMonth,
  type StartupCardData,
} from "@/lib/application/directory";
import { ArrowRight } from "../icons";
import Monogram, { FounderDot } from "./Monogram";
import PublicStatusBadge from "./PublicStatusBadge";

export default function StartupCard({ s }: { s: StartupCardData }) {
  const facts = [
    s.stageLabel !== "Not set" && s.stageLabel,
    s.country,
    formatMonth(s.foundedOn) && `Founded ${formatMonth(s.foundedOn)}`,
  ].filter(Boolean) as string[];
  const traction = [
    s.users !== null && `${compact(s.users)} users`,
    s.customers !== null && `${compact(s.customers)} customers`,
  ].filter(Boolean) as string[];

  return (
    <article className="card card-lift group relative flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <Monogram name={s.name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h3 className="font-display text-[19px] leading-tight font-bold tracking-[-0.01em] text-ink">
              <Link
                href={`/startups/${s.slug}`}
                className="after:absolute after:inset-0 after:content-['']"
              >
                {s.name}
              </Link>
            </h3>
            <PublicStatusBadge status={s.status} />
          </div>
          {s.industry && (
            <p className="mt-1 text-[12px] font-semibold tracking-[0.06em] text-gold-deep uppercase">
              {s.industry}
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-[15px] leading-[1.55] text-ink-soft/85">
        {s.tagline || "One-line pitch coming soon."}
      </p>

      {facts.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 text-[13px] text-muted">
          {facts.map((f, i) => (
            <li key={f} className="flex items-center gap-3">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="h-1 w-1 rounded-full bg-line"
                />
              )}
              {f}
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
                key={f}
                name={f}
                className={`h-7 w-7 text-[10px] ${i > 0 ? "-ml-2" : ""}`}
              />
            ))}
            <span className="ml-2.5 truncate text-[13px] font-medium text-ink">
              {s.founders.join(", ") || "Founders to be announced"}
            </span>
          </div>
          {s.appliedAt && (
            <p className="mt-1.5 text-[12px] text-muted">
              Applied {formatDay(s.appliedAt)}
            </p>
          )}
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-[background-color,border-color,color] duration-200 group-hover:border-gold group-hover:bg-gold-btn group-hover:text-gold-ink">
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
