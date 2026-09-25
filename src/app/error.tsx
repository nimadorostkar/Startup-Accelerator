"use client";

import Link from "next/link";
import { useEffect } from "react";
import { VCMark } from "@/components/Logo";

/* Shown in place of a page that threw while rendering. Kept free of the
   site's header and footer so it can't fail the same way the page did. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main"
      className="flex min-h-svh items-center justify-center bg-cream px-4 py-16 sm:px-8"
    >
      <div className="card w-full max-w-[520px] p-8 text-center sm:p-10">
        <Link
          href="/"
          aria-label="VC Summit home"
          className="inline-flex items-center gap-3 text-ink"
        >
          <VCMark className="h-[26px] w-auto" />
          <span className="font-display text-[13px] leading-none font-semibold tracking-[0.115em]">
            SUMMIT
          </span>
        </Link>
        <h1 className="mt-8 font-display text-[28px] leading-tight font-bold tracking-[-0.02em] text-ink sm:text-[32px]">
          Something went wrong
        </h1>
        <p className="lead mt-3">
          We couldn&rsquo;t load this page. Trying again usually fixes it; if it
          keeps happening, let us know.
        </p>
        {error.digest && (
          <p className="mt-3 text-[12px] text-muted">
            Reference: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="h-12 rounded-full bg-gold-btn px-7 font-display text-[12px] font-bold tracking-[0.06em] text-gold-ink uppercase shadow-[0_16px_38px_-16px_rgba(214,150,67,0.85)] transition-[filter] duration-200 hover:brightness-105"
          >
            Try again
          </button>
          <Link
            href="/contact"
            className="flex h-12 items-center justify-center rounded-full border border-line bg-white px-7 font-display text-[12px] font-bold tracking-[0.06em] text-ink uppercase transition-colors hover:border-gold"
          >
            Contact us
          </Link>
        </div>
      </div>
    </main>
  );
}
