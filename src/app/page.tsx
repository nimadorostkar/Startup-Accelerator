import CtaBand from "@/components/CtaBand";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import JoinBanner from "@/components/JoinBanner";
import LetterBanner from "@/components/LetterBanner";
import Journey from "@/components/Journey";
import Navbar from "@/components/Navbar";
import Portfolio from "@/components/Portfolio";
import Results from "@/components/Results";
import StatsMarquee from "@/components/StatsMarquee";
import UnicornCta from "@/components/UnicornCta";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <StatsMarquee />
        <Portfolio />
        <LetterBanner />
        <Journey />
        <CtaBand />
        <Results />
        <JoinBanner />
        <Faq />
        <UnicornCta />
      </main>
      <Footer />
    </>
  );
}
