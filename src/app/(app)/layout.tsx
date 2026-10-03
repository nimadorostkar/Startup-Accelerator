import type { Metadata, Viewport } from "next";
import HtmlDocument from "@/components/HtmlDocument";
import { MESSAGES } from "@/i18n/messages";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

/* The founder dashboard and the review panel: English only, outside the
   language-prefixed public site (app/[lang]). */
const { title, description, skipToContent } = MESSAGES.en.common.site;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
};

export const viewport: Viewport = {
  themeColor: "#141a22",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <HtmlDocument lang="en" dir="ltr" skipLabel={skipToContent}>
      {children}
    </HtmlDocument>
  );
}
