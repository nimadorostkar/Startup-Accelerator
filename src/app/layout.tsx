import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const TITLE = "VC Summit — Ideas Fund Tomorrow";
const DESCRIPTION =
  "Exclusive summit for the world's top investors, founders and decision makers.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/images/hero.webp", width: 1672, height: 941 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/hero.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#000f16",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} h-full antialiased`}
    >
      <head>
        {/* Enables scroll-reveal hidden states only when JS runs */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full bg-white">
        {children}
      </body>
    </html>
  );
}
