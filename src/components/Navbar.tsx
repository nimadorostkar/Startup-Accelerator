import Link from "next/link";
import HeaderShell from "./HeaderShell";
import MobileMenu from "./MobileMenu";
import { NAV_LINKS } from "./nav-links";
import { ChevronRight } from "./icons";
import { BrandLogo } from "./Logo";

/* `tone="dark"` for pages whose hero is dark: text turns white while the
   bar sits over the hero, and back to ink once the pinned mobile bar frosts
   or the menu opens (both give it a white background).

   `variant="summit"` is the landing page's bar from the hero handoff: frosted
   cream, Archivo, wider tracking, gold underline on hover, laid out on the
   handoff's 1440px frame (84px tall there). Archivo is loaded by the landing
   page, so this variant only belongs there. */
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
    ? "text-summit-ink"
    : dark
      ? "text-white max-lg:group-data-[scrolled]/header:text-ink max-lg:group-has-[[aria-expanded=true]]/header:text-ink"
      : "text-ink";
  const linkText = summit
    ? "relative font-grotesk text-[max(9px,0.833cqw)] font-semibold tracking-[0.14em] whitespace-nowrap uppercase after:absolute after:inset-x-0 after:-bottom-1.5 after:h-[1.5px] after:origin-left after:scale-x-0 after:bg-summit-gold after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:after:scale-x-100 focus-visible:after:scale-x-100"
    : "font-display text-[max(9px,0.67cqw)] font-semibold tracking-[0.06em] whitespace-nowrap uppercase transition-colors duration-200 hover:text-gold";
  return (
    <HeaderShell>
      {summit ? (
        /* Frosted cream bar, all sizes */
        <div
          aria-hidden="true"
          className="summit-drop absolute inset-x-0 top-0 -z-10 h-[64px] border-b border-summit-ink/[0.08] bg-summit-cream/50 backdrop-blur-[16px] lg:h-[min(5.83vw,112px)]"
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
          className={`flex h-[64px] items-center px-6 sm:px-8 ${summit ? "summit-drop lg:h-[5.83cqw] lg:px-[5.56cqw]" : "lg:h-[5.74cqw] lg:pr-[4.25cqw] lg:pl-[3.65cqw]"}`}
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
            className={`hidden w-px shrink-0 lg:block ${summit ? "h-[2.5cqw] bg-summit-ink/20 lg:ml-[1.67cqw]" : `h-[2.2cqw] lg:ml-[3.83cqw] ${dark ? "bg-white/30" : "bg-ink/30"}`}`}
          />

          {/* Links */}
          <nav
            aria-label="Primary"
            className={`hidden items-center lg:flex ${summit ? "gap-[2.78cqw] lg:mx-auto" : "gap-[3.26cqw] lg:ml-[9.99cqw]"}`}
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
                className="group hidden h-[42px] items-center justify-center gap-3 rounded-full bg-summit-gold px-6 shadow-[0_8px_22px_rgba(120,86,30,0.2)] transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(120,86,30,0.32)] focus-visible:rounded-full sm:inline-flex lg:h-[3.33cqw] lg:min-h-[36px] lg:gap-[0.97cqw] lg:px-[1.8cqw]"
              >
                <span className="font-grotesk text-[11px] font-bold tracking-[0.14em] whitespace-nowrap text-summit-ink uppercase lg:text-[max(10px,0.833cqw)]">
                  Apply now
                </span>
                <ChevronRight className="h-[1.1em] w-[1.1em] shrink-0 text-summit-ink transition-transform duration-300 group-hover:translate-x-1 lg:h-[0.9cqw] lg:min-h-[11px] lg:w-[0.9cqw] lg:min-w-[11px]" />
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="group hidden h-[42px] items-center justify-center gap-3 rounded-full bg-gold-light px-6 shadow-[0_10px_28px_-12px_rgba(214,150,67,0.85)] transition-[filter] duration-200 hover:brightness-105 sm:inline-flex lg:h-[2.57cqw] lg:min-h-[36px] lg:gap-[0.9cqw] lg:px-[1.8cqw]"
              >
                <span className="font-display text-[11px] font-bold tracking-[0.03em] whitespace-nowrap text-gold-ink uppercase lg:text-[max(10px,0.8cqw)]">
                  Apply Now
                </span>
                <ChevronRight className="h-[1.15em] w-[1.15em] shrink-0 text-gold-ink transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            )}
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
