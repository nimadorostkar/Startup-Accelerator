import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import HtmlDocument from "@/components/HtmlDocument";
import { isLocale, LOCALE_INFO, LOCALES, localePath } from "@/i18n/config";
import { LocaleProvider } from "@/i18n/client";
import { MESSAGES } from "@/i18n/messages";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

/* The public site, in each language: /events, /tr/events, /fa/events (the
   proxy maps the bare English paths onto /en). Every language is prerendered. */
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { title, description } = MESSAGES[lang].common.site;
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    // The home page in every language; each page's own alternates are in the sitemap.
    alternates: {
      languages: Object.fromEntries([
        ...LOCALES.map((l) => [LOCALE_INFO[l].intl, localePath(l, "/")]),
        ["x-default", "/"],
      ]),
    },
    openGraph: {
      type: "website",
      locale: LOCALE_INFO[lang].og,
      title,
      description,
      images: [{ url: "/images/hero.webp", width: 1672, height: 941 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/hero.webp"],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#141a22",
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <HtmlDocument lang={lang} dir={LOCALE_INFO[lang].dir} skipLabel={MESSAGES[lang].common.site.skipToContent}>
      <LocaleProvider locale={lang}>{children}</LocaleProvider>
    </HtmlDocument>
  );
}
