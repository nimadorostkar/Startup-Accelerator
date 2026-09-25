import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalIcon } from "@/components/dashboard/icons";
import Footer from "@/components/Footer";
import { ArrowRight, CheckIcon } from "@/components/icons";
import Navbar from "@/components/Navbar";
import Monogram, { FounderDot } from "@/components/startups/Monogram";
import PublicStatusBadge from "@/components/startups/PublicStatusBadge";
import StartupCard from "@/components/startups/StartupCard";
import {
  compact,
  formatDay,
  formatMonth,
  toCard,
  type PublicStartup,
} from "@/lib/application/directory";
import {
  findPublicStartup,
  listPublicStartups,
} from "@/lib/application/public";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/startups/[slug]">): Promise<Metadata> {
  const s = await findPublicStartup((await params).slug);
  if (!s) return {};
  return {
    title: `${s.name} — Startups · VC Summit`,
    description: s.tagline || `${s.name} on VC Summit.`,
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
        className="font-display text-[13px] font-bold tracking-[0.16em] text-gold-deep uppercase"
      >
        {title}
      </h2>
      {body && (
        <p className="mt-3 text-[17px] leading-[1.75] whitespace-pre-line text-ink-soft/90">
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
      className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-semibold text-ink transition-colors duration-200 hover:border-gold hover:text-gold-deep"
    >
      {children}
      <ExternalIcon className="h-3.5 w-3.5 text-muted" />
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
}: PageProps<"/startups/[slug]">) {
  const { slug } = await params;
  const s = await findPublicStartup(slug);
  if (!s) notFound();

  const others = (await listPublicStartups()).filter((x) => x.slug !== slug);
  const related = [
    ...others.filter((x) => x.industry && x.industry === s.industry),
    ...others.filter((x) => !x.industry || x.industry !== s.industry),
  ].slice(0, 3);

  const facts: [string, string][] = (
    [
      ["Stage", s.stageLabel !== "Not set" ? s.stageLabel : ""],
      ["Industry", s.industry],
      ["Headquarters", s.country],
      ["Founded", formatMonth(s.foundedOn)],
      ["Business model", s.businessModel],
      [
        "Incorporated",
        s.incorporated === "yes"
          ? "Yes"
          : s.incorporated === "no"
            ? "Not yet"
            : "",
      ],
      [
        "Team",
        s.team.length
          ? `${s.team.length} ${s.team.length === 1 ? "person" : "people"}`
          : "",
      ],
      ["Applied", s.appliedAt ? formatDay(s.appliedAt) : ""],
    ] as [string, string][]
  ).filter(([, v]) => v);

  const traction = [
    s.users !== null && { value: compact(s.users), label: "Active users" },
    s.customers !== null && {
      value: compact(s.customers),
      label: "Paying customers",
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
            className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(0,15,22,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,15,22,0.04)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_top_left,#000,transparent_70%)]"
          />
          <div className="mx-auto max-w-[1200px] lg:px-6">
            <Link
              href="/startups"
              className="group inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-muted uppercase transition-colors duration-200 hover:text-gold-deep"
            >
              <ArrowRight className="h-4 w-4 rotate-180 transition-transform duration-200 group-hover:-translate-x-1" />
              All startups
            </Link>

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
              <Monogram
                name={s.name}
                className="h-20 w-20 rounded-[22px] text-[28px] sm:h-24 sm:w-24 sm:text-[32px]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <h1 className="font-display text-[36px] leading-[1.02] font-extrabold tracking-[-0.025em] text-ink sm:text-[52px]">
                    {s.name}
                  </h1>
                  <PublicStatusBadge
                    status={s.status}
                    className="text-[13px]"
                  />
                </div>
                {s.tagline && (
                  <p className="lead mt-3 max-w-[680px] sm:text-[19px]">
                    {s.tagline}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    s.industry,
                    s.stageLabel !== "Not set" && s.stageLabel,
                    s.country,
                  ]
                    .filter(Boolean)
                    .map((c) => (
                      <span key={c as string} className="chip">
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
                      <ExternalLink href={s.demoUrl}>Product demo</ExternalLink>
                    )}
                    {s.videoUrl && (
                      <ExternalLink href={s.videoUrl}>Video</ExternalLink>
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

              <Section id="problem" title="The problem" body={s.problem} />
              <Section id="solution" title="The solution" body={s.solution} />
              <Section
                id="customer"
                title="Who it's for"
                body={s.targetCustomer}
              />
              <Section id="market" title="Market" body={s.marketSize} />
              {(s.competitors || s.advantage) && (
                <Section id="edge" title="Competition and edge">
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {s.competitors && (
                      <div className="rounded-[16px] bg-cream p-5">
                        <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                          What people use today
                        </p>
                        <p className="mt-2 text-[15px] leading-[1.65] text-ink-soft">
                          {s.competitors}
                        </p>
                      </div>
                    )}
                    {s.advantage && (
                      <div className="rounded-[16px] border border-chip-line bg-chip/60 p-5">
                        <p className="text-[11px] font-semibold tracking-[0.12em] text-gold-deep uppercase">
                          Why this team wins
                        </p>
                        <p className="mt-2 text-[15px] leading-[1.65] text-ink-soft">
                          {s.advantage}
                        </p>
                      </div>
                    )}
                  </div>
                </Section>
              )}
              {s.keyMetric && (
                <Section id="metric" title="Headline metric">
                  <p className="mt-3 flex items-start gap-3 text-[17px] leading-[1.6] font-semibold text-ink">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold text-gold-ink">
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    {s.keyMetric}
                  </p>
                </Section>
              )}
              {(s.whyUs || s.workedTogether || s.hiringNeeds) && (
                <Section id="team-story" title="The team" body={s.whyUs}>
                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    {s.workedTogether && (
                      <div className="rounded-[16px] bg-cream p-5">
                        <dt className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                          Worked together
                        </dt>
                        <dd className="mt-1.5 text-[15px] font-semibold text-ink">
                          {s.workedTogether}
                        </dd>
                      </div>
                    )}
                    {s.hiringNeeds && (
                      <div className="rounded-[16px] bg-cream p-5">
                        <dt className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                          Hiring
                        </dt>
                        <dd className="mt-1.5 text-[15px] leading-[1.6] text-ink-soft">
                          {s.hiringNeeds}
                        </dd>
                      </div>
                    )}
                  </dl>
                </Section>
              )}
              {showFounder && (
                <Section id="founder" title="About the founder">
                  <div className="mt-4 flex gap-4">
                    <FounderDot
                      name={founder.name}
                      className="h-12 w-12 text-[14px]"
                    />
                    <div className="min-w-0">
                      <p className="text-[16px] font-bold text-ink">
                        {founder.name}
                      </p>
                      <p className="text-[13px] text-muted">
                        {[
                          founder.title,
                          [founder.city, founder.country]
                            .filter(Boolean)
                            .join(", "),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                        {founder.experienceYears !== null &&
                          ` · ${founder.experienceYears} ${founder.experienceYears === 1 ? "year" : "years"} of experience`}
                      </p>
                      {founder.bio && (
                        <p className="mt-3 text-[15px] leading-[1.7] text-ink-soft/90">
                          {founder.bio}
                        </p>
                      )}
                      {founder.linkedin && (
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-gold-deep underline-offset-4 hover:underline"
                        >
                          LinkedIn
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
                      <dd className="text-right text-[14px] font-semibold text-ink">
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
                    className="font-display text-[13px] font-bold tracking-[0.16em] text-gold-deep uppercase"
                  >
                    Founders and team
                  </h2>
                  <ul className="mt-4 flex flex-col gap-4">
                    {s.team.map((m) => (
                      <li
                        key={m.name + m.role}
                        className="flex items-center gap-3"
                      >
                        <FounderDot
                          name={m.name}
                          className="h-10 w-10 text-[12px]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-x-2 text-[14px] font-bold text-ink">
                            {m.name}
                            {m.isFounder && (
                              <span className="rounded-full bg-chip px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-gold-deep uppercase ring-1 ring-chip-line">
                                Founder
                              </span>
                            )}
                          </p>
                          <p className="truncate text-[13px] text-muted">
                            {[
                              m.role,
                              m.commitment === "full-time"
                                ? "Full-time"
                                : m.commitment === "part-time"
                                  ? "Part-time"
                                  : "",
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        {m.linkedin && (
                          <a
                            href={m.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${m.name} on LinkedIn`}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-gold hover:text-gold-deep"
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
                    className="font-display text-[13px] font-bold tracking-[0.16em] text-gold-deep uppercase"
                  >
                    Journey
                  </h2>
                  <ol className="relative mt-4 ml-1.5 border-l-2 border-dashed border-line pl-5">
                    {s.timeline.map((t, i) => (
                      <li
                        key={t.at + t.title}
                        className="relative pb-4 last:pb-0"
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute top-1.5 -left-[27px] h-3 w-3 rounded-full ring-4 ring-white ${
                            i === s.timeline.length - 1 ? "bg-gold" : "bg-line"
                          }`}
                        />
                        <p className="text-[14px] font-semibold text-ink">
                          {t.title}
                        </p>
                        <p className="text-[12px] text-muted">
                          {formatDay(t.at)}
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
                  More <span className="text-gold-deep">startups</span>
                </h2>
                <Link
                  href="/startups"
                  className="group hidden items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] whitespace-nowrap text-ink uppercase transition-colors duration-200 hover:text-gold-deep sm:inline-flex"
                >
                  Full directory
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
              <ul className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {related.map((r: PublicStartup) => (
                  <li key={r.slug}>
                    <StartupCard s={toCard(r)} />
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
