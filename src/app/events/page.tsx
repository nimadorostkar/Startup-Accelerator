import type { Metadata } from "next";
import Link from "next/link";
import Countdown from "@/components/events/Countdown";
import EventTicket, { FormatBadge } from "@/components/events/EventTicket";
import {
  EVENT_TYPES,
  eventDate,
  pastEvents,
  upcomingEvents,
} from "@/components/events/events";
import Footer from "@/components/Footer";
import { ArrowRight, CheckIcon } from "@/components/icons";
import Reveal from "@/components/motion/Reveal";
import Navbar from "@/components/Navbar";
import SubscribeForm from "@/components/newsletter/SubscribeForm";
import Eyebrow from "@/components/ui/Eyebrow";
import FilterList from "@/components/ui/FilterList";

export const metadata: Metadata = {
  title: "Events — VC Summit",
  description:
    "Demo Days, workshops, office hours and founder meetups, online and in cities around the world. Free to attend.",
};

// Upcoming vs past is decided when the page renders, so refresh hourly.
export const revalidate = 3600;

export default function EventsPage() {
  const upcoming = upcomingEvents();
  const past = pastEvents().slice(0, 3);
  const featured = upcoming.find((e) => e.type === "Demo Day") ?? upcoming[0];
  const cities = new Set(
    upcoming.filter((e) => e.format === "In person").map((e) => e.city),
  );
  const perks = [
    "Free to attend",
    "Online and in person",
    `${cities.size} ${cities.size === 1 ? "city" : "cities"} this season`,
  ];

  return (
    <>
      <Navbar />
      <main id="main">
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-cream px-4 pt-[120px] pb-16 sm:px-8 sm:pb-24 lg:pt-[calc(min(5.74vw,110px)+64px)]">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(0,15,22,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,15,22,0.045)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_30%_20%,#000,transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="absolute -top-40 right-[-10%] -z-10 h-[520px] w-[820px] rounded-full bg-[radial-gradient(closest-side,rgba(221,158,66,0.22),transparent)]"
          />

          <div className="mx-auto grid max-w-[1720px] items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:px-6">
            <div>
              <Reveal>
                <Eyebrow>Events · Online and worldwide</Eyebrow>
              </Reveal>
              <Reveal delay={90}>
                <h1 className="mt-5 font-display text-[44px] leading-[0.98] font-extrabold tracking-[-0.03em] text-ink uppercase sm:text-[68px] xl:text-[84px]">
                  Meet the
                  <br />
                  <span className="text-gold-deep">network</span>
                  <br />
                  in person
                </h1>
              </Reveal>
              <Reveal delay={180}>
                <p className="lead mt-6 max-w-[520px] sm:text-[17px]">
                  Demo Days, hands-on workshops, investor office hours and
                  founder meetups. Come to learn, pitch, or just meet the people
                  building next to you.
                </p>
              </Reveal>
              <Reveal delay={260}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#upcoming"
                    className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-gold-btn px-7 shadow-[0_16px_38px_-16px_rgba(214,150,67,0.85)] transition-[filter] duration-200 hover:brightness-105"
                  >
                    <span className="font-display text-[12px] font-bold tracking-[0.06em] text-gold-ink uppercase">
                      Browse events
                    </span>
                    <ArrowRight className="h-[18px] w-[18px] rotate-90 text-gold-ink" />
                  </a>
                </div>
                <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted">
                  {perks.map((p) => (
                    <li key={p} className="flex items-center gap-1.5">
                      <CheckIcon className="h-3.5 w-3.5 text-gold-deep" />
                      {p}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            {featured && (
              <Reveal
                delay={200}
                y={40}
                className="mx-auto w-full max-w-[560px]"
              >
                <Link
                  href={`/events/${featured.slug}`}
                  className="group relative isolate block overflow-hidden rounded-[28px] bg-navy p-6 text-white shadow-[0_50px_100px_-50px_rgba(0,15,22,0.7)] sm:p-8"
                >
                  {/* Orbit art */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 400 400"
                    className="absolute -top-24 -right-24 -z-10 h-[340px] w-[340px] opacity-70 transition-transform duration-[1.5s] ease-out group-hover:rotate-12"
                    fill="none"
                  >
                    {[190, 140, 90].map((r) => (
                      <circle
                        key={r}
                        cx="200"
                        cy="200"
                        r={r}
                        stroke="#dd9e42"
                        strokeOpacity="0.3"
                        strokeDasharray="6 8"
                        strokeWidth="1.5"
                      />
                    ))}
                    <circle cx="200" cy="10" r="6" fill="#dd9e42" />
                    <circle
                      cx="340"
                      cy="200"
                      r="4"
                      fill="#dd9e42"
                      fillOpacity="0.7"
                    />
                    <circle cx="110" cy="200" r="5" fill="#e6c48f" />
                  </svg>
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-32 -left-24 -z-10 h-[300px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(221,158,66,0.28),transparent)]"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gold px-3 py-1.5 text-[12px] leading-none font-bold text-gold-ink">
                      Featured
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] leading-none font-semibold text-white/85">
                      {featured.type}
                    </span>
                    <FormatBadge e={featured} dark />
                  </div>
                  <h2 className="mt-6 max-w-[400px] font-display text-[30px] leading-[1.08] font-bold tracking-[-0.02em] sm:text-[38px]">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-[14px] text-white/70">
                    {eventDate(featured).long} · {eventDate(featured).time}
                  </p>
                  <div className="mt-7">
                    <Countdown to={featured.start} />
                  </div>
                  <span className="mt-7 inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-gold uppercase">
                    Reserve your spot
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            )}
          </div>
        </section>

        {/* Upcoming */}
        <section
          id="upcoming"
          aria-labelledby="upcoming-title"
          className="scroll-mt-8 px-4 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[1200px] lg:px-6">
            <Reveal>
              <Eyebrow>Calendar</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <h2 id="upcoming-title" className="title-section mt-4">
                Upcoming <span className="text-gold-deep">events</span>
              </h2>
            </Reveal>
            {upcoming.length ? (
              <FilterList
                label="Filter by event type"
                allLabel="All events"
                noun={["event", "events"]}
                emptyText="Nothing of this type on the calendar right now. Check back soon."
                listClassName="mt-10 grid gap-4"
                categories={EVENT_TYPES}
                items={upcoming.map((e) => ({
                  key: e.slug,
                  category: e.type,
                  node: <EventTicket e={e} />,
                }))}
              />
            ) : (
              <p className="lead mt-8">
                New events are being scheduled. Subscribe below to hear first.
              </p>
            )}
          </div>
        </section>

        {/* Past */}
        {past.length > 0 && (
          <section
            aria-labelledby="past-title"
            className="bg-cream px-4 py-16 sm:px-8 sm:py-20"
          >
            <div className="mx-auto max-w-[1200px] lg:px-6">
              <h2
                id="past-title"
                className="font-display text-[26px] font-bold tracking-[-0.015em] text-ink sm:text-[30px]"
              >
                Recently
              </h2>
              <ul className="mt-8 grid gap-4 sm:grid-cols-3">
                {past.map((e) => {
                  const d = eventDate(e);
                  return (
                    <li key={e.slug}>
                      <Link
                        href={`/events/${e.slug}`}
                        className="card card-lift group block h-full p-6"
                      >
                        <span className="flex items-center justify-between text-[12px] text-muted">
                          <span className="font-semibold tracking-[0.08em] uppercase">
                            {d.month} {d.day}
                          </span>
                          <span className="rounded-full bg-cream px-2.5 py-1 font-semibold">
                            Ended
                          </span>
                        </span>
                        <span className="mt-3 block text-[17px] leading-snug font-bold text-ink">
                          {e.title}
                        </span>
                        <span className="mt-2 block text-[13px] text-muted">
                          {e.type} · {e.format === "Online" ? "Online" : e.city}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {/* Subscribe */}
        <section
          aria-labelledby="events-subscribe"
          className="relative isolate overflow-hidden bg-navy px-4 py-20 sm:px-8 sm:py-24"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:50px_50px]"
          />
          <div
            aria-hidden="true"
            className="cta-glow absolute -bottom-40 -left-32 -z-10 h-[340px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgba(44,110,65,0.5),transparent)] [--glow-dir:-1]"
          />
          <div className="mx-auto flex max-w-[1720px] flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="max-w-[560px]">
              <Reveal>
                <Eyebrow tone="dark">Don&rsquo;t miss the next one</Eyebrow>
              </Reveal>
              <Reveal delay={90}>
                <h2
                  id="events-subscribe"
                  className="mt-5 font-display text-[36px] leading-[1.05] font-bold tracking-[-0.025em] text-white sm:text-[48px]"
                >
                  New events land in the newsletter first.
                </h2>
              </Reveal>
            </div>
            <Reveal delay={180} className="w-full lg:max-w-[520px]">
              <SubscribeForm source="events" tone="dark" />
              <p className="mt-4 px-5 text-[13px] text-white/60">
                The Founder Brief, every other Thursday.{" "}
                <Link
                  href="/newsletter"
                  className="text-gold underline-offset-4 hover:underline"
                >
                  See past issues
                </Link>
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
