import type { Metadata } from "next";
import Image from "next/image";
import { LocalLink as Link } from "@/i18n/client";
import { format, formatNumber } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/server";
import { rich } from "@/i18n/rich";
import Roadmap from "@/components/demo-day/Roadmap";
import Countdown from "@/components/events/Countdown";
import { eventDate } from "@/components/events/events";
import Accordion from "@/components/faq/Accordion";
import Footer from "@/components/Footer";
import { ArrowRight, CalendarIcon, CheckIcon } from "@/components/icons";
import { stagesIn } from "@/components/Journey";
import Reveal from "@/components/motion/Reveal";
import Navbar from "@/components/Navbar";
import { featured } from "@/components/hero/founders";
import { testimonialsIn } from "@/components/results/data";
import TestimonialCard from "@/components/results/TestimonialCard";
import ButtonLink from "@/components/ui/ButtonLink";
import Eyebrow from "@/components/ui/Eyebrow";
import { FounderDot } from "@/components/startups/Monogram";
import { listPublicStartups } from "@/lib/application/public";
import { nextDemoDay } from "@/lib/events";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary()).demoDay;
  return { title: t.metaTitle, description: t.metaDescription };
}


/* The structure every founder is coached on: five beats in five minutes
   (their names and notes are in the dictionary, in this order). */
const PITCH_SECS = [60, 60, 90, 30, 60];
const PITCH_TOTAL = PITCH_SECS.reduce((s, p) => s + p, 0);

// Static, refreshed every minute and as soon as the API reports a change
// (cache tags). The data comes from the API, see lib/api.ts (BUILDING).
export const revalidate = 60;

export default async function DemoDayPage() {
  const [{ demoDay: t, events, landing }, locale] = await Promise.all([getDictionary(), getLocale()]);
  // The six stages and the (PLACEHOLDER) testimonials, in this language (landing dictionary).
  const stages = stagesIn(landing);
  const demo = stages.find((s) => s.id === "demo-day")!;
  const { left, right } = testimonialsIn(landing);
  const stories = [left[2], left[1], right[1]];
  const [next, startups] = await Promise.all([nextDemoDay(), listPublicStartups()]);
  const nextDate = next && eventDate(next, locale);
  const two = (n: number) => formatNumber(locale, n, { minimumIntegerDigits: 2 });
  const demoWeeks = demo.weeks;
  // Founders already in the cohort, from the API's directory (those with a photo first).
  const onStage = featured(
    startups.filter((s) => s.status === "cohort"),
    5,
    { sectors: landing.sectors, founder: landing.founders.founder },
  );

  return (
    <>
      <Navbar tone="dark" />
      <main id="main">
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-ink px-4 pt-[120px] pb-12 text-white sm:px-8 sm:pb-16 lg:pt-[calc(min(5.74vw,110px)+64px)]">
          <Image
            src="/images/hero.webp"
            alt=""
            fill
            preload
            quality={55}
            sizes="100vw"
            className="-z-20 object-cover object-[70%_center] opacity-70 rtl:object-[30%_center]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,var(--ink)_0%,rgba(20,26,34,0.94)_38%,rgba(20,26,34,0.55)_72%,rgba(20,26,34,0.35)_100%)] rtl:bg-[linear-gradient(260deg,var(--ink)_0%,rgba(20,26,34,0.94)_38%,rgba(20,26,34,0.55)_72%,rgba(20,26,34,0.35)_100%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent"
          />

          <div className="mx-auto max-w-[1720px] lg:px-6">
            <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div>
                <Reveal>
                  <Eyebrow tone="dark">
                    {format(t.hero.eyebrow, {
                      stage: two(stages.indexOf(demo) + 1),
                      total: two(stages.length),
                      weeks: demoWeeks,
                    })}
                  </Eyebrow>
                </Reveal>
                <Reveal delay={90}>
                  <h1 className="mt-5 font-display text-[56px] leading-[0.95] font-extrabold tracking-[-0.03em] uppercase sm:text-[84px] xl:text-[104px]">
                    {rich(t.hero.heading, {
                      accent: <span className="text-brand">{t.hero.headingAccent}</span>,
                    })}
                  </h1>
                </Reveal>
                <Reveal delay={180}>
                  <p className="mt-6 max-w-[540px] text-[17px] leading-[1.6] text-white/80 sm:text-[19px]">
                    {t.hero.lead}
                  </p>
                </Reveal>
                <Reveal
                  delay={260}
                  className="mt-8 flex flex-col gap-3 sm:flex-row"
                >
                  {next ? (
                    <ButtonLink href={`/events/${next.slug}`}>
                      {t.hero.reserve}
                    </ButtonLink>
                  ) : (
                    <ButtonLink href="/dashboard">{t.hero.apply}</ButtonLink>
                  )}
                  <ButtonLink href="#roadmap" variant="outline-dark">
                    {t.hero.roadmap}
                  </ButtonLink>
                </Reveal>
              </div>

              {/* Next Demo Day */}
              <Reveal
                delay={200}
                y={40}
                className="mx-auto w-full max-w-[520px]"
              >
                <div className="rounded-[28px] border border-white/12 bg-white/[0.06] p-6 shadow-[0_50px_100px_-50px_rgba(0,0,0,0.8)] backdrop-blur-sm sm:p-8">
                  {next && nextDate ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-brand px-3 py-1.5 text-[12px] leading-none font-bold text-white">
                          {t.hero.next}
                        </span>
                        <span className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] leading-none font-semibold text-white/85">
                          {next.format === "Online" ? events.online : <bdi>{next.city}</bdi>}
                        </span>
                      </div>
                      <p className="mt-5 font-display text-[26px] leading-tight font-bold tracking-[-0.02em] sm:text-[30px]">
                        <bdi>{next.title}</bdi>
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-[14px] text-white/70">
                        <CalendarIcon className="h-4 w-4 text-brand" />
                        {format(events.dateTime, { date: nextDate.long, time: nextDate.time })}
                      </p>
                      <div className="mt-6">
                        <Countdown to={next.start} t={events.countdown} />
                      </div>
                      <Link
                        href={`/events/${next.slug}`}
                        className="group mt-6 inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-brand uppercase"
                      >
                        {t.hero.details}
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] leading-none font-semibold text-white/85">
                        {t.hero.soon}
                      </span>
                      <p className="mt-5 font-display text-[26px] leading-tight font-bold">
                        {t.hero.scheduling}
                      </p>
                      <p className="mt-3 text-[14px] text-white/70">
                        {t.hero.newsletterFirst}
                      </p>
                      <Link
                        href="/newsletter"
                        className="mt-6 inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-brand uppercase"
                      >
                        {t.hero.subscribe}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </>
                  )}
                </div>
              </Reveal>
            </div>

            <Reveal delay={320} className="mt-14 border-t border-white/12 pt-8">
              <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {t.format.map((f) => (
                  <div key={f.label} className="flex flex-col-reverse">
                    <dt className="mt-1.5 text-[12px] font-semibold tracking-[0.08em] text-white/60 uppercase">
                      {f.label}
                    </dt>
                    <dd className="font-display text-[30px] leading-none font-extrabold tracking-[-0.02em] text-white sm:text-[36px]">
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* Roadmap */}
        <section
          id="roadmap"
          aria-labelledby="roadmap-title"
          className="scroll-mt-6 bg-cream px-4 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[1720px] lg:px-6">
            <div className="max-w-[720px]">
              <Reveal>
                <Eyebrow>{t.roadmap.eyebrow}</Eyebrow>
              </Reveal>
              <Reveal delay={90}>
                <h2 id="roadmap-title" className="title-section mt-4">
                  {rich(t.roadmap.heading, {
                    accent: <span className="text-brand-strong">{t.roadmap.headingAccent}</span>,
                  })}
                </h2>
              </Reveal>
              <Reveal delay={180}>
                <p className="lead mt-5">
                  {t.roadmap.lead}
                </p>
              </Reveal>
            </div>
            <div className="mt-12 lg:mt-16">
              <Roadmap stages={stages} t={t.roadmap} locale={locale} />
            </div>
            <p className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-muted">
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-[3px] w-6 rounded-full bg-brand"
                />
                {t.roadmap.inProgram}
              </span>
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-0 w-6 border-t-[3px] border-dashed border-brand/60"
                />
                {t.roadmap.afterProgram}
              </span>
              <Link
                href="/#program"
                className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-brand-strong"
              >
                {t.roadmap.allStages}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </p>
          </div>
        </section>

        {/* What it is */}
        <section
          id="what"
          aria-labelledby="what-title"
          className="scroll-mt-6 px-4 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto grid max-w-[1720px] items-center gap-12 lg:grid-cols-2 lg:gap-20 lg:px-6">
            <div>
              <Reveal>
                <Eyebrow>{t.what.eyebrow}</Eyebrow>
              </Reveal>
              <Reveal delay={90}>
                <h2 id="what-title" className="title-section mt-4">
                  {rich(t.what.heading, {
                    accent: <span className="text-brand-strong">{t.what.headingAccent}</span>,
                  })}
                </h2>
              </Reveal>
              <Reveal delay={180}>
                <p className="lead mt-6 max-w-[560px]">{t.what.lead1}</p>
                <p className="lead mt-4 max-w-[560px]">{t.what.lead2}</p>
              </Reveal>
              <Reveal delay={260}>
                <h3 className="mt-8 font-display text-[13px] font-bold tracking-[0.14em] text-muted uppercase">
                  {t.what.walkInTitle}
                </h3>
                <ul className="mt-4 grid gap-2.5">
                  {t.what.walkIn.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-[15px] leading-[1.5] text-ink-soft"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                        <CheckIcon className="h-3 w-3" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <Reveal delay={150} y={40} className="relative">
              <div className="relative overflow-hidden rounded-[28px] shadow-[0_40px_90px_-50px_rgba(20,26,34,0.5)]">
                {/* Stock photo, same as the join banner (Jud Mackrill, Unsplash License);
                    swap in a real Demo Day photo when there is one. */}
                <Image
                  src="/images/founders-at-work.webp"
                  alt={t.what.photoAlt}
                  width={1800}
                  height={1200}
                  quality={55}
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="aspect-[4/3] w-full object-cover object-center"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/70 to-transparent"
                />
                <p className="absolute inset-x-5 bottom-5 text-[13px] font-medium text-white/85 sm:start-6 sm:bottom-6">
                  {t.what.photoCaption}
                </p>
              </div>
              <div className="absolute -end-3 -top-5 rounded-[18px] border border-line-soft bg-white px-5 py-4 shadow-[0_24px_50px_-24px_rgba(20,26,34,0.35)] sm:-end-6">
                <p className="font-display text-[28px] leading-none font-extrabold tracking-[-0.02em] text-ink">
                  {t.what.badgeValue}
                </p>
                <p className="mt-1 text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
                  {t.what.badgeLabel}
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Before / on the day / after */}
        <section
          aria-labelledby="how-title"
          className="bg-cream px-4 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[1720px] lg:px-6">
            <Reveal>
              <Eyebrow>{t.how.eyebrow}</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <h2 id="how-title" className="title-section mt-4">
                {rich(t.how.heading, {
                  accent: <span className="text-brand-strong">{t.how.headingAccent}</span>,
                })}
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              <Reveal delay={120} className="card p-6 sm:p-7">
                <p className="font-display text-[11px] font-bold tracking-[0.14em] text-brand-strong uppercase">
                  {format(t.how.runUpLabel, { weeks: demoWeeks })}
                </p>
                <h3 className="mt-2 font-display text-[22px] leading-tight font-bold text-ink">
                  {t.how.runUpTitle}
                </h3>
                <ul className="mt-5 grid gap-3">
                  {t.how.runUp.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-[14px] leading-[1.55] text-ink-soft"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal
                delay={200}
                className="card border-brand/50 bg-[linear-gradient(160deg,#fff3eb,#fff_60%)] p-6 sm:p-7"
              >
                <p className="font-display text-[11px] font-bold tracking-[0.14em] text-brand-strong uppercase">
                  {t.how.dayLabel}
                </p>
                <h3 className="mt-2 font-display text-[22px] leading-tight font-bold text-ink">
                  {next && nextDate
                    ? format(t.how.dayTitle, { date: nextDate.dayLabel })
                    : t.how.dayTitleGeneric}
                </h3>
                <ol className="relative ms-1.5 mt-5 border-s-2 border-dashed border-chip-line ps-6">
                  {(next?.agenda.length ? next.agenda : t.how.agenda).map((a, i) => (
                    <li
                      key={i}
                      className="relative pb-4 last:pb-0"
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute -start-[31px] top-1.5 h-3 w-3 rounded-full ring-4 ring-white ${
                          i === 0 ? "bg-brand" : "bg-chip-line"
                        }`}
                      />
                      <p className="font-display text-[11px] font-bold tracking-[0.08em] text-brand-strong uppercase tabular-nums">
                        <bdi>{a.time}</bdi>
                      </p>
                      <p className="text-[14px] font-semibold text-ink">
                        <bdi>{a.item}</bdi>
                      </p>
                    </li>
                  ))}
                </ol>
              </Reveal>

              <Reveal delay={280} className="card p-6 sm:p-7">
                <p className="font-display text-[11px] font-bold tracking-[0.14em] text-brand-strong uppercase">
                  {t.how.afterLabel}
                </p>
                <h3 className="mt-2 font-display text-[22px] leading-tight font-bold text-ink">
                  {t.how.afterTitle}
                </h3>
                <ul className="mt-5 grid gap-3">
                  {t.how.after.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-[14px] leading-[1.55] text-ink-soft"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* The five-minute pitch */}
        <section
          aria-labelledby="pitch-title"
          className="px-4 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[1200px] lg:px-6">
            <div className="max-w-[640px]">
              <Reveal>
                <Eyebrow>{t.pitch.eyebrow}</Eyebrow>
              </Reveal>
              <Reveal delay={90}>
                <h2 id="pitch-title" className="title-section mt-4">
                  {rich(t.pitch.heading, {
                    accent: <span className="text-brand-strong">{t.pitch.headingAccent}</span>,
                  })}
                </h2>
              </Reveal>
              <Reveal delay={180}>
                <p className="lead mt-5">
                  {t.pitch.lead}
                </p>
              </Reveal>
            </div>

            <Reveal delay={240} className="mt-10">
              <div
                role="img"
                aria-label={t.pitch.beats
                  .map((p, i) =>
                    format(t.pitch.beatLabel, { beat: p.beat, secs: formatNumber(locale, PITCH_SECS[i]) }),
                  )
                  .join(t.pitch.join)}
                className="flex h-16 w-full gap-1 sm:h-20"
              >
                {t.pitch.beats.map((p, i) => (
                  <div
                    key={p.beat}
                    className="flex items-end overflow-hidden rounded-[10px] px-3 pb-2 first:rounded-s-[16px] last:rounded-e-[16px]"
                    style={{
                      flexBasis: `${(PITCH_SECS[i] / PITCH_TOTAL) * 100}%`,
                      background: `color-mix(in srgb, var(--brand) ${45 + i * 13}%, ${i % 2 ? "#fff" : "var(--brand-strong)"})`,
                    }}
                  >
                    <span className="font-display text-[12px] leading-none font-bold text-white sm:text-[13px]">
                      {format(t.pitch.secsShort, { secs: formatNumber(locale, PITCH_SECS[i]) })}
                    </span>
                  </div>
                ))}
              </div>
              <ol className="mt-6 grid gap-4 sm:grid-cols-5">
                {t.pitch.beats.map((p, i) => (
                  <li key={p.beat} className="border-t-2 border-line pt-4">
                    <p className="font-display text-[11px] font-bold tracking-[0.12em] text-brand-strong uppercase tabular-nums">
                      {format(t.pitch.beatHead, {
                        n: two(i + 1),
                        length:
                          PITCH_SECS[i] < 60
                            ? format(t.pitch.secs, { n: formatNumber(locale, PITCH_SECS[i]) })
                            : format(t.pitch.mins, { n: formatNumber(locale, PITCH_SECS[i] / 60) }),
                      })}
                    </p>
                    <p className="mt-1.5 font-display text-[17px] font-bold text-ink">
                      {p.beat}
                    </p>
                    <p className="mt-1 text-[13px] leading-[1.55] text-muted">
                      {p.note}
                    </p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        {/* By the numbers */}
        <section
          aria-labelledby="numbers-title"
          className="relative isolate overflow-hidden bg-night px-4 py-16 text-white sm:px-8 sm:py-24"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:50px_50px]"
          />
          <div
            aria-hidden="true"
            className="cta-glow absolute -end-24 -top-40 -z-10 h-[340px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgba(239,111,35,0.35),transparent)]"
          />
          <div className="mx-auto max-w-[1720px] lg:px-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-[560px]">
                <Reveal>
                  <Eyebrow tone="dark">{t.numbers.eyebrow}</Eyebrow>
                </Reveal>
                <Reveal delay={90}>
                  <h2
                    id="numbers-title"
                    className="mt-4 font-display text-[34px] leading-[1.05] font-bold tracking-[-0.025em] sm:text-[46px]"
                  >
                    {t.numbers.heading}
                  </h2>
                </Reveal>
              </div>
              <Reveal delay={180}>
                <p className="max-w-[420px] text-[15px] leading-[1.6] text-white/70">
                  {t.numbers.lead}
                </p>
              </Reveal>
            </div>
            <Reveal delay={240} className="mt-12">
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-white/10 bg-white/10 sm:grid-cols-3">
                {t.numbers.items.map((n) => (
                  <div
                    key={n.label}
                    className="flex flex-col-reverse justify-end bg-night px-5 py-7 sm:px-8 sm:py-9"
                  >
                    <dt className="mt-2.5 text-[11px] font-semibold tracking-[0.12em] text-white/55 uppercase">
                      {n.label}
                    </dt>
                    <dd className="font-display text-[32px] leading-none font-extrabold tracking-[-0.02em] text-white sm:text-[40px]">
                      {n.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* Stories */}
        <section
          aria-labelledby="stories-title"
          className="bg-cream px-4 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[1720px] lg:px-6">
            <div className="max-w-[680px]">
              <Reveal>
                <Eyebrow>{t.stories.eyebrow}</Eyebrow>
              </Reveal>
              <Reveal delay={90}>
                <h2 id="stories-title" className="title-section mt-4">
                  {rich(t.stories.heading, {
                    accent: <span className="text-brand-strong">{t.stories.headingAccent}</span>,
                  })}
                </h2>
              </Reveal>
            </div>
            <ul className="mt-10 grid gap-5 lg:grid-cols-3">
              {stories.map((story, i) => (
                <Reveal
                  as="li"
                  key={story.name}
                  delay={120 + i * 80}
                  className="flex"
                >
                  <TestimonialCard t={story} className="w-full" />
                </Reveal>
              ))}
            </ul>

            {onStage.length > 0 && (
              <Reveal
                delay={200}
                className="mt-12 flex flex-col gap-6 rounded-[24px] border border-line-soft bg-white p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <p className="font-display text-[13px] font-bold tracking-[0.14em] text-muted uppercase">
                    {t.stories.onStage}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-4">
                    {onStage.map((f) => (
                      <li key={f.slug}>
                        <Link
                          href={`/startups/${f.slug}`}
                          className="group flex items-center gap-3"
                        >
                          <span className="relative shrink-0">
                            <FounderDot
                              name={f.name}
                              photo={f.photo}
                              className="h-11 w-11 text-[13px] shadow-[0_6px_16px_-8px_rgba(20,26,34,0.4)]"
                            />
                            {f.logo && (
                              <Image
                                src={f.logo}
                                alt=""
                                width={18}
                                height={18}
                                unoptimized
                                className="absolute -end-1 -bottom-1 h-[18px] w-[18px] rounded-full bg-white object-cover ring-2 ring-white"
                              />
                            )}
                          </span>
                          <span className="leading-tight">
                            <bdi className="block text-[14px] font-bold text-ink transition-colors group-hover:text-brand-strong">
                              {f.name}
                            </bdi>
                            <bdi className="block text-[12px] text-muted">
                              {f.company}
                            </bdi>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/#founders"
                  className="group inline-flex shrink-0 items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-ink uppercase transition-colors duration-200 hover:text-brand-strong"
                >
                  {t.stories.portfolio}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Reveal>
            )}
          </div>
        </section>

        {/* Two ways in */}
        <section
          aria-labelledby="ways-title"
          className="px-4 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[1200px] lg:px-6">
            <h2 id="ways-title" className="sr-only">
              {t.ways.heading}
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              <Reveal className="card flex flex-col p-7 sm:p-9">
                <p className="font-display text-[11px] font-bold tracking-[0.14em] text-brand-strong uppercase">
                  {t.ways.audienceLabel}
                </p>
                <h3 className="mt-3 font-display text-[28px] leading-tight font-bold tracking-[-0.02em] text-ink">
                  {t.ways.audienceTitle}
                </h3>
                <p className="lead mt-3">
                  {next && nextDate
                    ? rich(t.ways.audienceLead, { title: <bdi>{next.title}</bdi>, date: nextDate.long })
                    : t.ways.audienceLeadNone}
                </p>
                <div className="mt-7">
                  <ButtonLink
                    href={next ? `/events/${next.slug}` : "/events"}
                    variant="outline"
                  >
                    {next ? t.ways.reserve : t.ways.allEvents}
                  </ButtonLink>
                </div>
              </Reveal>
              <Reveal
                delay={100}
                className="relative isolate flex flex-col overflow-hidden rounded-[18px] bg-[linear-gradient(120deg,var(--night)_0%,var(--ember)_55%,var(--brand-strong)_100%)] p-7 text-white sm:p-9"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_top_right,#000,transparent_75%)] rtl:[mask-image:radial-gradient(ellipse_at_top_left,#000,transparent_75%)]"
                />
                <p className="font-display text-[11px] font-bold tracking-[0.14em] text-brand-soft uppercase">
                  {t.ways.stageLabel}
                </p>
                <h3 className="mt-3 font-display text-[28px] leading-tight font-bold tracking-[-0.02em]">
                  {t.ways.stageTitle}
                </h3>
                <p className="mt-3 text-[16px] leading-[1.65] text-white/85">
                  {t.ways.stageLead}
                </p>
                <div className="mt-7">
                  <ButtonLink href="/dashboard" variant="white">
                    {t.ways.apply}
                  </ButtonLink>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          aria-labelledby="dd-faq-title"
          className="bg-cream px-4 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[760px]">
            <Reveal>
              <h2 id="dd-faq-title" className="title-section text-center">
                {rich(t.faq.heading, {
                  accent: <span className="text-brand-strong">{t.faq.headingAccent}</span>,
                })}
              </h2>
            </Reveal>
            <Reveal delay={120} className="mt-10">
              <Accordion items={t.faq.items} />
            </Reveal>
            <p className="mt-6 text-center text-[14px] text-muted">
              {rich(t.faq.more, {
                link: (
                  <Link
                    href="/contact"
                    className="font-semibold text-ink underline-offset-4 hover:underline"
                  >
                    {t.faq.ask}
                  </Link>
                ),
              })}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
