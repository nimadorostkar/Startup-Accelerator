import type { Metadata } from "next";
import { LocalLink as Link } from "@/i18n/client";
import { formatNumber } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/server";
import Footer from "@/components/Footer";
import { ArrowRight } from "@/components/icons";
import { stagesIn } from "@/components/Journey";
import {
  ChartIcon,
  TargetIcon,
  UsersIcon,
  RocketIcon,
} from "@/components/journey/icons";
import Reveal from "@/components/motion/Reveal";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import Eyebrow from "@/components/ui/Eyebrow";
import UnicornCta from "@/components/UnicornCta";

export async function generateMetadata(): Promise<Metadata> {
  const { about } = await getDictionary();
  return { title: about.meta.title, description: about.meta.description };
}

/* PLACEHOLDER values, same as the landing page — replace with real numbers before launch.
   The capital figure is written out in the dictionary; the others are formatted here. */
const NUMBERS = [
  { label: "capital", value: null },
  { label: "firms", value: 180 },
  { label: "markets", value: 65 },
  { label: "startups", value: 1200 },
  { label: "mentors", value: 3500 },
  { label: "exits", value: 120 },
] as const;

const VALUES = [
  { Icon: TargetIcon, key: "founders" },
  { Icon: UsersIcon, key: "global" },
  { Icon: RocketIcon, key: "structure" },
  { Icon: ChartIcon, key: "capital" },
] as const;

export default async function AboutPage() {
  const [{ about: t, landing }, locale] = await Promise.all([getDictionary(), getLocale()]);
  const stages = stagesIn(landing);
  return (
    <>
      <Navbar />
      <main id="main">
        <PageHeader
          eyebrow={t.header.eyebrow}
          title={
            <>
              {t.header.title}{" "}
              <span className="text-brand-strong">{t.header.titleAccent}</span>
            </>
          }
        >
          {t.header.lead}
        </PageHeader>

        {/* Mission + numbers */}
        <section
          aria-labelledby="mission-title"
          className="px-4 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto grid max-w-[1720px] gap-12 lg:grid-cols-2 lg:gap-20 lg:px-6">
            <div>
              <Reveal>
                <Eyebrow>{t.mission.eyebrow}</Eyebrow>
              </Reveal>
              <Reveal delay={90}>
                <h2 id="mission-title" className="title-section mt-4">
                  {t.mission.title}{" "}
                  <span className="text-brand-strong">{t.mission.titleAccent}</span>
                </h2>
              </Reveal>
              <Reveal delay={180}>
                <p className="lead mt-6 max-w-[560px]">{t.mission.body1}</p>
                <p className="lead mt-4 max-w-[560px]">{t.mission.body2}</p>
              </Reveal>
            </div>

            <Reveal delay={120} className="self-start">
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-line-soft bg-line-soft sm:grid-cols-3">
                {NUMBERS.map((n) => (
                  <div
                    key={n.label}
                    className="flex flex-col-reverse justify-end bg-white px-5 py-7 sm:px-7 sm:py-9"
                  >
                    <dt className="mt-3 font-display text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                      {t.numbers[n.label]}
                    </dt>
                    <dd className="font-display text-[28px] leading-none font-extrabold tracking-[-0.01em] text-ink sm:text-[34px]">
                      {n.value === null
                        ? t.numbers.capitalValue
                        : `${formatNumber(locale, n.value)}+`}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* Values */}
        <section
          aria-labelledby="values-title"
          className="bg-cream px-4 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[1720px] lg:px-6">
            <Reveal>
              <Eyebrow>{t.values.eyebrow}</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <h2 id="values-title" className="title-section mt-4">
                {t.values.title}{" "}
                <span className="text-brand-strong">{t.values.titleAccent}</span>
              </h2>
            </Reveal>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {VALUES.map(({ Icon, key }, i) => (
                <Reveal
                  as="li"
                  key={key}
                  delay={i * 80}
                  className="card p-6 sm:p-7"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-chip ring-1 ring-chip-line">
                    <Icon className="h-5 w-5 text-brand-strong" />
                  </span>
                  <h3 className="mt-5 text-[18px] font-bold text-ink">
                    {t.values[key].title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-[1.65] text-muted">
                    {t.values[key].body}
                  </p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* Program */}
        <section
          aria-labelledby="journey-title"
          className="px-4 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[1720px] lg:px-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Reveal>
                  <Eyebrow>{t.program.eyebrow}</Eyebrow>
                </Reveal>
                <Reveal delay={90}>
                  <h2 id="journey-title" className="title-section mt-4">
                    {t.program.title}{" "}
                    <span className="text-brand-strong">{t.program.titleAccent}</span>
                  </h2>
                </Reveal>
              </div>
              <Reveal delay={180}>
                <Link
                  href="/#program"
                  className="group inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-ink uppercase transition-colors duration-200 hover:text-brand-strong"
                >
                  {t.program.seeAll}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Reveal>
            </div>

            <Reveal delay={120}>
              <ol className="mt-10 grid gap-px overflow-hidden rounded-[18px] border border-line-soft bg-line-soft sm:grid-cols-2 lg:grid-cols-3">
                {stages.map(({ id, title, body, Icon }, i) => (
                  <li key={id} className="flex gap-4 bg-white p-6 sm:p-7">
                    <span className="font-display text-[13px] font-bold text-brand-strong tabular-nums">
                      {formatNumber(locale, i + 1, { minimumIntegerDigits: 2 })}
                    </span>
                    <div>
                      <h3 className="flex items-center gap-2.5 text-[17px] font-bold text-ink">
                        <Icon className="h-5 w-5 text-brand" />
                        {title}
                      </h3>
                      <p className="mt-2 text-[14px] leading-[1.6] text-muted">
                        {body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        <UnicornCta />
      </main>
      <Footer />
    </>
  );
}
