import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { ArrowRight } from "@/components/icons";
import { STAGES } from "@/components/Journey";
import {
  ChartIcon,
  TargetIcon,
  UsersIcon,
  RocketIcon,
} from "@/components/journey/icons";
import Reveal from "@/components/motion/Reveal";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import Eyebrow from "@/components/ui/Eyebrow";
import UnicornCta from "@/components/UnicornCta";

export const metadata: Metadata = {
  title: "About — VC Summit",
  description:
    "VC Summit brings together top investors, founders and decision makers, and runs an accelerator for ambitious founders from 65+ markets.",
};

/* PLACEHOLDER values, same as the landing page — replace with real numbers before launch. */
const NUMBERS = [
  { value: "$420B+", label: "Capital represented" },
  { value: "180+", label: "Investment firms" },
  { value: "65+", label: "Markets" },
  { value: "1,200+", label: "Startups built" },
  { value: "3,500+", label: "Mentors & investors" },
  { value: "120+", label: "Company exits" },
];

const VALUES = [
  {
    Icon: TargetIcon,
    title: "Founders first",
    body: "Mentorship, resources and funding go to the people building. Every part of the program is judged by whether it helps a founder ship.",
  },
  {
    Icon: UsersIcon,
    title: "Global by default",
    body: "Our founders come from 65+ markets, and 30% of them from emerging markets. Great companies start everywhere.",
  },
  {
    Icon: RocketIcon,
    title: "Structure that ships",
    body: "Weekly deadlines turn plans into a shipped product, a deck and a data room, well before Demo Day.",
  },
  {
    Icon: ChartIcon,
    title: "Access to capital",
    body: "A network of 180+ investment firms, representing $420B+, meets our founders when they are ready to raise.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <PageHeader
          eyebrow="About VC Summit"
          title={
            <>
              Where ideas <span className="text-gold-deep">meet capital</span>
            </>
          }
        >
          VC Summit brings together the world&rsquo;s top investors, founders
          and decision makers. Our accelerator helps ambitious founders validate
          ideas, ship products and raise, from first idea to Demo Day and
          beyond.
        </PageHeader>

        {/* Mission + numbers */}
        <section
          aria-labelledby="mission-title"
          className="px-4 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto grid max-w-[1720px] gap-12 lg:grid-cols-2 lg:gap-20 lg:px-6">
            <div>
              <Reveal>
                <Eyebrow>Our mission</Eyebrow>
              </Reveal>
              <Reveal delay={90}>
                <h2 id="mission-title" className="title-section mt-4">
                  Back ambitious founders,{" "}
                  <span className="text-gold-deep">wherever they start</span>
                </h2>
              </Reveal>
              <Reveal delay={180}>
                <p className="lead mt-6 max-w-[560px]">
                  We&rsquo;re building the next generation of global startups.
                  Founders join with an idea and leave with a product, real
                  users and a room full of investors who have already seen their
                  numbers.
                </p>
                <p className="lead mt-4 max-w-[560px]">
                  AI rewrote the rules of building a company. You bring the
                  vision, and we bring the mentors, the structure and the
                  capital network to make it real.
                </p>
              </Reveal>
            </div>

            <Reveal delay={120} className="self-start">
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-line-soft bg-line-soft sm:grid-cols-3">
                {NUMBERS.map((n) => (
                  <div
                    key={n.label}
                    className="flex flex-col-reverse justify-end bg-white px-5 py-7 sm:px-7 sm:py-9"
                  >
                    <dt className="mt-3 font-display text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                      {n.label}
                    </dt>
                    <dd className="font-display text-[28px] leading-none font-extrabold tracking-[-0.01em] text-ink sm:text-[34px]">
                      {n.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* Founder's letter — PLACEHOLDER copy; replace with the founder's own words and name. */}
        <section
          id="letter"
          aria-labelledby="letter-title"
          className="scroll-mt-6 relative isolate overflow-hidden bg-navy px-4 py-16 text-white sm:px-8 sm:py-24"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:50px_50px]"
          />
          <div
            aria-hidden="true"
            className="cta-glow absolute -top-40 right-0 -z-10 h-[360px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgba(44,110,65,0.45),transparent)]"
          />
          <div className="mx-auto max-w-[760px]">
            <Reveal>
              <Eyebrow tone="dark">A letter from our founder</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <h2
                id="letter-title"
                className="mt-5 font-display text-[32px] leading-[1.08] font-bold tracking-[-0.02em] sm:text-[44px]"
              >
                The moment VC Summit was built for
              </h2>
            </Reveal>
            <Reveal
              delay={180}
              className="mt-8 flex flex-col gap-5 text-[17px] leading-[1.75] text-white/80"
            >
              <p>
                Every founder remembers the moment the idea stopped being a side
                project. For most, it comes with a second feeling right behind
                it: I have no idea how to do the next part.
              </p>
              <p>
                We built VC Summit for that moment. Not to tell founders what to
                build, but to give them the structure, the people and the
                deadlines that turn a spreadsheet into a shipped product, and a
                shipped product into a company that investors want to back.
              </p>
              <p>
                Ten weeks is not long. It is long enough to find out whether the
                idea is real, and to stand on a stage in front of the people who
                fund the ones that are. If you are at that moment, we would like
                to meet you.
              </p>
            </Reveal>
            <Reveal delay={260} className="mt-8 flex items-center gap-4">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 font-display text-[14px] font-bold text-white ring-2 ring-white/15"
              >
                VC
              </span>
              <span className="leading-tight">
                <span className="block text-[15px] font-bold">
                  Founder, VC Summit
                </span>
                <span className="block text-[13px] text-white/60">
                  On behalf of the program team
                </span>
              </span>
            </Reveal>
          </div>
        </section>

        {/* Values */}
        <section
          aria-labelledby="values-title"
          className="bg-cream px-4 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[1720px] lg:px-6">
            <Reveal>
              <Eyebrow>What we believe</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <h2 id="values-title" className="title-section mt-4">
                How we <span className="text-gold-deep">work</span>
              </h2>
            </Reveal>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {VALUES.map(({ Icon, title, body }, i) => (
                <Reveal
                  as="li"
                  key={title}
                  delay={i * 80}
                  className="card p-6 sm:p-7"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-chip ring-1 ring-chip-line">
                    <Icon className="h-5 w-5 text-gold-deep" />
                  </span>
                  <h3 className="mt-5 text-[18px] font-bold text-ink">
                    {title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-[1.65] text-muted">
                    {body}
                  </p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* Program */}
        <section
          aria-labelledby="journey-title"
          className="px-4 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[1720px] lg:px-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Reveal>
                  <Eyebrow>The program</Eyebrow>
                </Reveal>
                <Reveal delay={90}>
                  <h2 id="journey-title" className="title-section mt-4">
                    Six stages,{" "}
                    <span className="text-gold-deep">one journey</span>
                  </h2>
                </Reveal>
              </div>
              <Reveal delay={180}>
                <Link
                  href="/#program"
                  className="group inline-flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.06em] text-ink uppercase transition-colors duration-200 hover:text-gold-deep"
                >
                  See the full program
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Reveal>
            </div>

            <Reveal delay={120}>
              <ol className="mt-10 grid gap-px overflow-hidden rounded-[18px] border border-line-soft bg-line-soft sm:grid-cols-2 lg:grid-cols-3">
                {STAGES.map(({ id, title, body, Icon }, i) => (
                  <li key={id} className="flex gap-4 bg-white p-6 sm:p-7">
                    <span className="font-display text-[13px] font-bold text-gold-deep tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="flex items-center gap-2.5 text-[17px] font-bold text-ink">
                        <Icon className="h-5 w-5 text-gold" />
                        {title}
                      </h3>
                      <p className="mt-2 text-[14px] leading-[1.6] text-muted">
                        {body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        <UnicornCta />
      </main>
      <Footer />
    </>
  );
}
