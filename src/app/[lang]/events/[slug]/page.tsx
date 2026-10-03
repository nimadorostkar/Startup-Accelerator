import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocalLink as Link } from "@/i18n/client";
import { format, plural } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/server";
import Countdown from "@/components/events/Countdown";
import EventTicket, { FormatBadge } from "@/components/events/EventTicket";
import { eventDate, googleCalendarUrl, isPast } from "@/components/events/events";
import RegisterForm from "@/components/events/RegisterForm";
import { rich } from "@/i18n/rich";
import Footer from "@/components/Footer";
import { ArrowRight, CalendarIcon, CheckIcon } from "@/components/icons";
import { UsersIcon } from "@/components/journey/icons";
import Navbar from "@/components/Navbar";
import { findEvent, upcomingEvents } from "@/lib/events";

// Rendered on first visit, then static: refreshed every minute and as soon
// as the API reports a change (cache tags). Unknown slugs are a 404.
export const revalidate = 60;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const e = await findEvent(slug);
  if (!e) notFound(); // keeps the 404 page's own title
  const t = (await getDictionary()).events.detail;
  return { title: format(t.metaTitle, { title: e.title }), description: e.summary };
}

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export default async function EventPage({
  params,
}: PageProps<"/[lang]/events/[slug]">) {
  const { slug } = await params;
  const e = await findEvent(slug);
  if (!e) notFound();

  const [{ events }, locale] = await Promise.all([getDictionary(), getLocale()]);
  const t = events.detail;
  const ended = isPast(e);
  const d = eventDate(e, locale);
  const more = (await upcomingEvents()).filter((x) => x.slug !== e.slug).slice(0, 3);

  const facts = [
    { Icon: CalendarIcon, label: d.long, sub: d.time },
    {
      Icon: PinIcon,
      label: e.format === "Online" ? events.online : <bdi>{e.city}</bdi>,
      sub: e.format === "Online" ? t.onlineNote : t.venueNote,
    },
    {
      Icon: UsersIcon,
      label: plural(locale, e.capacity, t.capacity),
      sub: t.free,
    },
  ];

  return (
    <>
      <Navbar />
      <main id="main">
        <header className="relative isolate bg-cream px-4 pt-[116px] pb-12 sm:px-8 sm:pb-16 lg:pt-[calc(min(5.74vw,110px)+56px)]">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(20,26,34,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(20,26,34,0.04)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_top_left,#000,transparent_70%)] rtl:[mask-image:radial-gradient(ellipse_at_top_right,#000,transparent_70%)]"
          />
          <div className="mx-auto max-w-[1200px] lg:px-6">
            <Link
              href="/events"
              className="group inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-muted uppercase transition-colors duration-200 hover:text-brand-strong"
            >
              <ArrowRight className="h-4 w-4 rotate-180 transition-transform duration-200 group-hover:-translate-x-1" />
              {t.allEvents}
            </Link>
            <div className="mt-7 flex flex-wrap items-center gap-2">
              <span className="chip">{events.types[e.type] ?? e.type}</span>
              <FormatBadge e={e} />
              {ended && (
                <span className="rounded-full bg-ink px-2.5 py-[5px] text-[12px] leading-none font-semibold text-white">
                  {events.ended}
                </span>
              )}
            </div>
            <h1 className="mt-5 max-w-[860px] font-display text-[36px] leading-[1.05] font-extrabold tracking-[-0.025em] text-balance text-ink sm:text-[56px]">
              <bdi>{e.title}</bdi>
            </h1>
            <p dir="auto" className="lead mt-5 max-w-[680px] sm:text-[18px]">
              {e.summary}
            </p>
            {e.type === "Demo Day" && (
              <Link
                href="/demo-day"
                className="group mt-5 inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-brand-strong uppercase"
              >
                {t.howDemoDayWorks}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </header>

        <div className="px-4 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16 lg:px-6">
            {/* Details */}
            <div className="order-2 lg:order-1">
              <ul className="grid gap-3 sm:grid-cols-3">
                {facts.map(({ Icon, label, sub }, i) => (
                  <li key={i} className="card p-5">
                    <Icon className="h-5 w-5 text-brand-strong" />
                    <p className="mt-3 text-[15px] leading-snug font-bold text-ink">
                      {label}
                    </p>
                    <p className="mt-1 text-[13px] leading-snug text-muted">
                      {sub}
                    </p>
                  </li>
                ))}
              </ul>

              <section aria-labelledby="about-title" className="mt-12">
                <h2
                  id="about-title"
                  className="font-display text-[24px] font-bold tracking-[-0.015em] text-ink"
                >
                  {t.about}
                </h2>
                {e.about.map((p, i) => (
                  <p
                    key={i}
                    dir="auto"
                    className="mt-4 text-[17px] leading-[1.75] text-ink-soft/90"
                  >
                    {p}
                  </p>
                ))}
              </section>

              {e.takeaways.length > 0 && (
                <section aria-labelledby="takeaways-title" className="mt-12">
                  <h2
                    id="takeaways-title"
                    className="font-display text-[24px] font-bold tracking-[-0.015em] text-ink"
                  >
                    {t.takeaways}
                  </h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {e.takeaways.map((item, i) => (
                      <li
                        key={i}
                        dir="auto"
                        className="flex gap-3 rounded-[14px] bg-cream p-4 text-[15px] leading-[1.5] text-ink-soft"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                          <CheckIcon className="h-3.5 w-3.5" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {e.agenda.length > 0 && (
                <section aria-labelledby="agenda-title" className="mt-12">
                  <h2
                    id="agenda-title"
                    className="font-display text-[24px] font-bold tracking-[-0.015em] text-ink"
                  >
                    {t.agenda}
                  </h2>
                  <p className="mt-1 text-[13px] text-muted">
                    {rich(t.timesIn, { zone: <bdi>{d.zone}</bdi> })}
                  </p>
                  <ol className="relative ms-2 mt-6 border-s-2 border-dashed border-line ps-7">
                    {e.agenda.map((a, i) => (
                      <li key={i} className="relative pb-7 last:pb-0">
                        <span
                          aria-hidden="true"
                          className={`absolute -start-[37px] top-1 h-4 w-4 rounded-full ring-4 ring-white ${
                            i === 0 ? "bg-brand" : "bg-line"
                          }`}
                        />
                        {/* From the API: kept beside the timeline, isolated from the page's direction */}
                        <p className="font-display text-[13px] font-bold tracking-[0.06em] text-brand-strong uppercase tabular-nums">
                          <bdi>{a.time}</bdi>
                        </p>
                        <p className="mt-1 text-[16px] font-semibold text-ink">
                          <bdi>{a.item}</bdi>
                        </p>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {e.audience.trim() && (
                <section
                  aria-labelledby="audience-title"
                  className="mt-12 rounded-[20px] border border-line-soft p-6"
                >
                  <h2
                    id="audience-title"
                    className="font-display text-[13px] font-bold tracking-[0.14em] text-muted uppercase"
                  >
                    {t.audience}
                  </h2>
                  <p dir="auto" className="mt-2 text-[16px] leading-[1.6] text-ink">
                    {e.audience}
                  </p>
                </section>
              )}
            </div>

            {/* Registration */}
            <aside
              aria-labelledby="register-title"
              className="order-1 lg:order-2"
            >
              <div className="card p-6 sm:p-7 lg:sticky lg:top-8">
                <h2
                  id="register-title"
                  className="font-display text-[22px] font-bold tracking-[-0.015em] text-ink"
                >
                  {ended ? t.endedTitle : t.register}
                </h2>
                {ended ? (
                  <>
                    <p className="mt-2 text-[14px] leading-[1.6] text-muted">
                      {t.endedLead}
                    </p>
                    <Link
                      href="/events#upcoming"
                      className="mt-6 flex h-12 items-center justify-center gap-2.5 rounded-full bg-brand-strong font-display text-[13px] font-bold tracking-[0.06em] text-white uppercase"
                    >
                      {t.upcoming}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="mt-1 mb-5 text-[14px] text-muted">{d.long}</p>
                    <Countdown to={e.start} tone="light" t={events.countdown} />
                    <div className="mt-6">
                      <RegisterForm
                        slug={e.slug}
                        calendarUrl={googleCalendarUrl(e, t.calendarOnline)}
                        t={events.register}
                      />
                    </div>
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>

        {more.length > 0 && (
          <section
            aria-labelledby="more-events"
            className="border-t border-line-soft bg-cream px-4 py-16 sm:px-8 sm:py-20"
          >
            <div className="mx-auto max-w-[1200px] lg:px-6">
              <div className="flex items-end justify-between gap-6">
                <h2 id="more-events" className="title-section">
                  {rich(t.more, {
                    accent: <span className="text-brand-strong">{t.moreAccent}</span>,
                  })}
                </h2>
                <Link
                  href="/events#upcoming"
                  className="group hidden items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] whitespace-nowrap text-ink uppercase transition-colors duration-200 hover:text-brand-strong sm:inline-flex"
                >
                  {t.fullCalendar}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
              <ul className="mt-10 grid gap-4 [--notch:var(--cream)]">
                {more.map((x) => (
                  <li key={x.slug}>
                    <EventTicket e={x} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
