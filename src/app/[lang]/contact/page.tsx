import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LocalLink as Link } from "@/i18n/client";
import { getDictionary } from "@/i18n/server";
import ContactForm from "@/components/contact/ContactForm";
import Footer from "@/components/Footer";
import { ArrowRight } from "@/components/icons";
import {
  RocketIcon,
  UserCheckIcon,
  TargetIcon,
} from "@/components/journey/icons";
import Reveal from "@/components/motion/Reveal";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import { CONTACT_TOPICS } from "@/lib/contact";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary()).contact;
  return { title: t.metaTitle, description: t.metaDescription };
}

const SHORTCUTS: {
  Icon: (p: { className?: string }) => ReactNode;
  key: "apply" | "program" | "applied";
  href: string;
}[] = [
  { Icon: RocketIcon, key: "apply", href: "/dashboard" },
  { Icon: TargetIcon, key: "program", href: "/#faq" },
  { Icon: UserCheckIcon, key: "applied", href: "/login" },
];

export default async function ContactPage() {
  const t = (await getDictionary()).contact;
  return (
    <>
      <Navbar />
      <main id="main">
        <PageHeader
          eyebrow={t.eyebrow}
          title={
            <>
              {t.titleStart}{" "}
              <span className="text-brand-strong">{t.titleAccent}</span>
            </>
          }
        >
          {t.lead}
        </PageHeader>

        <section className="px-4 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-[1720px] gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14 lg:px-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <Reveal className="card relative p-6 sm:p-10">
              <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink sm:text-[26px]">
                {t.formTitle}
              </h2>
              <p className="mt-2 mb-8 text-[14px] text-muted">{t.formNote}</p>
              <ContactForm topics={CONTACT_TOPICS} t={t.form} />
            </Reveal>

            <aside
              aria-label={t.shortcutsLabel}
              className="flex flex-col gap-4"
            >
              {SHORTCUTS.map(({ Icon, key, href }, i) => {
                const { title, body, cta } = t.shortcuts[key];
                return (
                <Reveal key={key} delay={100 + i * 80}>
                  <Link
                    href={href}
                    className="card card-lift group flex gap-4 p-6"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-chip ring-1 ring-chip-line">
                      <Icon className="h-5 w-5 text-brand-strong" />
                    </span>
                    <span>
                      <span className="block text-[17px] font-bold text-ink">
                        {title}
                      </span>
                      <span className="mt-1.5 block text-[14px] leading-[1.6] text-muted">
                        {body}
                      </span>
                      <span className="mt-3 inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-brand-strong uppercase">
                        {cta}
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </span>
                    </span>
                  </Link>
                </Reveal>
                );
              })}
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
