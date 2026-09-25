import Link from "next/link";
import { ArrowRight } from "../icons";
import { eventDate, type SummitEvent } from "./events";

export function FormatBadge({
  e,
  dark = false,
}: {
  e: SummitEvent;
  dark?: boolean;
}) {
  const online = e.format === "Online";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-[12px] leading-none font-semibold ${
        dark
          ? "bg-white/10 text-white/85"
          : "bg-cream text-ink-soft ring-1 ring-line-soft"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${online ? "bg-green-bright" : "bg-gold"}`}
      />
      {online ? "Online" : e.city}
    </span>
  );
}

/* Ticket-style row: date stub, perforation, details, register cue. */
export default function EventTicket({ e }: { e: SummitEvent }) {
  const d = eventDate(e);
  return (
    <article className="card card-lift group relative flex overflow-hidden">
      <div className="relative flex w-[92px] shrink-0 flex-col items-center justify-center border-r border-dashed border-line bg-cream py-6 sm:w-[124px]">
        <span className="font-display text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          {d.weekday}
        </span>
        <span className="mt-1 font-display text-[40px] leading-none font-extrabold tracking-[-0.03em] text-ink sm:text-[48px]">
          {d.day}
        </span>
        <span className="mt-1 font-display text-[12px] font-bold tracking-[0.16em] text-gold-deep uppercase">
          {d.month}
        </span>
        {/* Perforation notches */}
        <span
          aria-hidden="true"
          className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-[var(--notch,#fff)] ring-1 ring-line-soft"
        />
        <span
          aria-hidden="true"
          className="absolute -right-3 -bottom-3 h-6 w-6 rounded-full bg-[var(--notch,#fff)] ring-1 ring-line-soft"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-7">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">{e.type}</span>
            <FormatBadge e={e} />
          </div>
          <h3 className="mt-3 text-[18px] leading-[1.25] font-bold tracking-[-0.01em] text-ink sm:text-[21px]">
            <Link
              href={`/events/${e.slug}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {e.title}
            </Link>
          </h3>
          <p className="mt-1.5 text-[13px] font-medium text-ink-soft">
            {d.time}
          </p>
          <p className="mt-2 hidden max-w-[640px] text-[14px] leading-[1.6] text-muted sm:line-clamp-2">
            {e.summary}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-line px-5 py-2.5 font-display text-[12px] font-bold tracking-[0.06em] text-ink uppercase transition-colors duration-200 group-hover:border-gold group-hover:bg-gold-btn group-hover:text-gold-ink sm:self-center">
          Register
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
