import Reveal from "./motion/Reveal";
import { UsersIcon } from "./journey/icons";
import Carousel from "./portfolio/Carousel";
import FounderCard from "./portfolio/FounderCard";
import { FOUNDERS } from "./portfolio/data";
import ButtonLink from "./ui/ButtonLink";
import Eyebrow from "./ui/Eyebrow";

export default function Portfolio() {
  return (
    <section
      id="accelerator"
      aria-labelledby="accelerator-title"
      className="relative isolate overflow-hidden bg-cream px-4 pt-4 pb-12 sm:px-8 sm:pt-6 xl:pb-16"
    >
      <Reveal
        y={40}
        className="mx-auto max-w-[1720px] rounded-[28px] border border-white bg-white px-5 pt-12 pb-6 shadow-[0_2px_6px_rgba(0,15,22,0.03),0_40px_90px_-50px_rgba(0,15,22,0.25)] sm:px-8 xl:pt-14"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <Reveal delay={120}>
            <Eyebrow>Our accelerator</Eyebrow>
          </Reveal>
          <Reveal delay={200}>
            <h2 id="accelerator-title" className="title-section mt-4">
              Startup <span className="text-gold-deep">Accelerator</span>
            </h2>
          </Reveal>
          <Reveal delay={280}>
            <p className="lead mt-5 max-w-[680px]">
              We&rsquo;re building the next generation of global startups. Our
              accelerator supports ambitious founders with mentorship,
              resources and funding to turn great ideas into successful
              businesses.
            </p>
          </Reveal>
        </div>

        {/* Featured founders panel */}
        <div className="mt-10 grid gap-8 border-t border-line-soft pt-10 sm:gap-10 sm:rounded-[20px] sm:border sm:bg-white sm:px-8 sm:py-8 sm:shadow-[0_1px_2px_rgba(0,15,22,0.02),0_20px_50px_-40px_rgba(0,15,22,0.2)] lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-0 lg:py-9 xl:grid-cols-[minmax(0,540px)_minmax(0,1fr)]">
          <div className="flex flex-col justify-center lg:border-r lg:border-line-soft lg:pr-10 xl:pr-12">
            <Reveal delay={200} x={-24} y={0}>
              <Eyebrow>Featured founders</Eyebrow>
            </Reveal>
            <Reveal delay={280} x={-24} y={0}>
              <h3 className="mt-5 font-display text-[30px] leading-[1.08] font-bold tracking-[-0.02em] text-ink sm:text-[42px] lg:text-[36px] xl:text-[44px]">
                Meet Our Portfolio
                <br />
                <span className="text-gold-deep">Founders &amp; Startups</span>
              </h3>
            </Reveal>
            <Reveal delay={360} x={-24} y={0}>
              <p className="lead mt-6">
                Talented founders. Innovative ideas. Real impact.
                <br className="hidden sm:block" /> Here are some of the
                startups in our accelerator program.
              </p>
            </Reveal>
            <Reveal
              delay={440}
              x={-24}
              y={0}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <ButtonLink href="#results">Our startups</ButtonLink>
              <ButtonLink href="#program" variant="outline" icon={UsersIcon}>
                Join the program
              </ButtonLink>
            </Reveal>
          </div>

          <div className="min-w-0 lg:pl-10 xl:pl-12">
            <Carousel label="Featured founders & startups">
              {FOUNDERS.map((f, i) => (
                <Reveal
                  key={f.name}
                  as="li"
                  delay={300 + i * 110}
                  x={48}
                  y={0}
                  className="w-[228px] shrink-0 snap-start sm:w-[212px]"
                >
                  <FounderCard f={f} />
                </Reveal>
              ))}
            </Carousel>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
