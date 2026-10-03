import type { Metadata } from "next";
import { LOCALE_INFO } from "@/i18n/config";
import { LocalLink as Link } from "@/i18n/client";
import { getDictionary, getLocale } from "@/i18n/server";
import { AlertIcon } from "./icons";
import Footer from "./Footer";
import Navbar from "./Navbar";
import PageHeader from "./PageHeader";
import { rich } from "./startups/i18n";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  after?: string[];
};

export type LegalDoc = "privacy" | "terms" | "conduct";

const LEGAL_PAGES: { doc: LegalDoc; href: string }[] = [
  { doc: "privacy", href: "/privacy" },
  { doc: "terms", href: "/terms" },
  { doc: "conduct", href: "/code-of-conduct" },
];

/** A legal page's title and description in the page's language. */
export async function legalMetadata(doc: LegalDoc): Promise<Metadata> {
  const t = (await getDictionary()).legal[doc];
  return { title: t.metaTitle, description: t.metaDescription };
}

/* Shared frame for the legal pages: a short intro, numbered sections and
   links between the three documents. The frame is in the page's language;
   the document itself is in English everywhere (a legal translation needs a
   lawyer), with a notice saying so on the other languages' pages. */
export default async function LegalArticle({
  doc,
  updated,
  sections,
}: {
  doc: LegalDoc;
  /** YYYY-MM-DD */
  updated: string;
  /** The document, in English. */
  sections: LegalSection[];
}) {
  const [{ legal: t }, locale] = await Promise.all([getDictionary(), getLocale()]);
  const english = locale === "en";
  const current = LEGAL_PAGES.find((p) => p.doc === doc)?.href;
  const updatedLabel = new Date(`${updated}T00:00:00Z`).toLocaleDateString(
    LOCALE_INFO[locale].intl,
    {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    },
  );

  return (
    <>
      <Navbar />
      <main id="main">
        <PageHeader eyebrow={t.eyebrow} title={t[doc].title}>
          {t[doc].intro}
        </PageHeader>
        <div className="px-4 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16 lg:px-6">
            <article className="max-w-[720px]">
              <p className="text-[13px] text-muted">
                {rich(t.lastUpdated, {
                  date: <time dateTime={updated}>{updatedLabel}</time>,
                })}
              </p>
              {!english && (
                <p
                  role="note"
                  className="mt-5 flex items-start gap-2.5 rounded-xl border border-chip-line bg-chip/60 px-4 py-3 text-[14px] leading-[1.6] text-ink-soft"
                >
                  <AlertIcon className="mt-[3px] h-4 w-4 shrink-0 text-brand-strong" />
                  {t.englishNotice}
                </p>
              )}
              <ol
                lang={english ? undefined : "en"}
                dir={english ? undefined : "ltr"}
                className="mt-8 flex flex-col gap-10"
              >
                {sections.map((s, i) => (
                  <li key={s.title}>
                    <h2 className="font-display text-[22px] leading-tight font-bold tracking-[-0.015em] text-ink">
                      <span className="me-2 text-brand-strong tabular-nums">
                        {i + 1}.
                      </span>
                      {s.title}
                    </h2>
                    {s.paragraphs?.map((p) => (
                      <p
                        key={p}
                        className="mt-3 text-[16px] leading-[1.75] text-ink-soft/90"
                      >
                        {p}
                      </p>
                    ))}
                    {s.bullets && (
                      <ul className="mt-3 flex flex-col gap-2">
                        {s.bullets.map((b) => (
                          <li
                            key={b}
                            className="flex gap-3 text-[16px] leading-[1.7] text-ink-soft/90"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                            />
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                    {s.after?.map((p) => (
                      <p
                        key={p}
                        className="mt-3 text-[16px] leading-[1.75] text-ink-soft/90"
                      >
                        {p}
                      </p>
                    ))}
                  </li>
                ))}
              </ol>
            </article>

            <aside className="lg:sticky lg:top-8 lg:self-start">
              <div className="card p-5">
                <p className="font-display text-[11px] font-bold tracking-[0.16em] text-muted uppercase">
                  {t.nav}
                </p>
                <ul className="mt-3 flex flex-col gap-1">
                  {LEGAL_PAGES.map((p) => (
                    <li key={p.doc}>
                      <Link
                        href={p.href}
                        aria-current={p.href === current ? "page" : undefined}
                        className={`block rounded-xl px-3 py-2 text-[14px] font-semibold transition-colors ${
                          p.href === current
                            ? "bg-ink text-white"
                            : "text-ink-soft hover:bg-cream"
                        }`}
                      >
                        {t[p.doc].title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-line-soft pt-4 text-[13px] leading-[1.6] text-muted">
                  {t.questions}{" "}
                  <Link
                    href="/contact"
                    className="font-semibold text-ink underline-offset-4 hover:underline"
                  >
                    {t.contactUs}
                  </Link>
                  .
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
