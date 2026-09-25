import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Countdown from "@/components/events/Countdown";
import EventTicket, { FormatBadge } from "@/components/events/EventTicket";
import {
  EVENTS,
  eventDate,
  findEvent,
  googleCalendarUrl,
  isPast,
  upcomingEvents,
} from "@/components/events/events";
import RegisterForm from "@/components/events/RegisterForm";
import Footer from "@/components/Footer";
import { ArrowRight, CalendarIcon, CheckIcon } from "@/components/icons";
import { UsersIcon } from "@/components/journey/icons";
import Navbar from "@/components/Navbar";

export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const e = findEvent(slug);
  if (!e) return {};
  return { title: `${e.title} — VC Summit Events`, description: e.summary };
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
}: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const e = findEvent(slug);
  if (!e) notFound();

  const ended = isPast(e);
  const d = eventDate(e);
  const more = upcomingEvents()
    .filter((x) => x.slug !== e.slug)
    .slice(0, 3);

  const facts = [
    { Icon: CalendarIcon, label: d.long, sub: d.time },
    {
      Icon: PinIcon,
      label: e.format === "Online" ? "Online" : e.city,
      sub:
        e.format === "Online"
          ? "Joining link sent after you register"
          : "Venue shared with registered guests",
    },
    {
      Icon: UsersIcon,
      label: `Up to ${e.capacity} guests`,
      sub: "Free to attend",
    },
  ];

  return (
    <>
      <Navbar />
      <main id="main">
        <header className="relative isolate bg-cream px-4 pt-[116px] pb-12 sm:px-8 sm:pb-16 lg:pt-[calc(min(5.74vw,110px)+56px)]">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(0,15,22,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,15,22,0.04)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_top_left,#000,transparent_70%)]"
          />
          <div className="mx-auto max-w-[1200px] lg:px-6">
            <Link
              href="/events"
              className="group inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-muted uppercase transition-colors duration-200 hover:text-gold-deep"
            >
              <ArrowRight className="h-4 w-4 rotate-180 transition-transform duration-200 group-hover:-translate-x-1" />
              All events
            </Link>
            <div className="mt-7 flex flex-wrap items-center gap-2">
              <span className="chip">{e.type}</span>
              <FormatBadge e={e} />
              {ended && (
                <span className="rounded-full bg-ink px-2.5 py-[5px] text-[12px] leading-none font-semibold text-white">
                  Ended
                </span>
              )}
            </div>
            <h1 className="mt-5 max-w-[860px] font-display text-[36px] leading-[1.05] font-extrabold tracking-[-0.025em] text-balance text-ink sm:text-[56px]">
              {e.title}
            </h1>
            <p className="lead mt-5 max-w-[680px] sm:text-[18px]">
              {e.summary}
            </p>
            {e.type === "Demo Day" && (
              <Link
                href="/demo-day"
                className="group mt-5 inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-gold-deep uppercase"
              >
                How Demo Day works
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
                {facts.map(({ Icon, label, sub }) => (
                  <li key={label} className="card p-5">
                    <Icon className="h-5 w-5 text-gold-deep" />
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
                  About this event
                </h2>
                {e.about.map((p) => (
                  <p
                    key={p}
                    className="mt-4 text-[17px] leading-[1.75] text-ink-soft/90"
                  >
                    {p}
                  </p>
                ))}
              </section>

              <section aria-labelledby="takeaways-title" className="mt-12">
                <h2
                  id="takeaways-title"
                  className="font-display text-[24px] font-bold tracking-[-0.015em] text-ink"
                >
                  What you&rsquo;ll get
                </h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {e.takeaways.map((t) => (
                    <li
                      key={t}
                      className="flex gap-3 rounded-[14px] bg-cream p-4 text-[15px] leading-[1.5] text-ink-soft"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-gold-ink">
                        <CheckIcon className="h-3.5 w-3.5" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="agenda-title" className="mt-12">
                <h2
                  id="agenda-title"
                  className="font-display text-[24px] font-bold tracking-[-0.015em] text-ink"
                >
                  Agenda
                </h2>
                <p className="mt-1 text-[13px] text-muted">
                  Times in {d.time.split(" ").pop()}
                </p>
                <ol className="relative mt-6 ml-2 border-l-2 border-dashed border-line pl-7">
                  {e.agenda.map((a, i) => (
                    <li
                      key={a.time + a.item}
                      className="relative pb-7 last:pb-0"
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute top-1 -left-[37px] h-4 w-4 rounded-full ring-4 ring-white ${
                          i === 0 ? "bg-gold" : "bg-line"
                        }`}
                      />
                      <p className="font-display text-[13px] font-bold tracking-[0.06em] text-gold-deep uppercase tabular-nums">
                        {a.time}
                      </p>
                      <p className="mt-1 text-[16px] font-semibold text-ink">
                        {a.item}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>

              <section
                aria-labelledby="audience-title"
                className="mt-12 rounded-[20px] border border-line-soft p-6"
              >
                <h2
                  id="audience-title"
                  className="font-display text-[13px] font-bold tracking-[0.14em] text-muted uppercase"
                >
                  Who it&rsquo;s for
                </h2>
                <p className="mt-2 text-[16px] leading-[1.6] text-ink">
                  {e.audience}
                </p>
              </section>
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
                  {ended ? "This event has ended" : "Register"}
                </h2>
                {ended ? (
                  <>
                    <p className="mt-2 text-[14px] leading-[1.6] text-muted">
                      Thanks to everyone who came. See what&rsquo;s coming up
                      next.
                    </p>
                    <Link
                      href="/events#upcoming"
                      className="mt-6 flex h-12 items-center justify-center gap-2.5 rounded-full bg-gold-btn font-display text-[13px] font-bold tracking-[0.06em] text-gold-ink uppercase"
                    >
                      Upcoming events
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="mt-1 mb-5 text-[14px] text-muted">{d.long}</p>
                    <Countdown to={e.start} tone="light" />
                    <div className="mt-6">
                      <RegisterForm
                        slug={e.slug}
                        calendarUrl={googleCalendarUrl(e)}
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
                  More <span className="text-gold-deep">events</span>
                </h2>
                <Link
                  href="/events#upcoming"
                  className="group hidden items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] whitespace-nowrap text-ink uppercase transition-colors duration-200 hover:text-gold-deep sm:inline-flex"
                >
                  Full calendar
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
