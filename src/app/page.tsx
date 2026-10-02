import { Archivo } from "next/font/google";
import CtaBand from "@/components/CtaBand";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import JoinBanner from "@/components/JoinBanner";
import LetterBanner from "@/components/LetterBanner";
import Journey from "@/components/Journey";
import Navbar from "@/components/Navbar";
import Results from "@/components/Results";
import StatsMarquee from "@/components/StatsMarquee";
import UnicornCta from "@/components/UnicornCta";

/* The hero shows the next Demo Day date */
export const revalidate = 3600;

/* Display face of the hero (hero/Hero.module.css). Loaded here rather than in
   the root layout so other routes don't preload it. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  return (
    <div className={`${archivo.variable} contents`}>
      <Navbar variant="summit" />
      <main id="main">
        {/* The hero carries the featured-founders panel (#founders) */}
        <Hero />
        <StatsMarquee />
        <LetterBanner />
        <Journey />
        <CtaBand />
        <Results />
        <JoinBanner />
        <Faq />
        <UnicornCta />
      </main>
      <Footer />
    </div>
  );
}
