import type { Metadata } from "next";
import { LocalLink as Link } from "@/i18n/client";
import { format, formatNumber } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/server";
import { rich } from "@/i18n/rich";
import Footer from "@/components/Footer";
import { ArrowRight, CheckIcon } from "@/components/icons";
import { BrandMark } from "@/components/Logo";
import Reveal from "@/components/motion/Reveal";
import Navbar from "@/components/Navbar";
import Cover from "@/components/newsletter/Cover";
import PostCard from "@/components/newsletter/PostCard";
import { CATEGORIES, formatDate } from "@/components/newsletter/posts";
import SubscribeForm from "@/components/newsletter/SubscribeForm";
import Eyebrow from "@/components/ui/Eyebrow";
import FilterList from "@/components/ui/FilterList";
import { listPosts } from "@/lib/newsletter";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary()).newsletter.page;
  return { title: t.metaTitle, description: t.metaDescription };
}

// Static, refreshed every minute and as soon as the API reports a change
// (cache tags). The data comes from the API, see lib/api.ts (BUILDING).
export const revalidate = 60;

export default async function NewsletterPage() {
  const [{ newsletter }, locale] = await Promise.all([getDictionary(), getLocale()]);
  const t = newsletter.page;
  const posts = await listPosts();
  const featured = posts[0]; // newest first; undefined until the first issue is published

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

          <div className="mx-auto grid max-w-[1720px] items-center gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:px-6">
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
                <SubscribeForm
                  source="newsletter-hero"
                  className="mt-8 max-w-[520px]"
                  t={newsletter.subscribe}
                />
                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-center gap-1.5">
                      <CheckIcon className="h-3.5 w-3.5 text-brand-strong" />
                      {p}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            {/* Inbox preview: the latest issue as it lands */}
            {featured && (
            <Reveal
              delay={200}
              y={40}
              className="relative mx-auto w-full max-w-[520px]"
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-8 -top-4 h-full rotate-[-4deg] rounded-[24px] border border-line-soft bg-white/60"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-4 -top-2 h-full rotate-[2.5deg] rounded-[24px] border border-line-soft bg-white/80"
              />
              <Link
                href={`/newsletter/${featured.slug}`}
                className="float group relative block rounded-[24px] border border-line-soft bg-white p-5 shadow-[0_40px_80px_-40px_rgba(20,26,34,0.35)] [--fdur:7s] sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <BrandMark className="h-10 w-auto shrink-0" />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block text-[14px] font-bold text-ink">
                      The Founder Brief
                    </span>
                    <span className="block truncate text-[12px] text-muted">
                      {format(t.inboxTo, { issue: formatNumber(locale, featured.issue, { useGrouping: false }) })}
                    </span>
                  </span>
                  <span className="rounded-full bg-chip px-2.5 py-1 text-[11px] font-semibold text-brand-strong ring-1 ring-chip-line">
                    {t.inboxNew}
                  </span>
                </div>
                <p className="mt-4 text-[17px] leading-snug font-bold text-ink">
                  <bdi>{featured.title}</bdi>
                </p>
                <div className="mt-4 overflow-hidden rounded-[14px]">
                  <Cover
                    post={featured}
                    idSuffix="-inbox"
                    className="aspect-[16/9] w-full transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <p dir="auto" className="mt-4 line-clamp-2 text-[13px] leading-[1.6] text-muted">
                  {featured.excerpt}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-brand-strong uppercase">
                  {t.readThis}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
            )}
          </div>
        </section>

        {/* Featured */}
        {featured && (
        <section
          aria-labelledby="featured-title"
          className="px-4 pt-16 sm:px-8 sm:pt-24"
        >
          <div className="mx-auto max-w-[1720px] lg:px-6">
            <Reveal>
              <article className="group relative grid overflow-hidden rounded-[28px] border border-line-soft bg-white shadow-[0_2px_6px_rgba(20,26,34,0.03),0_40px_90px_-60px_rgba(20,26,34,0.3)] lg:grid-cols-2">
                <div className="overflow-hidden">
                  <Cover
                    post={featured}
                    idSuffix="-featured"
                    className="aspect-[16/10] h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] lg:aspect-auto"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-10 xl:p-14">
                  <div className="flex flex-wrap items-center gap-3 text-[12px] text-muted">
                    <span className="rounded-full bg-ink px-3 py-1.5 font-semibold text-white">
                      {t.featured}
                    </span>
                    <span className="chip">{newsletter.categories[featured.category] ?? featured.category}</span>
                    <span>{formatDate(featured.date, locale)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{format(newsletter.minRead, { count: formatNumber(locale, featured.minutes) })}</span>
                  </div>
                  <h2
                    id="featured-title"
                    className="mt-5 font-display text-[28px] leading-[1.12] font-bold tracking-[-0.02em] text-ink sm:text-[38px]"
                  >
                    <Link
                      href={`/newsletter/${featured.slug}`}
                      dir="auto"
                      className="after:absolute after:inset-0 after:content-['']"
                    >
                      {featured.title}
                    </Link>
                  </h2>
                  <p dir="auto" className="lead mt-4">{featured.excerpt}</p>
                  <p className="mt-6 text-[13px] text-muted">
                    {rich(t.by, { author: <bdi>{featured.author}</bdi> })}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-ink uppercase transition-colors duration-200 group-hover:text-brand-strong">
                    {t.readIssue}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </div>
              </article>
            </Reveal>
          </div>
        </section>
        )}

        {/* Latest */}
        <section
          id="latest"
          aria-labelledby="latest-title"
          className="px-4 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[1720px] lg:px-6">
            <Reveal>
              <Eyebrow>{t.archiveEyebrow}</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <h2 id="latest-title" className="title-section mt-4">
                {rich(t.latest, {
                  accent: <span className="text-brand-strong">{t.latestAccent}</span>,
                })}
              </h2>
            </Reveal>
            <FilterList
              label={t.filterLabel}
              allLabel={t.allTopics}
              noun={[t.noun.one, t.noun.other]}
              emptyText={t.emptyTopic}
              listClassName="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
              categories={CATEGORIES}
              categoryLabels={newsletter.categories}
              hideOnAll={featured?.slug}
              items={posts.map((post) => ({
                key: post.slug,
                category: post.category,
                node: <PostCard post={post} />,
              }))}
            />
          </div>
        </section>

        {/* Subscribe band */}
        <section
          aria-labelledby="subscribe-title"
          className="relative isolate overflow-hidden bg-night px-4 py-20 sm:px-8 sm:py-24"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:50px_50px]"
          />
          <div
            aria-hidden="true"
            className="cta-glow absolute -end-24 -top-40 -z-10 h-[340px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgba(239,111,35,0.35),transparent)]"
          />
          <div className="mx-auto flex max-w-[1720px] flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="max-w-[560px]">
              <Reveal>
                <Eyebrow tone="dark">{t.bandEyebrow}</Eyebrow>
              </Reveal>
              <Reveal delay={90}>
                <h2
                  id="subscribe-title"
                  className="mt-5 font-display text-[36px] leading-[1.05] font-bold tracking-[-0.025em] text-white sm:text-[48px]"
                >
                  {t.bandHeading}
                </h2>
              </Reveal>
            </div>
            <Reveal delay={180} className="w-full lg:max-w-[520px]">
              <SubscribeForm source="newsletter-band" tone="dark" t={newsletter.subscribe} />
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-white/65">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-center gap-1.5">
                    <CheckIcon className="h-3.5 w-3.5 text-brand" />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
