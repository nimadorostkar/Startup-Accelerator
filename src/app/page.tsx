import CtaBand from "@/components/CtaBand";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import JoinBanner from "@/components/JoinBanner";
import Journey from "@/components/Journey";
import Portfolio from "@/components/Portfolio";
import Results from "@/components/Results";
import StatsMarquee from "@/components/StatsMarquee";
import UnicornCta from "@/components/UnicornCta";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <StatsMarquee />
        <Portfolio />
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
