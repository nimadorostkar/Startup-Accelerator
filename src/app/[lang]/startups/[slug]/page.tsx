import type { Metadata } from "next";
import { LocalLink as Link } from "@/i18n/client";
import { format, plural } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/server";
import { ExternalIcon } from "@/components/dashboard/icons";
import Footer from "@/components/Footer";
import { ArrowRight, CheckIcon } from "@/components/icons";
import Navbar from "@/components/Navbar";
import Monogram, { FounderDot } from "@/components/startups/Monogram";
import PublicStatusBadge from "@/components/startups/PublicStatusBadge";
import {
  compactIn,
  dayIn,
  monthIn,
  optionLabel,
  stageName,
} from "@/components/startups/i18n";
import StartupCard from "@/components/startups/StartupCard";
import type { StartupCardData } from "@/lib/application/directory";
import {
  findPublicStartup,
  listPublicStartups,
} from "@/lib/application/public";

// Rendered on first visit, then static: refreshed every minute and as soon
// as the API reports a change (cache tags). Unknown slugs are a 404.
export const revalidate = 60;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/startups/[slug]">): Promise<Metadata> {
  const [s, { startups }] = await Promise.all([
    findPublicStartup((await params).slug),
    getDictionary(),
  ]);
  return {
    title: format(startups.page.metaTitle, { name: s.name }),
    description: s.tagline || format(startups.page.metaDescription, { name: s.name }),
  };
}

function Section({
  id,
  title,
  body,
  children,
}: {
  id: string;
  title: string;
  body?: string;
  children?: React.ReactNode;
}) {
  if (!body && !children) return null;
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="border-t border-line-soft pt-8 first:border-t-0 first:pt-0"
    >
      <h2
        id={`${id}-title`}
        className="font-display text-[13px] font-bold tracking-[0.16em] text-brand-strong uppercase"
      >
        {title}
      </h2>
      {body && (
        <p
          dir="auto"
          className="mt-3 text-[17px] leading-[1.75] whitespace-pre-line wrap-anywhere text-ink-soft/90"
        >
          {body}
        </p>
      )}
      {children}
    </section>
  );
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-10 max-w-full items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-semibold text-ink transition-colors duration-200 hover:border-brand hover:text-brand-strong"
    >
      <span className="truncate">{children}</span>
      <ExternalIcon className="h-3.5 w-3.5 shrink-0 text-muted" />
    </a>
  );
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function StartupPage({
  params,
}: PageProps<"/[lang]/startups/[slug]">) {
  const { slug } = await params;
  const s = await findPublicStartup(slug); // 404s on its own
  const [{ startups: dict }, locale] = await Promise.all([getDictionary(), getLocale()]);
  const t = dict.page;
  const o = dict.options;
  const stage = stageName(o, s.stage);
  const industry = optionLabel(o.industries, s.industry);

  const others = (await listPublicStartups()).filter((x) => x.slug !== slug);
  const related = [
    ...others.filter((x) => x.industry && x.industry === s.industry),
    ...others.filter((x) => !x.industry || x.industry !== s.industry),
  ].slice(0, 3);

  const facts: [string, string][] = (
    [
      [t.factStage, stage],
      [t.factIndustry, industry],
      [t.factHeadquarters, s.country],
      [t.factFounded, monthIn(locale, s.foundedOn)],
      [t.factBusinessModel, optionLabel(o.businessModels, s.businessModel)],
      [
        t.factIncorporated,
        s.incorporated === "yes"
          ? t.yes
          : s.incorporated === "no"
            ? t.notYet
            : "",
      ],
      [t.factTeam, s.team.length ? plural(locale, s.team.length, t.people) : ""],
      [t.factApplied, s.appliedAt ? dayIn(locale, s.appliedAt) : ""],
    ] as [string, string][]
  ).filter(([, v]) => v);

  const traction = [
    s.users !== null && { value: compactIn(locale, s.users), label: t.activeUsers },
    s.customers !== null && {
      value: compactIn(locale, s.customers),
      label: t.payingCustomers,
    },
  ].filter(Boolean) as { value: string; label: string }[];

  const founder = s.applicant;
  const showFounder = founder.bio || founder.title || founder.linkedin;

  return (
    <>
      <Navbar />
      <main id="main">
        <header className="relative isolate bg-cream px-4 pt-[116px] pb-10 sm:px-8 sm:pb-14 lg:pt-[calc(min(5.74vw,110px)+56px)]">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(20,26,34,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(20,26,34,0.04)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_top_left,#000,transparent_70%)] rtl:[mask-image:radial-gradient(ellipse_at_top_right,#000,transparent_70%)]"
          />
          <div className="mx-auto max-w-[1200px] lg:px-6">
            <Link
              href="/startups"
              className="group inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-muted uppercase transition-colors duration-200 hover:text-brand-strong"
            >
              <ArrowRight className="h-4 w-4 rotate-180 transition-transform duration-200 group-hover:-translate-x-1" />
              {t.back}
            </Link>

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
              <Monogram
                name={s.name}
                logo={s.logo}
                className="h-20 w-20 rounded-[22px] text-[28px] sm:h-24 sm:w-24 sm:text-[32px]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <h1
                    dir="auto"
                    className="min-w-0 font-display text-[36px] leading-[1.02] font-extrabold tracking-[-0.025em] wrap-anywhere text-ink sm:text-[52px]"
                  >
                    {s.name}
                  </h1>
                  <PublicStatusBadge
                    status={s.status}
                    label={o.statuses[s.status]}
                    className="text-[13px]"
                  />
                </div>
                {s.tagline && (
                  <p
                    dir="auto"
                    className="lead mt-3 max-w-[680px] wrap-anywhere sm:text-[19px]"
                  >
                    {s.tagline}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap gap-2">
                  {[industry, stage, s.country]
                    .filter(Boolean)
                    .map((c, i) => (
                      <span
                        key={i}
                        dir="auto"
                        className="chip max-w-full wrap-anywhere"
                      >
                        {c}
                      </span>
                    ))}
                </div>
                {(s.website || s.demoUrl || s.videoUrl) && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {s.website && (
                      <ExternalLink href={s.website}>
                        {hostname(s.website)}
                      </ExternalLink>
                    )}
                    {s.demoUrl && (
                      <ExternalLink href={s.demoUrl}>{t.demo}</ExternalLink>
                    )}
                    {s.videoUrl && (
                      <ExternalLink href={s.videoUrl}>{t.video}</ExternalLink>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16 lg:px-6">
            <div className="flex flex-col gap-8">
              {traction.length > 0 && (
                <dl className="grid grid-cols-2 gap-3 sm:max-w-[420px]">
                  {traction.map((t) => (
                    <div
                      key={t.label}
                      className="card flex flex-col-reverse justify-end px-5 py-4"
                    >
                      <dt className="mt-1 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                        {t.label}
                      </dt>
                      <dd className="font-display text-[28px] leading-none font-extrabold tracking-[-0.02em] text-ink">
                        {t.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              <Section id="problem" title={t.problem} body={s.problem} />
              <Section id="solution" title={t.solution} body={s.solution} />
              <Section
                id="customer"
                title={t.customer}
                body={s.targetCustomer}
              />
              <Section id="market" title={t.market} body={s.marketSize} />
              {(s.competitors || s.advantage) && (
                <Section id="edge" title={t.edge}>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {s.competitors && (
                      <div className="rounded-[16px] bg-cream p-5">
                        <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                          {t.usedToday}
                        </p>
                        <p
                          dir="auto"
                          className="mt-2 text-[15px] leading-[1.65] whitespace-pre-line wrap-anywhere text-ink-soft"
                        >
                          {s.competitors}
                        </p>
                      </div>
                    )}
                    {s.advantage && (
                      <div className="rounded-[16px] border border-chip-line bg-chip/60 p-5">
                        <p className="text-[11px] font-semibold tracking-[0.12em] text-brand-strong uppercase">
                          {t.whyWins}
                        </p>
                        <p
                          dir="auto"
                          className="mt-2 text-[15px] leading-[1.65] whitespace-pre-line wrap-anywhere text-ink-soft"
                        >
                          {s.advantage}
                        </p>
                      </div>
                    )}
                  </div>
                </Section>
              )}
              {s.keyMetric && (
                <Section id="metric" title={t.metric}>
                  <p className="mt-3 flex items-start gap-3 text-[17px] leading-[1.6] font-semibold text-ink">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    <span dir="auto" className="min-w-0 wrap-anywhere">
                      {s.keyMetric}
                    </span>
                  </p>
                </Section>
              )}
              {(s.whyUs || s.workedTogether || s.hiringNeeds) && (
                <Section id="team-story" title={t.teamStory} body={s.whyUs}>
                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    {s.workedTogether && (
                      <div className="rounded-[16px] bg-cream p-5">
                        <dt className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                          {t.workedTogether}
                        </dt>
                        <dd
                          dir="auto"
                          className="mt-1.5 text-[15px] font-semibold wrap-anywhere text-ink"
                        >
                          {optionLabel(o.workedTogether, s.workedTogether)}
                        </dd>
                      </div>
                    )}
                    {s.hiringNeeds && (
                      <div className="rounded-[16px] bg-cream p-5">
                        <dt className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                          {t.hiring}
                        </dt>
                        <dd
                          dir="auto"
                          className="mt-1.5 text-[15px] leading-[1.6] whitespace-pre-line wrap-anywhere text-ink-soft"
                        >
                          {s.hiringNeeds}
                        </dd>
                      </div>
                    )}
                  </dl>
                </Section>
              )}
              {showFounder && (
                <Section id="founder" title={t.aboutFounder}>
                  <div className="mt-4 flex gap-4">
                    <FounderDot
                      name={founder.name}
                      photo={founder.photo}
                      className="h-12 w-12 text-[14px]"
                    />
                    <div className="min-w-0">
                      <p className="text-[16px] font-bold wrap-anywhere text-ink">
                        <bdi>{founder.name}</bdi>
                      </p>
                      {/* The founder's own words in a <bdi> each, so the
                          page's language sets the line's direction */}
                      <p className="text-[13px] wrap-anywhere text-muted">
                        {[
                          founder.title,
                          [founder.city, founder.country]
                            .filter(Boolean)
                            .join(", "),
                          founder.experienceYears !== null &&
                            plural(locale, founder.experienceYears, t.experience),
                        ]
                          .filter(Boolean)
                          .map((part, i) => (
                            <span key={i}>
                              {i > 0 && " · "}
                              <bdi>{part}</bdi>
                            </span>
                          ))}
                      </p>
                      {founder.bio && (
                        <p
                          dir="auto"
                          className="mt-3 text-[15px] leading-[1.7] whitespace-pre-line wrap-anywhere text-ink-soft/90"
                        >
                          {founder.bio}
                        </p>
                      )}
                      {founder.linkedin && (
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-strong underline-offset-4 hover:underline"
                        >
                          {t.linkedin}
                          <ExternalIcon className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </Section>
              )}
            </div>

            <aside className="flex flex-col gap-5 lg:sticky lg:top-8 lg:self-start">
              {facts.length > 0 && (
                <dl className="card divide-y divide-line-soft px-6 py-2">
                  {facts.map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-baseline justify-between gap-4 py-3"
                    >
                      <dt className="text-[13px] text-muted">{k}</dt>
                      <dd
                        dir="auto"
                        className="min-w-0 text-end text-[14px] font-semibold wrap-anywhere text-ink"
                      >
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {s.team.length > 0 && (
                <section aria-labelledby="team-title" className="card p-6">
                  <h2
                    id="team-title"
                    className="font-display text-[13px] font-bold tracking-[0.16em] text-brand-strong uppercase"
                  >
                    {t.team}
                  </h2>
                  <ul className="mt-4 flex flex-col gap-4">
                    {s.team.map((m, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3"
                      >
                        <FounderDot
                          name={m.name}
                          photo={m.name === founder.name ? founder.photo : undefined}
                          className="h-10 w-10 text-[12px]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-x-2 text-[14px] font-bold text-ink">
                            <bdi className="min-w-0 wrap-anywhere">{m.name}</bdi>
                            {m.isFounder && (
                              <span className="rounded-full bg-chip px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-brand-strong uppercase ring-1 ring-chip-line">
                                {t.founderBadge}
                              </span>
                            )}
                          </p>
                          <p className="truncate text-[13px] text-muted">
                            {[
                              m.role,
                              m.commitment
                                ? optionLabel(o.commitments, m.commitment)
                                : "",
                            ]
                              .filter(Boolean)
                              .map((part, i) => (
                                <span key={i}>
                                  {i > 0 && " · "}
                                  <bdi>{part}</bdi>
                                </span>
                              ))}
                          </p>
                        </div>
                        {m.linkedin && (
                          <a
                            href={m.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={format(t.onLinkedIn, { name: m.name })}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-brand hover:text-brand-strong"
                          >
                            <ExternalIcon className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {s.timeline.length > 0 && (
                <section aria-labelledby="journey-title" className="card p-6">
                  <h2
                    id="journey-title"
                    className="font-display text-[13px] font-bold tracking-[0.16em] text-brand-strong uppercase"
                  >
                    {t.journey}
                  </h2>
                  <ol className="relative mt-4 ms-1.5 border-s-2 border-dashed border-line ps-5">
                    {s.timeline.map((m, i) => (
                      <li
                        key={i}
                        className="relative pb-4 last:pb-0"
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute top-1.5 -start-[27px] h-3 w-3 rounded-full ring-4 ring-white ${
                            i === s.timeline.length - 1 ? "bg-brand" : "bg-line"
                          }`}
                        />
                        <p className="text-[14px] font-semibold text-ink">
                          {optionLabel(o.timeline, m.title)}
                        </p>
                        <p className="text-[12px] text-muted">
                          {dayIn(locale, m.at)}
                        </p>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </aside>
          </div>
        </div>

        {related.length > 0 && (
          <section
            aria-labelledby="more-startups"
            className="border-t border-line-soft bg-cream px-4 py-16 sm:px-8 sm:py-20"
          >
            <div className="mx-auto max-w-[1720px] lg:px-6">
              <div className="flex items-end justify-between gap-6">
                <h2 id="more-startups" className="title-section">
                  {t.moreStart}{" "}
                  <span className="text-brand-strong">{t.moreAccent}</span>
                </h2>
                <Link
                  href="/startups"
                  className="group hidden items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] whitespace-nowrap text-ink uppercase transition-colors duration-200 hover:text-brand-strong sm:inline-flex"
                >
                  {t.fullDirectory}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
              <ul className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {related.map((r: StartupCardData) => (
                  <li key={r.slug}>
                    <StartupCard
                      s={r}
                      t={{ card: dict.card, options: o }}
                      locale={locale}
                    />
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
