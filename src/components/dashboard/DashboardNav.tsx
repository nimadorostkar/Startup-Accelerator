"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckIcon } from "../icons";
import { NAV_ICONS, type NavIcon } from "./icons";

export type NavItem = {
  href: string;
  label: string;
  icon: NavIcon;
  /** Section completion, shown as a check or "3/6". */
  done?: number;
  total?: number;
  /** Small text on the right instead of a count. */
  note?: string;
};

function Progress({ done, total }: { done: number; total: number }) {
  if (done === total)
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green text-white" title="Complete">
        <CheckIcon className="h-3 w-3" />
        <span className="sr-only">complete</span>
      </span>
    );
  return (
    <span className="text-[12px] font-semibold text-muted tabular-nums">
      {done}/{total}
      <span className="sr-only"> answered</span>
    </span>
  );
}

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

/** Vertical list for the desktop sidebar. */
export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard">
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = NAV_ICONS[item.icon];
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] font-semibold transition-colors duration-150 ${
                  active ? "bg-ink text-white" : "text-ink-soft hover:bg-cream hover:text-ink"
                }`}
              >
                <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-gold" : "text-muted group-hover:text-gold-deep"}`} />
                <span className="flex-1">{item.label}</span>
                {item.total !== undefined && (
                  <span className={active ? "[&_span]:text-white/70" : ""}>
                    <Progress done={item.done ?? 0} total={item.total} />
                  </span>
                )}
                {item.note && <span className={`text-[12px] ${active ? "text-white/70" : "text-muted"}`}>{item.note}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Horizontal, swipeable tabs under the mobile header. */
export function TabNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard" className="snap-row [--bleed:16px] gap-2 py-2.5 sm:[--bleed:32px]">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const complete = item.total !== undefined && item.done === item.total;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors ${
              active ? "bg-ink text-white" : "bg-white text-ink-soft ring-1 ring-line-soft"
            }`}
          >
            {item.label}
            {complete && <CheckIcon className={`h-3.5 w-3.5 ${active ? "text-gold" : "text-green"}`} />}
            {item.total !== undefined && !complete && (
              <span className={`text-[11px] tabular-nums ${active ? "text-white/60" : "text-muted"}`}>
                {item.done}/{item.total}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
