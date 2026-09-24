import Link from "next/link";
import MobileMenu from "./MobileMenu";
import { NAV_LINKS } from "./nav-links";
import { ChevronRight } from "./icons";
import { VCMark } from "./Logo";

export default function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      {/* Hairline under the bar */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[64px] h-px bg-ink/10 lg:top-[min(5.26vw,101px)]"
      />
      <div className="mx-auto w-full max-w-[1920px] @container">
        <div className="flex h-[64px] items-center px-6 sm:px-8 lg:h-[5.74cqw] lg:pr-[4.25cqw] lg:pl-[3.65cqw]">
          {/* Logo */}
          <Link
            href="/"
            aria-label="VC Summit home"
            className="flex shrink-0 items-center gap-3 text-ink lg:gap-[1.2cqw]"
          >
            <VCMark className="h-[26px] w-auto lg:h-[1.95cqw]" />
            <span className="font-display text-[13px] leading-none font-semibold tracking-[0.115em] lg:text-[1.08cqw]">
              SUMMIT
            </span>
          </Link>

          {/* Divider */}
          <span
            aria-hidden="true"
            className="hidden h-[2.2cqw] w-px shrink-0 bg-ink/30 lg:ml-[3.83cqw] lg:block"
          />

          {/* Links */}
          <nav
            aria-label="Primary"
            className="hidden items-center gap-[3.26cqw] lg:ml-[9.99cqw] lg:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-display text-[max(9px,0.67cqw)] font-semibold tracking-[0.06em] whitespace-nowrap text-ink uppercase transition-colors duration-200 hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + mobile menu */}
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="#request"
              className="group hidden h-[42px] items-center justify-center gap-3 rounded-full bg-gold-light px-6 shadow-[0_10px_28px_-12px_rgba(214,150,67,0.85)] transition-[filter] duration-200 hover:brightness-105 sm:inline-flex lg:h-[2.57cqw] lg:min-h-[36px] lg:w-[14.71cqw] lg:justify-between lg:px-[2.1cqw]"
            >
              <span className="font-display text-[11px] font-bold tracking-[0.03em] whitespace-nowrap text-gold-ink uppercase lg:text-[max(10px,0.8cqw)]">
                Request Invitation
              </span>
              <ChevronRight className="h-[1.15em] w-[1.15em] shrink-0 text-gold-ink transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
