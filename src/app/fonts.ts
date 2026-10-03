import { DM_Sans, Vazirmatn } from "next/font/google";

/* DM Sans for Latin scripts (latin-ext for Turkish: ş, ğ, İ, ı…); Vazirmatn for
   Persian, which DM Sans doesn't cover. globals.css picks Vazirmatn for
   html[lang="fa"]. */
export const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
  preload: false, // only Persian pages use it
});
