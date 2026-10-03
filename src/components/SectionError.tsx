"use client";

import { useEffect } from "react";

/* A page inside the dashboard or the review panel that failed to load (the API
   was unreachable, say). Shown inside the area's own navigation, so the rest
   stays usable; "Try again" re-renders just this page. */
export default function SectionError({
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
    <div role="alert" className="card mx-auto max-w-[560px] p-8 text-center sm:p-10">
      <h1 className="font-display text-[24px] leading-tight font-bold tracking-[-0.02em] text-ink">
        This page didn&rsquo;t load
      </h1>
      <p className="mt-3 text-[15px] leading-[1.6] text-muted">
        We couldn&rsquo;t reach the server just now. Nothing you saved is lost. Trying again usually fixes it.
      </p>
      {error.digest && <p className="mt-3 text-[12px] text-muted">Reference: {error.digest}</p>}
      <button
        type="button"
        onClick={reset}
        className="mt-7 h-11 rounded-full bg-brand-strong px-6 font-display text-[12px] font-bold tracking-[0.06em] text-white uppercase hover:brightness-105"
      >
        Try again
      </button>
    </div>
  );
}
