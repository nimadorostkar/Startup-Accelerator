import Link from "next/link";
import Footer from "./Footer";
import Navbar from "./Navbar";
import PageHeader from "./PageHeader";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  after?: string[];
};

const LEGAL_PAGES = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of use" },
  { href: "/code-of-conduct", label: "Code of conduct" },
];

/* Shared frame for the legal pages: a short intro, numbered sections and
   links between the three documents. */
export default function LegalArticle({
  eyebrow,
  title,
  updated,
  intro,
  sections,
  current,
}: {
  eyebrow: string;
  title: string;
  /** YYYY-MM-DD */
  updated: string;
  intro: string;
  sections: LegalSection[];
  current: string;
}) {
  const updatedLabel = new Date(`${updated}T00:00:00Z`).toLocaleDateString(
    "en-US",
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
        <PageHeader eyebrow={eyebrow} title={title}>
          {intro}
        </PageHeader>
        <div className="px-4 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16 lg:px-6">
            <article className="max-w-[720px]">
              <p className="text-[13px] text-muted">
                Last updated <time dateTime={updated}>{updatedLabel}</time>
              </p>
              <ol className="mt-8 flex flex-col gap-10">
                {sections.map((s, i) => (
                  <li key={s.title}>
                    <h2 className="font-display text-[22px] leading-tight font-bold tracking-[-0.015em] text-ink">
                      <span className="mr-2 text-gold-deep tabular-nums">
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
                              className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
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
                  Legal
                </p>
                <ul className="mt-3 flex flex-col gap-1">
                  {LEGAL_PAGES.map((p) => (
                    <li key={p.href}>
                      <Link
                        href={p.href}
                        aria-current={p.href === current ? "page" : undefined}
                        className={`block rounded-xl px-3 py-2 text-[14px] font-semibold transition-colors ${
                          p.href === current
                            ? "bg-ink text-white"
                            : "text-ink-soft hover:bg-cream"
                        }`}
                      >
                        {p.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-line-soft pt-4 text-[13px] leading-[1.6] text-muted">
                  Questions about any of this?{" "}
                  <Link
                    href="/contact"
                    className="font-semibold text-ink underline-offset-4 hover:underline"
                  >
                    Contact us
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
