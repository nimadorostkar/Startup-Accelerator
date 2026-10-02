import Link from "next/link";
import HeaderShell from "./HeaderShell";
import MobileMenu from "./MobileMenu";
import { NAV_LINKS } from "./nav-links";
import { ArrowRight, ChevronRight } from "./icons";
import { BrandLogo } from "./Logo";

/* `tone="dark"` for pages whose hero is dark: text turns white while the
   bar sits over the hero, and back to ink once the pinned mobile bar frosts
   or the menu opens (both give it a white background).

   `variant="summit"` is the landing page's bar from the Fundup Club hero
   design: white, sentence-case links with an orange underline on hover and an
   orange "Launch your startup" button, laid out on the hero's 1440px frame
   (76px tall there). */
export default function Navbar({
  tone = "light",
  variant = "classic",
}: {
  tone?: "light" | "dark";
  variant?: "classic" | "summit";
}) {
  const summit = variant === "summit";
  const dark = tone === "dark" && !summit;
  const ink = summit
    ? "text-ink"
    : dark
      ? "text-white max-lg:group-data-[scrolled]/header:text-ink max-lg:group-has-[[aria-expanded=true]]/header:text-ink"
      : "text-ink";
  const linkText = summit
    ? "relative font-display text-[max(13px,1cqw)] font-medium whitespace-nowrap after:absolute after:inset-x-0 after:-bottom-1.5 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:after:scale-x-100 focus-visible:after:scale-x-100"
    : "font-display text-[max(9px,0.67cqw)] font-semibold tracking-[0.06em] whitespace-nowrap uppercase transition-colors duration-200 hover:text-brand";
  return (
    <HeaderShell>
      {summit ? (
        /* Frosted cream bar, all sizes */
        <div
          aria-hidden="true"
          className="summit-drop absolute inset-x-0 top-0 -z-10 h-[64px] border-b border-ink/[0.07] bg-white/85 backdrop-blur-[16px] lg:h-[min(5.28vw,101.4px)]"
        />
      ) : (
        /* Hairline under the bar */
        <div
          aria-hidden="true"
          className={`absolute inset-x-0 top-[64px] h-px lg:top-[min(5.26vw,101px)] ${dark ? "bg-white/15" : "bg-ink/10"}`}
        />
      )}
      <div className="mx-auto w-full max-w-[1920px] @container">
        <div
          className={`flex h-[64px] items-center px-6 sm:px-8 ${summit ? "summit-drop lg:h-[5.28cqw] lg:px-[5.56cqw]" : "lg:h-[5.74cqw] lg:pr-[4.25cqw] lg:pl-[3.65cqw]"}`}
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label="Fundup Club home"
            className="flex shrink-0 items-center"
          >
            <BrandLogo className="h-[34px] w-auto lg:h-[max(30px,2.75cqw)]" />
          </Link>

          {/* Divider */}
          <span
            aria-hidden="true"
            className={`hidden w-px shrink-0 ${summit ? "lg:hidden" : `lg:block h-[2.2cqw] lg:ml-[3.83cqw] ${dark ? "bg-white/30" : "bg-ink/30"}`}`}
          />

          {/* Links */}
          <nav
            aria-label="Primary"
            className={`hidden items-center lg:flex ${summit ? "gap-[2.92cqw] lg:mx-auto" : "gap-[3.26cqw] lg:ml-[9.99cqw]"}`}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`${linkText} ${ink}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + mobile menu */}
          <div
            className={`flex items-center gap-3 ${summit ? "ml-auto lg:ml-0 lg:gap-[2.12cqw]" : "ml-auto lg:gap-[1.6cqw]"}`}
          >
            <Link
              href="/login"
              className={`hidden lg:block ${linkText} ${ink}`}
            >
              Sign in
            </Link>
            {summit ? (
              <Link
                href="/dashboard"
                className="group hidden h-[42px] items-center justify-center gap-2.5 rounded-[10px] bg-brand-strong px-5 shadow-[0_10px_24px_-12px_rgba(194,71,10,0.7)] transition-[translate,background-color] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:-translate-y-0.5 hover:bg-[#a33b08] focus-visible:rounded-[10px] sm:inline-flex lg:h-[max(38px,3.06cqw)] lg:gap-[0.7cqw] lg:rounded-[0.7cqw] lg:px-[1.53cqw]"
              >
                <span className="font-display text-[14px] font-semibold whitespace-nowrap text-white lg:text-[max(13px,1.04cqw)]">
                  Launch your startup
                </span>
                <ArrowRight className="h-[1.05em] w-[1.05em] shrink-0 text-white transition-transform duration-300 group-hover:translate-x-1 lg:h-[max(14px,1.04cqw)] lg:w-[max(14px,1.04cqw)]" />
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="group hidden h-[42px] items-center justify-center gap-3 rounded-full bg-brand-strong px-6 shadow-[0_10px_28px_-12px_rgba(194,71,10,0.85)] transition-[filter] duration-200 hover:brightness-105 sm:inline-flex lg:h-[2.57cqw] lg:min-h-[36px] lg:gap-[0.9cqw] lg:px-[1.8cqw]"
              >
                <span className="font-display text-[11px] font-bold tracking-[0.03em] whitespace-nowrap text-white uppercase lg:text-[max(10px,0.8cqw)]">
                  Apply Now
                </span>
                <ChevronRight className="h-[1.15em] w-[1.15em] shrink-0 text-white transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            )}
            {/* Compact CTA once the hero's own button has scrolled away */}
            <Link
              href="/dashboard"
              className="invisible inline-flex h-10 translate-y-1 items-center gap-2 rounded-full bg-brand-strong px-4 opacity-0 shadow-[0_8px_20px_-10px_rgba(194,71,10,0.9)] transition-[opacity,translate,visibility] duration-300 group-data-[past-hero]/header:visible group-data-[past-hero]/header:translate-y-0 group-data-[past-hero]/header:opacity-100 group-has-[[aria-expanded=true]]/header:invisible! group-has-[[aria-expanded=true]]/header:opacity-0! sm:hidden"
            >
              <span className="font-display text-[11px] font-bold tracking-[0.06em] whitespace-nowrap text-white uppercase">
                Apply
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-white" />
            </Link>
            <MobileMenu buttonClassName={ink} />
          </div>
        </div>
      </div>
    </HeaderShell>
  );
}
