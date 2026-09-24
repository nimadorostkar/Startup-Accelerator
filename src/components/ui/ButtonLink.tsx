import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "../icons";

type Variant = "primary" | "green" | "white" | "outline" | "outline-dark";

const VARIANT: Record<Variant, { box: string; text: string; icon: string }> = {
  primary: {
    box: "btn-shine bg-gold-btn shadow-[0_16px_38px_-16px_rgba(214,150,67,0.85)] hover:brightness-105",
    text: "text-gold-ink",
    icon: "text-gold-ink",
  },
  green: {
    box: "bg-[linear-gradient(180deg,#569262,var(--green-bright))] shadow-[0_16px_38px_-16px_rgba(59,127,72,0.9)] hover:brightness-110",
    text: "text-white",
    icon: "text-white",
  },
  white: {
    box: "bg-white shadow-[0_18px_40px_-18px_rgba(5,40,20,0.7)] hover:shadow-[0_22px_46px_-18px_rgba(5,40,20,0.85)]",
    text: "text-green-deep",
    icon: "text-green-deep",
  },
  outline: {
    box: "border border-line bg-white hover:border-gold",
    text: "text-ink",
    icon: "text-ink-soft group-hover:text-gold-deep",
  },
  "outline-dark": {
    box: "border border-white/15 bg-white/[0.04] backdrop-blur-sm hover:border-gold/60 hover:bg-white/[0.08]",
    text: "text-white",
    icon: "text-white/70 group-hover:text-gold",
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
