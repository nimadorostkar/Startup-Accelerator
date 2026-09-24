import type { Metadata } from "next";
import Link from "next/link";
import { SidebarNav, TabNav, type NavItem } from "@/components/dashboard/DashboardNav";
import FocusFromHash from "@/components/dashboard/FocusFromHash";
import { ChatIcon, LogOutIcon } from "@/components/dashboard/icons";
import { initials } from "@/components/dashboard/initials";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { VCMark } from "@/components/Logo";
import { getMyApplication, requireUser } from "@/lib/application/dal";
import { progress } from "@/lib/application/progress";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: { template: "%s — VC Summit", default: "Dashboard — VC Summit" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await requireUser();
  const app = await getMyApplication();
  const p = progress(app);
  const section = (id: string) => p.sections.find((s) => s.id === id)!;

  const nav: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: "overview" },
    { href: "/dashboard/profile", label: "Profile", icon: "profile", ...pick(section("profile")) },
    { href: "/dashboard/startup", label: "Startup", icon: "startup", ...pick(section("startup")) },
    { href: "/dashboard/team", label: "Team", icon: "team", ...pick(section("team")) },
    { href: "/dashboard/review", label: "Review & submit", icon: "review" },
  ];
  const name = app.profile.fullName || user.name;

  return (
    <div className="min-h-[100svh] bg-cream lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-[100svh] flex-col border-r border-line-soft bg-white px-4 py-6 lg:flex">
        <Link href="/" aria-label="VC Summit home" className="flex items-center gap-3 px-3 text-ink">
          <VCMark className="h-[22px] w-auto" />
          <span className="font-display text-[12px] leading-none font-semibold tracking-[0.115em]">SUMMIT</span>
        </Link>

        <div className="mt-7 rounded-2xl border border-line-soft bg-cream/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
            <span className="text-[12px] font-semibold text-muted">Application</span>
            <StatusBadge status={app.status} />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-[22px] leading-none font-extrabold text-ink tabular-nums">{p.percent}%</span>
            <span className="text-[12px] text-muted">complete</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line-soft">
            <div className="h-full rounded-full bg-gold" style={{ width: `${p.percent}%` }} />
          </div>
        </div>

        <div className="mt-6">
          <SidebarNav items={nav} />
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <Link
            href="/#faq"
            className="group flex items-start gap-3 rounded-2xl bg-navy p-4 text-white transition-[filter] hover:brightness-110"
          >
            <ChatIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <span>
              <span className="block text-[13px] font-semibold">Questions?</span>
              <span className="mt-0.5 block text-[12px] leading-snug text-white/70">
                Read the FAQ or reply to any email from the review team.
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3 border-t border-line-soft px-1 pt-4">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-display text-[13px] font-bold text-gold"
            >
              {initials(name)}
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[14px] font-semibold text-ink">{name}</span>
              <span className="block truncate text-[12px] text-muted">{user.email}</span>
            </span>
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Sign out"
                title="Sign out"
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-cream hover:text-ink"
              >
                <LogOutIcon className="h-[18px] w-[18px]" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Mobile header + tabs */}
        <header className="sticky top-0 z-20 border-b border-line-soft bg-cream/90 px-4 backdrop-blur-md sm:px-8 lg:hidden">
          <div className="flex h-14 items-center justify-between gap-3">
            <Link href="/" aria-label="VC Summit home" className="flex items-center gap-2.5 text-ink">
              <VCMark className="h-[20px] w-auto" />
              <span className="font-display text-[11px] leading-none font-semibold tracking-[0.115em]">SUMMIT</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <StatusBadge status={app.status} />
              <details className="relative">
                <summary
                  aria-label="Account menu"
                  className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full bg-ink font-display text-[12px] font-bold text-gold [&::-webkit-details-marker]:hidden"
                >
                  {initials(name)}
                </summary>
                <div className="absolute top-11 right-0 z-30 w-60 rounded-2xl border border-line-soft bg-white p-2 shadow-[0_20px_50px_-20px_rgba(0,15,22,0.35)]">
                  <p className="px-3 pt-2 pb-3 leading-tight">
                    <span className="block truncate text-[14px] font-semibold text-ink">{name}</span>
                    <span className="block truncate text-[12px] text-muted">{user.email}</span>
                  </p>
                  <form action={signOut} className="border-t border-line-soft pt-1">
                    <button
                      type="submit"
                      className="flex h-11 w-full items-center gap-2.5 rounded-xl px-3 text-[14px] font-semibold text-ink-soft hover:bg-cream"
                    >
                      <LogOutIcon className="h-[18px] w-[18px]" />
                      Sign out
                    </button>
                  </form>
                </div>
              </details>
            </div>
          </div>
          <TabNav items={nav} />
        </header>

        <main className="mx-auto w-full max-w-[1080px] px-4 pt-6 pb-16 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10">
          {children}
        </main>
        <FocusFromHash />
      </div>
    </div>
  );
}

function pick(s: { done: number; total: number }) {
  return { done: s.done, total: s.total };
}
