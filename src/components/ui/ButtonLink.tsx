import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "../icons";

type Variant = "primary" | "bright" | "white" | "outline" | "outline-dark";

const VARIANT: Record<Variant, { box: string; text: string; icon: string }> = {
  primary: {
    box: "btn-shine bg-brand-strong shadow-[0_16px_38px_-16px_rgba(194,71,10,0.85)] hover:brightness-105",
    text: "text-white",
    icon: "text-white",
  },
  /* Lighter-topped orange for dark bands */
  bright: {
    box: "bg-[linear-gradient(180deg,#e2601c,var(--brand-strong))] shadow-[0_16px_38px_-16px_rgba(239,111,35,0.9)] hover:brightness-110",
    text: "text-white",
    icon: "text-white",
  },
  white: {
    box: "bg-white shadow-[0_18px_40px_-18px_rgba(40,14,3,0.7)] hover:shadow-[0_22px_46px_-18px_rgba(40,14,3,0.85)]",
    text: "text-brand-strong",
    icon: "text-brand-strong",
  },
  outline: {
    box: "border border-line bg-white hover:border-brand",
    text: "text-ink",
    icon: "text-ink-soft group-hover:text-brand-strong",
  },
  "outline-dark": {
    box: "border border-white/15 bg-white/[0.04] backdrop-blur-sm hover:border-brand/60 hover:bg-white/[0.08]",
    text: "text-white",
    icon: "text-white/70 group-hover:text-brand",
  },
};

/* The site's pill button. Primary gets a trailing arrow; outlines take an optional leading icon. */
export default function ButtonLink({
  href,
  children,
  variant = "primary",
  icon,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  icon?: (p: { className?: string }) => ReactNode;
  className?: string;
}) {
  const v = VARIANT[variant];
  const Icon = icon;
  return (
    <Link
      href={href}
      className={`group inline-flex h-12 items-center justify-center gap-3 rounded-full px-7 transition-[filter,translate,border-color,background-color] duration-200 hover:-translate-y-0.5 ${v.box} ${className}`}
    >
      {Icon && (
        <Icon
          className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${v.icon}`}
        />
      )}
      <span
        className={`font-display text-[12px] font-bold tracking-[0.06em] uppercase ${v.text}`}
      >
        {children}
      </span>
      {(variant === "primary" || variant === "green" || variant === "white") && (
        <ArrowRight
          className={`h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:translate-x-1 ${v.icon}`}
        />
      )}
    </Link>
  );
}
