import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { ArrowRight } from "@/components/icons";
import Navbar from "@/components/Navbar";
import ButtonLink from "@/components/ui/ButtonLink";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Page not found — VC Summit",
  robots: { index: false, follow: false },
};

const PLACES = [
  {
    href: "/startups",
    label: "Startups",
    blurb: "Every company in the program",
  },
  { href: "/events", label: "Events", blurb: "Demo Days, workshops, meetups" },
  { href: "/newsletter", label: "Newsletter", blurb: "The Founder Brief" },
  { href: "/contact", label: "Contact", blurb: "Ask the team" },
];

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main
        id="main"
        className="bg-cream px-4 pt-[124px] pb-20 sm:px-8 sm:pb-28 lg:pt-[calc(min(5.74vw,110px)+72px)]"
      >
        <div className="mx-auto max-w-[760px] text-center">
          <Eyebrow className="justify-center">Error 404</Eyebrow>
          <h1 className="mt-5 font-display text-[44px] leading-[0.98] font-extrabold tracking-[-0.03em] text-ink uppercase sm:text-[72px]">
            This page <span className="text-gold-deep">moved on</span>
          </h1>
          <p className="lead mx-auto mt-6 max-w-[520px] sm:text-[17px]">
            The link may be old, or the page may have been taken down. Here are
            a few places worth going instead.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/">Back to the home page</ButtonLink>
          </div>
          <ul className="mt-14 grid gap-3 text-left sm:grid-cols-2">
            {PLACES.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="card card-lift group flex items-center justify-between gap-4 p-5"
                >
                  <span>
                    <span className="block text-[16px] font-bold text-ink">
                      {p.label}
                    </span>
                    <span className="block text-[13px] text-muted">
                      {p.blurb}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gold-deep transition-transform duration-200 group-hover:translate-x-1" />
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
