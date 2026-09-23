import type { Metadata, Viewport } from "next";
import { Anybody, Archivo, DM_Sans } from "next/font/google";
import "./globals.css";

// Expanded ultra-black display face — headline and stat numerals.
const anybody = Anybody({
  variable: "--font-anybody",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

// Wide grotesque for tracked uppercase UI labels.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

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
      className={`${anybody.variable} ${archivo.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white">{children}</body>
    </html>
  );
}
