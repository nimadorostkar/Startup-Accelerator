"use client";

import { useEffect } from "react";
import { BrandLogo } from "@/components/Logo";
import { LocalLink as Link, useLocale } from "@/i18n/client";
import { format } from "@/i18n/format";
import en from "@/i18n/messages/en/common";
import fa from "@/i18n/messages/fa/common";
import tr from "@/i18n/messages/tr/common";

// Only the frame's strings: an error page is a client component, so it can't read the server dictionary.
const COMMON = { en, tr, fa };

/* Shown in place of a page that threw while rendering. Kept free of the
   site's header and footer so it can't fail the same way the page did. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const common = COMMON[useLocale()];
  const t = common.error;
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
          aria-label={common.site.home}
          className="inline-flex items-center"
        >
          <BrandLogo className="h-[38px] w-auto" />
        </Link>
        <h1 className="mt-8 font-display text-[28px] leading-tight font-bold tracking-[-0.02em] text-ink sm:text-[32px]">
          {t.heading}
        </h1>
        <p className="lead mt-3">{t.lead}</p>
        {error.digest && (
          <p className="mt-3 text-[12px] text-muted">
            {format(t.reference, { digest: error.digest })}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="h-12 rounded-full bg-brand-strong px-7 font-display text-[12px] font-bold tracking-[0.06em] text-white uppercase shadow-[0_16px_38px_-16px_rgba(194,71,10,0.85)] transition-[filter] duration-200 hover:brightness-105"
          >
            {t.retry}
          </button>
          <Link
            href="/contact"
            className="flex h-12 items-center justify-center rounded-full border border-line bg-white px-7 font-display text-[12px] font-bold tracking-[0.06em] text-ink uppercase transition-colors hover:border-brand"
          >
            {t.contact}
          </Link>
        </div>
      </div>
    </main>
  );
}
