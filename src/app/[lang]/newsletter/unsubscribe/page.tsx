import type { Metadata } from "next";
import { LocalLink as Link } from "@/i18n/client";
import { getDictionary } from "@/i18n/server";
import { rich } from "@/i18n/rich";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import UnsubscribeForm from "@/components/newsletter/UnsubscribeForm";
import Eyebrow from "@/components/ui/Eyebrow";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary()).newsletter.unsubscribe;
  return { title: t.metaTitle, robots: { index: false, follow: false } };
}

export default async function UnsubscribePage({ searchParams }: PageProps<"/[lang]/newsletter/unsubscribe">) {
  const t = (await getDictionary()).newsletter.unsubscribe;
  const { token } = await searchParams;
  // Missing, empty or given twice (?token=a&token=b): nothing to send.
  const value = typeof token === "string" ? token.trim() : "";

  return (
    <>
      <Navbar />
      <main id="main" className="bg-cream px-4 pt-[120px] pb-24 sm:px-8 lg:pt-[calc(min(5.74vw,110px)+64px)]">
        <div className="mx-auto max-w-[640px]">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h1 className="mt-4 font-display text-[32px] leading-[1.08] font-bold tracking-[-0.02em] text-ink sm:text-[40px]">
            {t.heading}
          </h1>
          <p className="lead mt-3">{t.lead}</p>
          {value ? (
            <UnsubscribeForm token={value} t={t} />
          ) : (
            <p className="mt-8 rounded-xl border border-line bg-white px-4 py-3 text-[14px] text-ink-soft">
              {rich(t.incomplete, {
                link: (
                  <Link href="/newsletter" className="font-semibold text-brand-strong hover:text-ink">
                    {t.incompleteLink}
                  </Link>
                ),
              })}
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
