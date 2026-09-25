import Link from "next/link";
import type { ReactNode } from "react";
import { PlusMark } from "./icons";
import { VCMark } from "./Logo";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Program",
    links: [
      { label: "Apply now", href: "/dashboard" },
      { label: "The six stages", href: "/#program" },
      { label: "Demo Day", href: "/demo-day" },
      { label: "Admissions FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "Startups", href: "/startups" },
      { label: "Events", href: "/events" },
      { label: "Newsletter", href: "/newsletter" },
      { label: "Founder stories", href: "/#results" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Featured founders", href: "/#accelerator" },
      { label: "Sign in", href: "/login" },
    ],
  },
];

const LEGAL = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of use", href: "/terms" },
  { label: "Code of conduct", href: "/code-of-conduct" },
];

const icon = (d: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="currentColor"
    aria-hidden="true"
  >
    {d}
  </svg>
);

/* Add the profile URLs to show the icons; ones without a URL stay hidden. */
const SOCIAL: { label: string; href: string; svg: ReactNode }[] = [
  {
    label: "Instagram",
    href: "",
    svg: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "",
    svg: icon(
      <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.7.5a2.7 2.7 0 0 0-1.9 1.9C2 8.9 2 12 2 12s0 3.1.4 4.8a2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9c.4-1.7.4-4.8.4-4.8s0-3.1-.4-4.8ZM10 15.1V8.9l5.2 3.1Z" />,
    ),
  },
  {
    label: "Facebook",
    href: "",
    svg: icon(
      <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21Z" />,
    ),
  },
  {
    label: "X",
    href: "",
    svg: icon(
      <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8Zm-1.1 16.2h1.7L7.4 4.7H5.6Z" />,
    ),
  },
  {
    label: "LinkedIn",
    href: "",
    svg: icon(
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3Zm6.5 0h3.8v1.54h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.07c0-1.21-.02-2.77-1.69-2.77-1.69 0-1.95 1.32-1.95 2.68V21h-4Z" />,
    ),
  },
];

export default function Footer() {
  const social = SOCIAL.filter((s) => s.href);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line-soft bg-cream px-4 pt-14 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-20 xl:pt-24">
      <div className="mx-auto max-w-[1720px] lg:px-6">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-16 xl:grid-cols-[minmax(0,380px)_1fr] xl:gap-24">
          <div>
            <Link
              href="/"
              aria-label="VC Summit home"
              className="inline-flex items-center gap-3 text-ink"
            >
              <VCMark className="h-[26px] w-auto" />
              <span className="font-display text-[13px] leading-none font-semibold tracking-[0.115em]">
                SUMMIT
              </span>
            </Link>
            <p className="mt-6 text-[14px] leading-[1.75] text-muted">
              VC Summit brings together the world&rsquo;s top investors,
              founders and decision makers. Our accelerator helps ambitious
              founders from 65+ markets validate ideas, ship products and raise
              from a network of 180+ investment firms, from first idea to Demo
              Day and beyond.
            </p>
            {social.length > 0 && (
              <ul className="mt-7 flex gap-2.5" aria-label="Social media">
                {social.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink-soft transition-[color,border-color,translate] duration-200 hover:-translate-y-0.5 hover:border-gold hover:text-gold-deep"
                    >
                      {s.svg}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav
            aria-label="Footer"
            className="border-t border-line-soft sm:grid sm:grid-cols-3 sm:gap-x-8 sm:gap-y-10 sm:border-0"
          >
            {COLUMNS.map((col) => (
              <div key={col.title}>
                {/* Phones: each group collapses to a single row */}
                <details className="group border-b border-line-soft sm:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
                    <span className="type-wide text-[11px] font-semibold tracking-[0.16em] text-ink uppercase">
                      {col.title}
                    </span>
                    <PlusMark className="h-4 w-4 text-ink-soft transition-transform duration-300 group-open:rotate-45" />
                  </summary>
                  <ul className="grid grid-cols-2 gap-x-6 pb-4">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <Link
                          href={l.href}
                          className="block py-2 text-[14px] text-muted transition-colors duration-200 active:text-gold-deep"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>

                <div className="hidden sm:block">
                  <h3 className="type-wide text-[11px] font-semibold tracking-[0.16em] text-ink uppercase">
                    {col.title}
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <Link
                          href={l.href}
                          className="text-[14px] text-muted transition-colors duration-200 hover:text-gold-deep"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-4 pt-2 text-[13px] text-muted sm:mt-16 sm:flex-row sm:items-center sm:justify-between sm:border-t sm:border-line-soft sm:pt-7">
          <p>Copyright &copy; {year} VC Summit. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="transition-colors duration-200 hover:text-gold-deep"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
