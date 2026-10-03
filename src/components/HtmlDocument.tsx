import type { ReactNode } from "react";
import { dmSans, vazirmatn } from "@/app/fonts";

/* The <html> and <body> every page shares; rendered by the two root layouts
   (app/[lang]/layout.tsx for the public site, app/(app)/layout.tsx for the
   English-only dashboard and review panel). */
export default function HtmlDocument({
  lang,
  dir,
  skipLabel,
  children,
}: {
  lang: string;
  dir: "ltr" | "rtl";
  skipLabel: string;
  children: ReactNode;
}) {
  return (
    <html
      lang={lang}
      dir={dir}
      suppressHydrationWarning
      className={`${dmSans.variable} ${vazirmatn.variable} h-full antialiased`}
    >
      {/* eslint-disable-next-line @next/next/no-head-element -- this is the root layouts' document (app/[lang]/layout.tsx, app/(app)/layout.tsx) */}
      <head>
        {/* Enables scroll-reveal hidden states only when JS runs */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full bg-white">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-[13px] focus:font-semibold focus:text-white"
        >
          {skipLabel}
        </a>
        {children}
      </body>
    </html>
  );
}
