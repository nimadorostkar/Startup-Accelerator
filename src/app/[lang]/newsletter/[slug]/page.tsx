import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { ArrowRight } from "@/components/icons";
import { BrandMark } from "@/components/Logo";
import Navbar from "@/components/Navbar";
import Cover from "@/components/newsletter/Cover";
import PostCard from "@/components/newsletter/PostCard";
import { formatDate, type Block } from "@/components/newsletter/posts";
import SubscribeForm from "@/components/newsletter/SubscribeForm";
import { findPost, listPosts } from "@/lib/newsletter";

// Rendered on first visit, then static: refreshed every minute and as soon
// as the API reports a change (cache tags). Unknown slugs are a 404.
export const revalidate = 60;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/newsletter/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post) notFound(); // keeps the 404 page's own title
  return {
    title: `${post.title} — The Founder Brief`,
    description: post.excerpt,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
    },
  };
}

function Body({ blocks }: { blocks: Block[] }) {
  return blocks.map((b, i) => {
    switch (b.type) {
      case "h2":
        return (
          <h2
            key={i}
            className="mt-12 font-display text-[24px] leading-tight font-bold tracking-[-0.015em] text-ink sm:text-[28px]"
          >
            {b.text}
          </h2>
        );
      case "p":
        return (
          <p
            key={i}
            className="mt-5 text-[17px] leading-[1.8] text-ink-soft/90 sm:text-[18px]"
          >
            {b.text}
          </p>
        );
      case "list":
        if (b.ordered)
          return (
            <ol
              key={i}
              className="mt-6 list-decimal space-y-3 pl-6 text-[17px] leading-[1.7] text-ink-soft/90 marker:font-semibold marker:text-brand-strong sm:text-[18px]"
            >
              {b.items.map((item, j) => (
                <li key={j} className="pl-1.5">
                  {item}
                </li>
              ))}
            </ol>
          );
        return (
          <ul key={i} className="mt-6 space-y-3">
            {b.items.map((item, j) => (
              <li
                key={j}
                className="flex gap-3.5 text-[17px] leading-[1.7] text-ink-soft/90 sm:text-[18px]"
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.7em] h-2 w-2 shrink-0 rounded-full bg-brand"
                />
                {item}
              </li>
            ))}
          </ul>
        );
      case "quote":
        return (
          <figure
            key={i}
            className="relative my-12 rounded-[20px] bg-[linear-gradient(140deg,#fff4ec_0%,#fff_60%)] px-7 py-8 ring-1 ring-line sm:px-10"
          >
            <span
              aria-hidden="true"
              className="absolute -top-6 left-7 font-display text-[80px] leading-none font-extrabold text-brand sm:left-10"
            >
              &ldquo;
            </span>
            <blockquote className="font-display text-[21px] leading-[1.45] font-semibold tracking-[-0.01em] text-ink sm:text-[24px]">
              {b.text}
            </blockquote>
            {b.cite && (
              <figcaption className="mt-4 text-[14px] text-muted">
                {b.cite}
              </figcaption>
            )}
          </figure>
        );
    }
  });
}

export default async function ArticlePage({
  params,
}: PageProps<"/[lang]/newsletter/[slug]">) {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post) notFound();

  const others = (await listPosts()).filter((p) => p.slug !== slug);
  const more = [
    ...others.filter((p) => p.category === post.category),
    ...others.filter((p) => p.category !== post.category),
  ].slice(0, 3);

  return (
    <>
      <div
        aria-hidden="true"
        className="read-progress fixed inset-x-0 top-0 z-40 h-[3px] bg-brand"
      />
      <Navbar />
      <main id="main">
        <article>
          <header className="relative isolate bg-cream px-4 pt-[116px] pb-40 sm:px-8 sm:pb-56 lg:pt-[calc(min(5.74vw,110px)+56px)]">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(20,26,34,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(20,26,34,0.04)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_top,#000,transparent_70%)]"
            />
            <div className="mx-auto max-w-[860px] text-center">
              <Link
                href="/newsletter"
                className="group inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-muted uppercase transition-colors duration-200 hover:text-brand-strong"
              >
                <ArrowRight className="h-4 w-4 rotate-180 transition-transform duration-200 group-hover:-translate-x-1" />
                All issues
              </Link>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-[13px] text-muted">
                <span className="chip">{post.category}</span>
                <span>Issue Nº{post.issue}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span aria-hidden="true">·</span>
                <span>{post.minutes} min read</span>
              </div>
              <h1 className="mt-5 font-display text-[34px] leading-[1.08] font-extrabold tracking-[-0.025em] text-balance text-ink sm:text-[52px]">
                {post.title}
              </h1>
              <p className="lead mx-auto mt-5 max-w-[640px] sm:text-[18px]">
                {post.excerpt}
              </p>
              <p className="mt-7 inline-flex items-center gap-3 text-[14px] text-ink">
                <BrandMark className="h-9 w-auto shrink-0" />
                <span className="font-semibold">{post.author}</span>
              </p>
            </div>
          </header>

          <div className="px-4 sm:px-8">
            <div className="mx-auto -mt-28 max-w-[1100px] overflow-hidden rounded-[24px] shadow-[0_40px_90px_-50px_rgba(20,26,34,0.45)] sm:-mt-44">
              <Cover post={post} className="aspect-[16/9] w-full" />
            </div>

            <div className="mx-auto max-w-[680px] pt-10 pb-16 sm:pt-14 sm:pb-24">
              <Body blocks={post.body} />

              <aside
                className="mt-16 rounded-[24px] bg-night p-7 text-white sm:p-10"
                aria-labelledby="article-subscribe"
              >
                <h2
                  id="article-subscribe"
                  className="font-display text-[24px] leading-tight font-bold tracking-[-0.015em] sm:text-[28px]"
                >
                  Enjoyed this issue?
                </h2>
                <p className="mt-2 mb-6 text-[15px] leading-[1.6] text-white/70">
                  Get The Founder Brief every other Thursday. Free, and a
                  5-minute read.
                </p>
                <SubscribeForm source={`article:${post.slug}`} tone="dark" />
              </aside>
            </div>
          </div>
        </article>

        {more.length > 0 && (
          <section
            aria-labelledby="more-title"
            className="border-t border-line-soft bg-cream px-4 py-16 sm:px-8 sm:py-20"
          >
            <div className="mx-auto max-w-[1720px] lg:px-6">
              <div className="flex items-end justify-between gap-6">
                <h2 id="more-title" className="title-section">
                  More from <span className="text-brand-strong">the Brief</span>
                </h2>
                <Link
                  href="/newsletter#latest"
                  className="group hidden items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] whitespace-nowrap text-ink uppercase transition-colors duration-200 hover:text-brand-strong sm:inline-flex"
                >
                  All issues
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
              <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {more.map((p) => (
                  <li key={p.slug}>
                    <PostCard post={p} />
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
