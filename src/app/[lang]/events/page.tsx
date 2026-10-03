import type { Metadata } from "next";
import { LocalLink as Link } from "@/i18n/client";
import { format, plural } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/server";
import Countdown from "@/components/events/Countdown";
import EventTicket, { FormatBadge } from "@/components/events/EventTicket";
import { EVENT_TYPES, eventDate } from "@/components/events/events";
import { rich } from "@/i18n/rich";
import Footer from "@/components/Footer";
import { ArrowRight, CheckIcon } from "@/components/icons";
import Reveal from "@/components/motion/Reveal";
import Navbar from "@/components/Navbar";
import SubscribeForm from "@/components/newsletter/SubscribeForm";
import Eyebrow from "@/components/ui/Eyebrow";
import FilterList from "@/components/ui/FilterList";
import { pastEvents, upcomingEvents } from "@/lib/events";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary()).events.list;
  return { title: t.metaTitle, description: t.metaDescription };
}

// Static, refreshed every minute and as soon as the API reports a change
// (cache tags). The data comes from the API, see lib/api.ts (BUILDING).
export const revalidate = 60;

export default async function EventsPage() {
  const [{ events, newsletter }, locale] = await Promise.all([getDictionary(), getLocale()]);
  const t = events.list;
  const [upcoming, past] = await Promise.all([upcomingEvents(), pastEvents().then((p) => p.slice(0, 3))]);
  const featured = upcoming.find((e) => e.type === "Demo Day") ?? upcoming[0];
  const cities = new Set(
    upcoming.filter((e) => e.format === "In person").map((e) => e.city),
  );
  const perks = [t.perkFree, t.perkFormats, plural(locale, cities.size, t.perkCities)];
  const featuredDate = featured && eventDate(featured, locale);

  return (
    <>
      <Navbar />
      <main id="main">
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-cream px-4 pt-[120px] pb-16 sm:px-8 sm:pb-24 lg:pt-[calc(min(5.74vw,110px)+64px)]">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(20,26,34,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(20,26,34,0.045)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_30%_20%,#000,transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="absolute -top-40 -end-[10%] -z-10 h-[520px] w-[820px] rounded-full bg-[radial-gradient(closest-side,rgba(239,111,35,0.22),transparent)]"
          />

          <div className="mx-auto grid max-w-[1720px] items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:px-6">
            <div>
              <Reveal>
                <Eyebrow>{t.eyebrow}</Eyebrow>
              </Reveal>
              <Reveal delay={90}>
                <h1 className="mt-5 font-display text-[44px] leading-[0.98] font-extrabold tracking-[-0.03em] text-ink uppercase sm:text-[68px] xl:text-[84px]">
                  {rich(t.heading, {
                    accent: <span className="text-brand-strong">{t.headingAccent}</span>,
                  })}
                </h1>
              </Reveal>
              <Reveal delay={180}>
                <p className="lead mt-6 max-w-[520px] sm:text-[17px]">
                  {t.lead}
                </p>
              </Reveal>
              <Reveal delay={260}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#upcoming"
                    className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-brand-strong px-7 shadow-[0_16px_38px_-16px_rgba(194,71,10,0.85)] transition-[filter] duration-200 hover:brightness-105"
                  >
                    <span className="font-display text-[12px] font-bold tracking-[0.06em] text-white uppercase">
                      {t.browse}
                    </span>
                    <ArrowRight className="h-[18px] w-[18px] rotate-90 text-white rtl:-rotate-90" />
                  </a>
                </div>
                <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted">
                  {perks.map((p) => (
                    <li key={p} className="flex items-center gap-1.5">
                      <CheckIcon className="h-3.5 w-3.5 text-brand-strong" />
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
                  className="group relative isolate block overflow-hidden rounded-[28px] bg-night p-6 text-white shadow-[0_50px_100px_-50px_rgba(20,26,34,0.7)] sm:p-8"
                >
                  {/* Orbit art */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 400 400"
                    className="absolute -end-24 -top-24 -z-10 h-[340px] w-[340px] opacity-70 transition-transform duration-[1.5s] ease-out group-hover:rotate-12"
                    fill="none"
                  >
                    {[190, 140, 90].map((r) => (
                      <circle
                        key={r}
                        cx="200"
                        cy="200"
                        r={r}
                        stroke="#ef6f23"
                        strokeOpacity="0.3"
                        strokeDasharray="6 8"
                        strokeWidth="1.5"
                      />
                    ))}
                    <circle cx="200" cy="10" r="6" fill="#ef6f23" />
                    <circle
                      cx="340"
                      cy="200"
                      r="4"
                      fill="#ef6f23"
                      fillOpacity="0.7"
                    />
                    <circle cx="110" cy="200" r="5" fill="#e6c48f" />
                  </svg>
                  <div
                    aria-hidden="true"
                    className="absolute -start-24 -bottom-32 -z-10 h-[300px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(239,111,35,0.28),transparent)]"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand px-3 py-1.5 text-[12px] leading-none font-bold text-white">
                      {t.featured}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] leading-none font-semibold text-white/85">
                      {events.types[featured.type] ?? featured.type}
                    </span>
                    <FormatBadge e={featured} dark />
                  </div>
                  <h2 className="mt-6 max-w-[400px] font-display text-[30px] leading-[1.08] font-bold tracking-[-0.02em] sm:text-[38px]">
                    <bdi>{featured.title}</bdi>
                  </h2>
                  <p className="mt-3 text-[14px] text-white/70">
                    {featuredDate && format(events.dateTime, { date: featuredDate.long, time: featuredDate.time })}
                  </p>
                  <div className="mt-7">
                    <Countdown to={featured.start} t={events.countdown} />
                  </div>
                  <span className="mt-7 inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-brand uppercase">
                    {t.reserve}
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
              <Eyebrow>{t.calendarEyebrow}</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <h2 id="upcoming-title" className="title-section mt-4">
                {rich(t.upcoming, {
                  accent: <span className="text-brand-strong">{t.upcomingAccent}</span>,
                })}
              </h2>
            </Reveal>
            {upcoming.length ? (
              <FilterList
                label={t.filterLabel}
                allLabel={t.allEvents}
                noun={[t.noun.one, t.noun.other]}
                emptyText={t.emptyType}
                listClassName="mt-10 grid gap-4"
                categories={EVENT_TYPES}
                categoryLabels={events.types}
                items={upcoming.map((e) => ({
                  key: e.slug,
                  category: e.type,
                  node: <EventTicket e={e} />,
                }))}
              />
            ) : (
              <p className="lead mt-8">
                {t.empty}
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
                {t.recently}
              </h2>
              <ul className="mt-8 grid gap-4 sm:grid-cols-3">
                {past.map((e) => {
                  const d = eventDate(e, locale);
                  return (
                    <li key={e.slug}>
                      <Link
                        href={`/events/${e.slug}`}
                        className="card card-lift group block h-full p-6"
                      >
                        <span className="flex items-center justify-between text-[12px] text-muted">
                          <span className="font-semibold tracking-[0.08em] uppercase">
                            {d.monthDay}
                          </span>
                          <span className="rounded-full bg-cream px-2.5 py-1 font-semibold">
                            {events.ended}
                          </span>
                        </span>
                        <span className="mt-3 block text-[17px] leading-snug font-bold text-ink">
                          <bdi>{e.title}</bdi>
                        </span>
                        <span className="mt-2 block text-[13px] text-muted">
                          {events.types[e.type] ?? e.type} ·{" "}
                          {e.format === "Online" ? events.online : <bdi>{e.city}</bdi>}
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
          className="relative isolate overflow-hidden bg-night px-4 py-20 sm:px-8 sm:py-24"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:50px_50px]"
          />
          <div
            aria-hidden="true"
            className="cta-glow absolute -start-32 -bottom-40 -z-10 h-[340px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgba(239,111,35,0.5),transparent)] [--glow-dir:-1] rtl:[--glow-dir:1]"
          />
          <div className="mx-auto flex max-w-[1720px] flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="max-w-[560px]">
              <Reveal>
                <Eyebrow tone="dark">{t.subscribeEyebrow}</Eyebrow>
              </Reveal>
              <Reveal delay={90}>
                <h2
                  id="events-subscribe"
                  className="mt-5 font-display text-[36px] leading-[1.05] font-bold tracking-[-0.025em] text-white sm:text-[48px]"
                >
                  {t.subscribeHeading}
                </h2>
              </Reveal>
            </div>
            <Reveal delay={180} className="w-full lg:max-w-[520px]">
              <SubscribeForm source="events" tone="dark" t={newsletter.subscribe} />
              <p className="mt-4 px-5 text-[13px] text-white/60">
                {t.subscribeNote}{" "}
                <Link
                  href="/newsletter"
                  className="text-brand underline-offset-4 hover:underline"
                >
                  {t.pastIssues}
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
