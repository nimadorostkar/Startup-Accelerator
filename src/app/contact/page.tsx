import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
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

export const metadata: Metadata = {
  title: "Contact — VC Summit",
  description:
    "Questions about the accelerator, investing or partnerships? Send the VC Summit team a message.",
};

const SHORTCUTS: {
  Icon: (p: { className?: string }) => ReactNode;
  title: string;
  body: string;
  href: string;
  cta: string;
}[] = [
  {
    Icon: RocketIcon,
    title: "Ready to apply?",
    body: "Applications for Silicon Valley Fall 2026 are open. Applying is free.",
    href: "/dashboard",
    cta: "Start your application",
  },
  {
    Icon: TargetIcon,
    title: "Program questions",
    body: "Costs, equity, agreements and which program fits you.",
    href: "/#faq",
    cta: "Read the FAQ",
  },
  {
    Icon: UserCheckIcon,
    title: "Already applied?",
    body: "Check your application's status and any messages from our team.",
    href: "/login",
    cta: "Sign in",
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          eyebrow="Contact"
          title={
            <>
              Let&rsquo;s <span className="text-gold-deep">talk</span>
            </>
          }
        >
          Founders, investors, mentors and press: send us a message and the
          right person on the team will get back to you.
        </PageHeader>

        <section className="px-4 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-[1720px] gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14 lg:px-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <Reveal className="card relative p-6 sm:p-10">
              <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-ink sm:text-[26px]">
                Send us a message
              </h2>
              <p className="mt-2 mb-8 text-[14px] text-muted">
                All fields are required unless marked optional.
              </p>
              <ContactForm topics={CONTACT_TOPICS} />
            </Reveal>

            <aside
              aria-label="Other ways to get help"
              className="flex flex-col gap-4"
            >
              {SHORTCUTS.map(({ Icon, title, body, href, cta }, i) => (
                <Reveal key={title} delay={100 + i * 80}>
                  <Link
                    href={href}
                    className="card card-lift group flex gap-4 p-6"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-chip ring-1 ring-chip-line">
                      <Icon className="h-5 w-5 text-gold-deep" />
                    </span>
                    <span>
                      <span className="block text-[17px] font-bold text-ink">
                        {title}
                      </span>
                      <span className="mt-1.5 block text-[14px] leading-[1.6] text-muted">
                        {body}
                      </span>
                      <span className="mt-3 inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-gold-deep uppercase">
                        {cta}
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
