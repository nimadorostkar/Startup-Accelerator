import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/dashboard/actions";
import { LogOutIcon } from "@/components/dashboard/icons";
import { initials } from "@/components/dashboard/initials";
import { VCMark } from "@/components/Logo";
import { requireReviewer } from "@/lib/application/review";

/* Generated after the reviewer check, so a refused visitor's 404 doesn't
   carry a title that reveals the panel exists. */
export async function generateMetadata(): Promise<Metadata> {
  await requireReviewer();
  return {
    title: { template: "%s — VC Summit Review", default: "Review queue — VC Summit Review" },
    robots: { index: false, follow: false },
  };
}

/* Shell for the support team's review panel. Access is checked here for the
   header, and again inside every page and action (see lib/application/review.ts). */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const reviewer = await requireReviewer();

  return (
    <div className="min-h-[100svh] bg-cream">
      <header className="sticky top-0 z-20 bg-navy text-white">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-4 px-4 sm:px-8">
          <Link href="/admin" className="flex items-center gap-3">
            <VCMark className="h-[20px] w-auto text-white" />
            <span className="hidden font-display text-[11px] leading-none font-semibold tracking-[0.115em] sm:inline">
              SUMMIT
            </span>
            <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] text-gold uppercase ring-1 ring-gold/30">
              Review
            </span>
          </Link>

          <nav aria-label="Admin" className="ml-2 hidden items-center gap-1 sm:flex">
            <Link href="/admin" className="rounded-full px-3 py-2 text-[13px] font-semibold text-white/80 hover:bg-white/10 hover:text-white">
              Queue
            </Link>
            {/* A file download, not a page — a plain link keeps the browser's download behaviour. */}
            <a
              href="/admin/export"
              className="rounded-full px-3 py-2 text-[13px] font-semibold text-white/80 hover:bg-white/10 hover:text-white"
            >
              Export CSV
            </a>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-right leading-tight md:block">
              <span className="block text-[13px] font-semibold">{reviewer.name}</span>
              <span className="block text-[11px] text-white/60">Review team</span>
            </span>
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gold font-display text-[12px] font-bold text-gold-ink"
            >
              {initials(reviewer.name)}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Sign out"
                title="Sign out"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              >
                <LogOutIcon className="h-[18px] w-[18px]" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-[1320px] px-4 pt-6 pb-16 sm:px-8 sm:pt-8">{children}</main>
    </div>
  );
}
