import Link from "next/link";
import MobileMenu from "./MobileMenu";
import { NAV_LINKS } from "./nav-links";
import { ChevronRight } from "./icons";

export default function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="border-b border-ink/10">
        <div className="mx-auto w-full max-w-[1920px] @container">
          <div className="flex h-[64px] items-center px-6 sm:px-8 lg:h-[5.8cqw] lg:min-h-[68px] lg:px-[4.1cqw]">
            {/* Logo */}
            <Link
              href="/"
              className="flex shrink-0 items-baseline gap-[0.5em]"
              aria-label="VC Summit home"
            >
              <span className="font-display text-[28px] leading-none font-black tracking-[-0.055em] text-ink lg:text-[2.51cqw]">
                <span className="-mr-[0.15em] inline-block">V</span>
                <span className="inline-block">C</span>
              </span>
              <span className="font-display text-[14px] leading-none font-semibold tracking-[0.11em] text-ink lg:text-[1.2cqw]">
                SUMMIT
              </span>
            </Link>

            {/* Divider */}
            <span
              aria-hidden="true"
              className="mx-[2.3cqw] hidden h-[2.8cqw] w-px bg-ink/20 lg:block"
            />

            {/* Links */}
            <nav
              aria-label="Primary"
              className="hidden flex-1 items-center justify-center gap-[1.72cqw] pr-[4.13cqw] lg:flex"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-display text-[max(9px,0.6cqw)] font-semibold tracking-[0.12em] whitespace-nowrap text-ink/90 uppercase transition-colors duration-200 hover:text-gold"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA + mobile menu */}
            <div className="ml-auto flex items-center gap-3 lg:ml-0 lg:gap-0">
              <Link
                href="#request"
                className="group bg-gold-light hidden h-[42px] items-center justify-center gap-3 rounded-full px-6 shadow-[0_10px_28px_-12px_rgba(214,150,67,0.85)] transition-all duration-200 hover:brightness-105 sm:inline-flex lg:h-[2.57cqw] lg:max-h-[50px] lg:min-h-[38px] lg:w-[14.7cqw] lg:justify-between lg:px-[2.1cqw]"
              >
                <span className="font-display text-[10.5px] font-bold tracking-[0.11em] whitespace-nowrap text-gold-ink uppercase lg:text-[max(9px,0.63cqw)]">
                  Request Invitation
                </span>
                <ChevronRight className="h-[1.15em] w-[1.15em] text-gold-ink transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <MobileMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
