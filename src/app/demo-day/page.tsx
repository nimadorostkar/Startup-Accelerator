import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Roadmap from "@/components/demo-day/Roadmap";
import Countdown from "@/components/events/Countdown";
import { eventDate, upcomingEvents } from "@/components/events/events";
import Accordion, { type QA } from "@/components/faq/Accordion";
import Footer from "@/components/Footer";
import { ArrowRight, CalendarIcon, CheckIcon } from "@/components/icons";
import { STAGES } from "@/components/Journey";
import Reveal from "@/components/motion/Reveal";
import Navbar from "@/components/Navbar";
import { FOUNDERS } from "@/components/portfolio/data";
import { LEFT, RIGHT } from "@/components/results/data";
import TestimonialCard from "@/components/results/TestimonialCard";
import ButtonLink from "@/components/ui/ButtonLink";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Demo Day — VC Summit",
  description:
    "Ten weeks of building, one afternoon on stage. How Demo Day works, where it sits in the six-stage program, and what founders walk away with.",
};

// "Next Demo Day" depends on today's date, so refresh hourly.
export const revalidate = 3600;

const DEMO = STAGES.find((s) => s.id === "demo-day")!;
const STAGE_NO = STAGES.indexOf(DEMO) + 1;

/* Format facts, not outcomes. PLACEHOLDER network figures match the landing page. */
const FORMAT = [
  { value: "20", label: "Startups on stage" },
  { value: "5 min", label: "Per pitch, then questions" },
  { value: "180+", label: "Firms in the network" },
  { value: "1:1", label: "Investor meetings after" },
];

const NUMBERS = [
  { value: "$420B+", label: "Capital represented" },
  { value: "180+", label: "Investment firms" },
  { value: "65+", label: "Markets" },
  { value: "1,200+", label: "Startups built" },
  { value: "120+", label: "Company exits" },
  { value: "30%", label: "Founders from emerging markets" },
];

const WALK_IN_WITH = [
  "A pitch-ready deck, rehearsed in two mock Demo Days",
  "A data room: cap table, monthly metrics, 18-month model",
  "A shortlist of matched investors in the room",
  "Three customers who will take a reference call",
];

const RUN_UP = [
  "Pitch coaching twice a week with program mentors",
  "Deck and narrative reviews until the story is one sentence",
  "Two mock Demo Days in front of investor panels",
  "Data room check: what investors will ask for, ready before they ask",
  "Investor matching by sector, stage and geography",
];

const AFTER = [
  "Investors mark the founders they want to meet",
  "Introductions go out within 48 hours",
  "Follow-up meetings in the two weeks after",
  "Post-program mentorship through the Scale stage",
];

/* The structure every founder is coached on: five beats in five minutes. */
const PITCH = [
  {
    beat: "Problem",
    secs: 60,
    note: "Who has it, and what it costs them today",
  },
  { beat: "Product", secs: 60, note: "What you shipped and how it solves it" },
  { beat: "Traction", secs: 90, note: "Users, revenue and what is growing" },
  { beat: "Team", secs: 30, note: "Why you are the ones to build this" },
  { beat: "The ask", secs: 60, note: "How much, and what it buys" },
];
const PITCH_TOTAL = PITCH.reduce((s, p) => s + p.secs, 0);

const STORIES = [LEFT[2], LEFT[1], RIGHT[1]];

/* PLACEHOLDER ANSWERS — confirm attendance rules and streaming before launch. */
const FAQS: QA[] = [
  {
    q: "Who can attend Demo Day?",
    a: "Investors, founders, mentors and anyone considering the program. Seats are free but limited, so register on the event page.",
  },
  {
    q: "Do I have to be in the program to pitch?",
    a: "Yes. Founders pitch at the Demo Day that closes their cohort. If you want to be on stage, apply to the next cohort.",
  },
  {
    q: "How long is a pitch?",
    a: "Five minutes, followed by questions from the room. The coaching in weeks 9–10 is built around exactly that format.",
  },
  {
    q: "What happens after the pitches?",
    a: "Investors mark the founders they want to meet. Introductions go out within 48 hours, and one-to-one meetings follow in the two weeks after.",
  },
  {
    q: "Is there a prize?",
    a: "No. Demo Day isn't a competition; it's an introduction. The pitch opens the door, and the meetings after it are the point.",
  },
];

export default function DemoDayPage() {
  const next = upcomingEvents().find((e) => e.type === "Demo Day");
  const nextDate = next && eventDate(next);

  return (
    <>
      <Navbar tone="dark" />
      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-ink px-4 pt-[120px] pb-12 text-white sm:px-8 sm:pb-16 lg:pt-[calc(min(5.74vw,110px)+64px)]">
          <Image
            src="/images/hero.webp"
            alt=""
            fill
            preload
            quality={55}
            sizes="100vw"
            className="-z-20 object-cover object-[70%_center] opacity-70"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,var(--ink)_0%,rgba(0,15,22,0.94)_38%,rgba(0,15,22,0.55)_72%,rgba(0,15,22,0.35)_100%)]"
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
                    Stage {String(STAGE_NO).padStart(2, "0")} of{" "}
                    {String(STAGES.length).padStart(2, "0")} · {DEMO.weeks}
                  </Eyebrow>
                </Reveal>
                <Reveal delay={90}>
                  <h1 className="mt-5 font-display text-[56px] leading-[0.95] font-extrabold tracking-[-0.03em] uppercase sm:text-[84px] xl:text-[104px]">
                    Demo <span className="text-gold">Day</span>
                  </h1>
                </Reveal>
                <Reveal delay={180}>
                  <p className="mt-6 max-w-[540px] text-[17px] leading-[1.6] text-white/80 sm:text-[19px]">
                    Ten weeks of building, one afternoon on stage. Twenty
                    founders pitch to investors from 180+ firms, then meet the
                    ones who want to go deeper, one to one.
                  </p>
                </Reveal>
                <Reveal
                  delay={260}
                  className="mt-8 flex flex-col gap-3 sm:flex-row"
                >
                  {next ? (
                    <ButtonLink href={`/events/${next.slug}`}>
                      Reserve a seat
                    </ButtonLink>
                  ) : (
                    <ButtonLink href="/dashboard">Apply to pitch</ButtonLink>
                  )}
                  <ButtonLink href="#roadmap" variant="outline-dark">
                    See the roadmap
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
                        <span className="rounded-full bg-gold px-3 py-1.5 text-[12px] leading-none font-bold text-gold-ink">
                          Next Demo Day
                        </span>
                        <span className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] leading-none font-semibold text-white/85">
                          {next.format === "Online" ? "Online" : next.city}
                        </span>
                      </div>
                      <p className="mt-5 font-display text-[26px] leading-tight font-bold tracking-[-0.02em] sm:text-[30px]">
                        {next.title}
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-[14px] text-white/70">
                        <CalendarIcon className="h-4 w-4 text-gold" />
                        {nextDate.long} · {nextDate.time}
                      </p>
                      <div className="mt-6">
                        <Countdown to={next.start} />
                      </div>
                      <Link
                        href={`/events/${next.slug}`}
                        className="group mt-6 inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-gold uppercase"
                      >
                        Event details and registration
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] leading-none font-semibold text-white/85">
                        Next date coming soon
                      </span>
                      <p className="mt-5 font-display text-[26px] leading-tight font-bold">
                        The next Demo Day is being scheduled.
                      </p>
                      <p className="mt-3 text-[14px] text-white/70">
                        New dates land in the newsletter first.
                      </p>
                      <Link
                        href="/newsletter"
                        className="mt-6 inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-gold uppercase"
                      >
                        Subscribe
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </>
                  )}
                </div>
              </Reveal>
            </div>

            <Reveal delay={320} className="mt-14 border-t border-white/12 pt-8">
              <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {FORMAT.map((f) => (
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
                <Eyebrow>The program roadmap</Eyebrow>
              </Reveal>
              <Reveal delay={90}>
                <h2 id="roadmap-title" className="title-section mt-4">
                  Six stages. One that
                  <br />
                  <span className="text-gold-deep">changes everything.</span>
                </h2>
              </Reveal>
              <Reveal delay={180}>
                <p className="lead mt-5">
                  Ten weeks from the first customer conversation to the stage.
                  Demo Day is stage five: where the work of the first eight
                  weeks meets the people who fund it. Everything before it
                  builds toward it, and everything after it builds on it.
                </p>
              </Reveal>
            </div>
            <div className="mt-12 lg:mt-16">
              <Roadmap />
            </div>
            <p className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-muted">
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-[3px] w-6 rounded-full bg-gold"
                />
                In the ten-week program
              </span>
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-0 w-6 border-t-[3px] border-dashed border-gold/60"
                />
                After the program
              </span>
              <Link
                href="/#program"
                className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-gold-deep"
              >
                All six stages in detail
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
                <Eyebrow>What it is</Eyebrow>
              </Reveal>
              <Reveal delay={90}>
                <h2 id="what-title" className="title-section mt-4">
                  The afternoon the
                  <br />
                  <span className="text-gold-deep">
                    program is built around
                  </span>
                </h2>
              </Reveal>
              <Reveal delay={180}>
                <p className="lead mt-6 max-w-[560px]">
                  Demo Day closes every cohort. Each founder takes the stage for
                  a five-minute pitch in front of investors from our network,
                  then meets the ones who want to go deeper, one to one.
                </p>
                <p className="lead mt-4 max-w-[560px]">
                  It isn&rsquo;t a competition and there is no prize. The pitch
                  is the door; the meetings after it are the point.
                </p>
              </Reveal>
              <Reveal delay={260}>
                <h3 className="mt-8 font-display text-[13px] font-bold tracking-[0.14em] text-muted uppercase">
                  What every founder walks in with
                </h3>
                <ul className="mt-4 grid gap-2.5">
                  {WALK_IN_WITH.map((t) => (
                    <li
                      key={t}
                      className="flex gap-3 text-[15px] leading-[1.5] text-ink-soft"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold text-gold-ink">
                        <CheckIcon className="h-3 w-3" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <Reveal delay={150} y={40} className="relative">
              <div className="relative overflow-hidden rounded-[28px] shadow-[0_40px_90px_-50px_rgba(0,15,22,0.5)]">
                {/* PLACEHOLDER photo — same third-party image as the join banner; replace before launch. */}
                <Image
                  src="/images/cohort.webp"
                  alt="A cohort of founders and mentors together at a program event"
                  width={1441}
                  height={987}
                  quality={55}
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="aspect-[4/3] w-full object-cover object-[60%_center]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/70 to-transparent"
                />
                <p className="absolute bottom-5 left-5 right-5 text-[13px] font-medium text-white/85 sm:bottom-6 sm:left-6">
                  The cohort, mentors and investors after a Demo Day.
                </p>
              </div>
              <div className="absolute -top-5 -right-3 rounded-[18px] border border-line-soft bg-white px-5 py-4 shadow-[0_24px_50px_-24px_rgba(0,15,22,0.35)] sm:-right-6">
                <p className="font-display text-[28px] leading-none font-extrabold tracking-[-0.02em] text-ink">
                  180+
                </p>
                <p className="mt-1 text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
                  Firms in the network
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
              <Eyebrow>How it works</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <h2 id="how-title" className="title-section mt-4">
                Before, on the day,{" "}
                <span className="text-gold-deep">after</span>
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              <Reveal delay={120} className="card p-6 sm:p-7">
                <p className="font-display text-[11px] font-bold tracking-[0.14em] text-gold-deep uppercase">
                  {DEMO.weeks} · The run-up
                </p>
                <h3 className="mt-2 font-display text-[22px] leading-tight font-bold text-ink">
                  Two weeks of pitch prep
                </h3>
                <ul className="mt-5 grid gap-3">
                  {RUN_UP.map((t) => (
                    <li
                      key={t}
                      className="flex gap-3 text-[14px] leading-[1.55] text-ink-soft"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                      />
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal
                delay={200}
                className="card border-gold/50 bg-[linear-gradient(160deg,#fff6e3,#fff_60%)] p-6 sm:p-7"
              >
                <p className="font-display text-[11px] font-bold tracking-[0.14em] text-gold-deep uppercase">
                  The day
                </p>
                <h3 className="mt-2 font-display text-[22px] leading-tight font-bold text-ink">
                  {next
                    ? `How ${nextDate?.weekday} ${nextDate?.month} ${nextDate?.day} runs`
                    : "How the afternoon runs"}
                </h3>
                <ol className="relative mt-5 ml-1.5 border-l-2 border-dashed border-chip-line pl-6">
                  {(
                    next?.agenda ?? [
                      { time: "4:00 PM", item: "Doors open and check-in" },
                      {
                        time: "4:30 PM",
                        item: "Welcome from the program team",
                      },
                      { time: "4:45 PM", item: "Founder pitches" },
                      {
                        time: "7:15 PM",
                        item: "Reception and investor meetings",
                      },
                    ]
                  ).map((a, i) => (
                    <li
                      key={a.time + a.item}
                      className="relative pb-4 last:pb-0"
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute top-1.5 -left-[31px] h-3 w-3 rounded-full ring-4 ring-white ${
                          i === 0 ? "bg-gold" : "bg-chip-line"
                        }`}
                      />
                      <p className="font-display text-[11px] font-bold tracking-[0.08em] text-gold-deep uppercase tabular-nums">
                        {a.time}
                      </p>
                      <p className="text-[14px] font-semibold text-ink">
                        {a.item}
                      </p>
                    </li>
                  ))}
                </ol>
              </Reveal>

              <Reveal delay={280} className="card p-6 sm:p-7">
                <p className="font-display text-[11px] font-bold tracking-[0.14em] text-gold-deep uppercase">
                  After · Fundraise and Scale
                </p>
                <h3 className="mt-2 font-display text-[22px] leading-tight font-bold text-ink">
                  Where the round happens
                </h3>
                <ul className="mt-5 grid gap-3">
                  {AFTER.map((t) => (
                    <li
                      key={t}
                      className="flex gap-3 text-[14px] leading-[1.55] text-ink-soft"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                      />
                      {t}
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
                <Eyebrow>The pitch</Eyebrow>
              </Reveal>
              <Reveal delay={90}>
                <h2 id="pitch-title" className="title-section mt-4">
                  Five minutes,{" "}
                  <span className="text-gold-deep">five beats</span>
                </h2>
              </Reveal>
              <Reveal delay={180}>
                <p className="lead mt-5">
                  The structure every founder is coached on. Investors hear
                  twenty pitches in an afternoon; the ones they remember answer
                  these five questions in this order.
                </p>
              </Reveal>
            </div>

            <Reveal delay={240} className="mt-10">
              <div
                role="img"
                aria-label={PITCH.map(
                  (p) => `${p.beat}: ${p.secs} seconds`,
                ).join(", ")}
                className="flex h-16 w-full gap-1 sm:h-20"
              >
                {PITCH.map((p, i) => (
                  <div
                    key={p.beat}
                    className="flex items-end overflow-hidden rounded-[10px] px-3 pb-2 first:rounded-l-[16px] last:rounded-r-[16px]"
                    style={{
                      flexBasis: `${(p.secs / PITCH_TOTAL) * 100}%`,
                      background: `color-mix(in srgb, var(--gold) ${45 + i * 13}%, ${i % 2 ? "#fff" : "var(--gold-deep)"})`,
                    }}
                  >
                    <span className="font-display text-[12px] leading-none font-bold text-gold-ink sm:text-[13px]">
                      {p.secs}s
                    </span>
                  </div>
                ))}
              </div>
              <ol className="mt-6 grid gap-4 sm:grid-cols-5">
                {PITCH.map((p, i) => (
                  <li key={p.beat} className="border-t-2 border-line pt-4">
                    <p className="font-display text-[11px] font-bold tracking-[0.12em] text-gold-deep uppercase tabular-nums">
                      {String(i + 1).padStart(2, "0")} ·{" "}
                      {p.secs < 60 ? `${p.secs} sec` : `${p.secs / 60} min`}
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
          className="relative isolate overflow-hidden bg-navy px-4 py-16 text-white sm:px-8 sm:py-24"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:50px_50px]"
          />
          <div
            aria-hidden="true"
            className="cta-glow absolute -top-40 -right-24 -z-10 h-[340px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgba(221,158,66,0.35),transparent)]"
          />
          <div className="mx-auto max-w-[1720px] lg:px-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-[560px]">
                <Reveal>
                  <Eyebrow tone="dark">The room</Eyebrow>
                </Reveal>
                <Reveal delay={90}>
                  <h2
                    id="numbers-title"
                    className="mt-4 font-display text-[34px] leading-[1.05] font-bold tracking-[-0.025em] sm:text-[46px]"
                  >
                    Who&rsquo;s on the other side of the stage
                  </h2>
                </Reveal>
              </div>
              <Reveal delay={180}>
                <p className="max-w-[420px] text-[15px] leading-[1.6] text-white/70">
                  The network founders pitch into, and the track record behind
                  it. Figures across the program to date.
                </p>
              </Reveal>
            </div>
            <Reveal delay={240} className="mt-12">
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-white/10 bg-white/10 sm:grid-cols-3">
                {NUMBERS.map((n) => (
                  <div
                    key={n.label}
                    className="flex flex-col-reverse justify-end bg-navy px-5 py-7 sm:px-8 sm:py-9"
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
                <Eyebrow>After the stage</Eyebrow>
              </Reveal>
              <Reveal delay={90}>
                <h2 id="stories-title" className="title-section mt-4">
                  From Demo Day{" "}
                  <span className="text-gold-deep">to funded</span>
                </h2>
              </Reveal>
            </div>
            <ul className="mt-10 grid gap-5 lg:grid-cols-3">
              {STORIES.map((t, i) => (
                <Reveal
                  as="li"
                  key={t.name}
                  delay={120 + i * 80}
                  className="flex"
                >
                  <TestimonialCard t={t} className="w-full" />
                </Reveal>
              ))}
            </ul>

            <Reveal
              delay={200}
              className="mt-12 flex flex-col gap-6 rounded-[24px] border border-line-soft bg-white p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <p className="font-display text-[13px] font-bold tracking-[0.14em] text-muted uppercase">
                  Founders who have taken the stage
                </p>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-4">
                  {FOUNDERS.map((f) => (
                    <li key={f.slug} className="flex items-center gap-3">
                      <span className="relative shrink-0">
                        <Image
                          src={`/images/founders/${f.slug}.webp`}
                          alt=""
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-[0_6px_16px_-8px_rgba(0,15,22,0.4)]"
                        />
                        <Image
                          src={`/images/startups/${f.startup}-badge.webp`}
                          alt=""
                          width={18}
                          height={18}
                          className="absolute -right-1 -bottom-1 h-[18px] w-[18px] rounded-full bg-white ring-2 ring-white"
                        />
                      </span>
                      <span className="leading-tight">
                        <span className="block text-[14px] font-bold text-ink">
                          {f.name}
                        </span>
                        <span className="block text-[12px] text-muted">
                          {f.company}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/#accelerator"
                className="group inline-flex shrink-0 items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-ink uppercase transition-colors duration-200 hover:text-gold-deep"
              >
                Meet the portfolio
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Two ways in */}
        <section
          aria-labelledby="ways-title"
          className="px-4 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[1200px] lg:px-6">
            <h2 id="ways-title" className="sr-only">
              Two ways to be at Demo Day
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              <Reveal className="card flex flex-col p-7 sm:p-9">
                <p className="font-display text-[11px] font-bold tracking-[0.14em] text-gold-deep uppercase">
                  In the audience
                </p>
                <h3 className="mt-3 font-display text-[28px] leading-tight font-bold tracking-[-0.02em] text-ink">
                  Come and watch
                </h3>
                <p className="lead mt-3">
                  {next
                    ? `${next.title} is on ${nextDate?.long}. Seats are free but limited.`
                    : "The next Demo Day is being scheduled. Follow the events page to hear first."}
                </p>
                <div className="mt-7">
                  <ButtonLink
                    href={next ? `/events/${next.slug}` : "/events"}
                    variant="outline"
                  >
                    {next ? "Reserve a seat" : "See all events"}
                  </ButtonLink>
                </div>
              </Reveal>
              <Reveal
                delay={100}
                className="relative isolate flex flex-col overflow-hidden rounded-[18px] bg-[linear-gradient(120deg,var(--green-deep)_0%,var(--green)_55%,var(--green-bright)_100%)] p-7 text-white sm:p-9"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_top_right,#000,transparent_75%)]"
                />
                <p className="font-display text-[11px] font-bold tracking-[0.14em] text-green-light uppercase">
                  On the stage
                </p>
                <h3 className="mt-3 font-display text-[28px] leading-tight font-bold tracking-[-0.02em]">
                  Pitch at the next one
                </h3>
                <p className="mt-3 text-[16px] leading-[1.65] text-white/85">
                  Applications for Silicon Valley Fall 2026 are open. Ten weeks
                  later, it&rsquo;s your five minutes.
                </p>
                <div className="mt-7">
                  <ButtonLink href="/dashboard" variant="white">
                    Apply now
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
                Demo Day <span className="text-gold-deep">questions</span>
              </h2>
            </Reveal>
            <Reveal delay={120} className="mt-10">
              <Accordion items={FAQS} />
            </Reveal>
            <p className="mt-6 text-center text-[14px] text-muted">
              Something else?{" "}
              <Link
                href="/contact"
                className="font-semibold text-ink underline-offset-4 hover:underline"
              >
                Ask the team
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
