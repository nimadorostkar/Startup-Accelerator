import type { Metadata } from "next";
import { LocalLink as Link } from "@/i18n/client";
import { getDictionary } from "@/i18n/server";
import Footer from "@/components/Footer";
import { ArrowRight } from "@/components/icons";
import Navbar from "@/components/Navbar";
import ButtonLink from "@/components/ui/ButtonLink";
import Eyebrow from "@/components/ui/Eyebrow";

export async function generateMetadata(): Promise<Metadata> {
  const { common } = await getDictionary();
  return { title: common.notFound.title, robots: { index: false, follow: false } };
}

const PLACES = [
  { href: "/startups", label: "startups", blurb: "startupsBlurb" },
  { href: "/events", label: "events", blurb: "eventsBlurb" },
  { href: "/newsletter", label: "newsletter", blurb: "newsletterBlurb" },
  { href: "/contact", label: "contact", blurb: "contactBlurb" },
] as const;

export default async function NotFound() {
  const { common } = await getDictionary();
  const t = common.notFound;
  return (
    <>
      <Navbar />
      <main
        id="main"
        className="bg-cream px-4 pt-[124px] pb-20 sm:px-8 sm:pb-28 lg:pt-[calc(min(5.74vw,110px)+72px)]"
      >
        <div className="mx-auto max-w-[760px] text-center">
          <Eyebrow className="justify-center">{t.eyebrow}</Eyebrow>
          <h1 className="mt-5 font-display text-[44px] leading-[0.98] font-extrabold tracking-[-0.03em] text-ink uppercase sm:text-[72px]">
            {t.headingStart} <span className="text-brand-strong">{t.headingAccent}</span>
          </h1>
          <p className="lead mx-auto mt-6 max-w-[520px] sm:text-[17px]">{t.lead}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/">{t.home}</ButtonLink>
          </div>
          <ul className="mt-14 grid gap-3 text-start sm:grid-cols-2">
            {PLACES.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="card card-lift group flex items-center justify-between gap-4 p-5"
                >
                  <span>
                    <span className="block text-[16px] font-bold text-ink">
                      {common.nav[p.label]}
                    </span>
                    <span className="block text-[13px] text-muted">
                      {t[p.blurb]}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-brand-strong transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
