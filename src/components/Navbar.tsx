import Link from "next/link";
import { ChevronRight } from "./icons";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Speakers", href: "#speakers" },
  { label: "Agenda", href: "#agenda" },
  { label: "Investors", href: "#investors" },
  { label: "Deals", href: "#deals" },
  { label: "Venue", href: "#venue" },
];

export default function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="border-b border-ink/10">
        <div className="mx-auto flex h-[64px] w-full max-w-[1920px] items-center px-6 sm:px-8 lg:h-[5.8vw] lg:max-h-[112px] lg:min-h-[68px] lg:px-[4.1vw]">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-baseline gap-[0.5em]">
            <span className="font-display text-[28px] leading-none font-black tracking-[-0.055em] text-ink lg:text-[2.51vw]">
              <span className="inline-block -mr-[0.15em]">V</span>
              <span className="inline-block">C</span>
            </span>
            <span className="font-display text-[14px] leading-none font-semibold tracking-[0.11em] text-ink lg:text-[1.2vw]">
              SUMMIT
            </span>
          </Link>

          {/* Divider */}
          <span className="mx-[2.3vw] hidden h-[2.8vw] max-h-[54px] w-px bg-ink/20 lg:block" />

          {/* Links */}
          <nav className="hidden flex-1 items-center justify-center gap-[1.72vw] pr-[4.13vw] lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-display text-[max(9px,0.6vw)] font-semibold tracking-[0.12em] whitespace-nowrap text-ink/90 uppercase transition-colors duration-200 hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="ml-auto flex items-center lg:ml-0">
            <Link
              href="#request"
              className="group inline-flex h-[42px] items-center justify-center gap-3 rounded-full bg-gold-light px-6 shadow-[0_10px_28px_-12px_rgba(214,150,67,0.85)] transition-all duration-200 hover:brightness-105 lg:h-[2.57vw] lg:max-h-[50px] lg:min-h-[38px] lg:w-[14.7vw] lg:max-w-[284px] lg:justify-between lg:px-[2.1vw]"
            >
              <span className="font-display text-[10.5px] font-bold tracking-[0.11em] text-gold-ink uppercase lg:text-[max(9px,0.63vw)]">
                Request Invitation
              </span>
              <ChevronRight className="h-[1.15em] w-[1.15em] text-gold-ink transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
