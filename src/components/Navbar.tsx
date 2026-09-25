import Link from "next/link";
import HeaderShell from "./HeaderShell";
import MobileMenu from "./MobileMenu";
import { NAV_LINKS } from "./nav-links";
import { ChevronRight } from "./icons";
import { VCMark } from "./Logo";

/* `tone="dark"` for pages whose hero is dark: text turns white while the
   bar sits over the hero, and back to ink once the pinned mobile bar frosts
   or the menu opens (both give it a white background). */
export default function Navbar({
  tone = "light",
}: {
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const ink = dark
    ? "text-white max-lg:group-data-[scrolled]/header:text-ink max-lg:group-has-[[aria-expanded=true]]/header:text-ink"
    : "text-ink";
  return (
    <HeaderShell>
      {/* Hairline under the bar */}
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-[64px] h-px lg:top-[min(5.26vw,101px)] ${dark ? "bg-white/15" : "bg-ink/10"}`}
      />
      <div className="mx-auto w-full max-w-[1920px] @container">
        <div className="flex h-[64px] items-center px-6 sm:px-8 lg:h-[5.74cqw] lg:pr-[4.25cqw] lg:pl-[3.65cqw]">
          {/* Logo */}
          <Link
            href="/"
            aria-label="VC Summit home"
            className={`flex shrink-0 items-center gap-3 lg:gap-[1.2cqw] ${ink}`}
          >
            <VCMark className="h-[26px] w-auto lg:h-[1.95cqw]" />
            <span className="font-display text-[13px] leading-none font-semibold tracking-[0.115em] lg:text-[1.08cqw]">
              SUMMIT
            </span>
          </Link>

          {/* Divider */}
          <span
            aria-hidden="true"
            className={`hidden h-[2.2cqw] w-px shrink-0 lg:ml-[3.83cqw] lg:block ${dark ? "bg-white/30" : "bg-ink/30"}`}
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
                className={`font-display text-[max(9px,0.67cqw)] font-semibold tracking-[0.06em] whitespace-nowrap uppercase transition-colors duration-200 hover:text-gold ${ink}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + mobile menu */}
          <div className="ml-auto flex items-center gap-3 lg:gap-[1.6cqw]">
            <Link
              href="/login"
              className={`font-display hidden text-[max(9px,0.67cqw)] font-semibold tracking-[0.06em] whitespace-nowrap uppercase transition-colors duration-200 hover:text-gold lg:block ${ink}`}
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="group hidden h-[42px] items-center justify-center gap-3 rounded-full bg-gold-light px-6 shadow-[0_10px_28px_-12px_rgba(214,150,67,0.85)] transition-[filter] duration-200 hover:brightness-105 sm:inline-flex lg:h-[2.57cqw] lg:min-h-[36px] lg:gap-[0.9cqw] lg:px-[1.8cqw]"
            >
              <span className="font-display text-[11px] font-bold tracking-[0.03em] whitespace-nowrap text-gold-ink uppercase lg:text-[max(10px,0.8cqw)]">
                Apply Now
              </span>
              <ChevronRight className="h-[1.15em] w-[1.15em] shrink-0 text-gold-ink transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            {/* Compact CTA once the hero's own button has scrolled away */}
            <Link
              href="/dashboard"
              className="invisible inline-flex h-10 translate-y-1 items-center gap-2 rounded-full bg-gold-btn px-4 opacity-0 shadow-[0_8px_20px_-10px_rgba(214,150,67,0.9)] transition-[opacity,translate,visibility] duration-300 group-data-[past-hero]/header:visible group-data-[past-hero]/header:translate-y-0 group-data-[past-hero]/header:opacity-100 group-has-[[aria-expanded=true]]/header:invisible! group-has-[[aria-expanded=true]]/header:opacity-0! sm:hidden"
            >
              <span className="font-display text-[11px] font-bold tracking-[0.06em] whitespace-nowrap text-gold-ink uppercase">
                Apply
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-gold-ink" />
            </Link>
            <MobileMenu buttonClassName={ink} />
          </div>
        </div>
      </div>
    </HeaderShell>
  );
}
