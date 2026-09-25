import type { ReactNode } from "react";
import Link from "next/link";
import Reveal from "./motion/Reveal";
import { ArrowRight } from "./icons";
import {
  BuildArt,
  DemoDayArt,
  DiscoverArt,
  ScaleArt,
  TractionArt,
  ValidateArt,
} from "./journey/art";
import {
  ChartIcon,
  GearIcon,
  RocketIcon,
  TargetIcon,
  UserCheckIcon,
  UsersIcon,
} from "./journey/icons";
import TiltCard from "./journey/TiltCard";
import Eyebrow from "./ui/Eyebrow";

type Stage = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  Icon: (p: { className?: string }) => ReactNode;
  Art: () => ReactNode;
  /** Hover gesture for the stage icon */
  iconMove: string;
  /** Where the stage sits in the ten-week program */
  weeks: string;
  /** What the founder is working on, in one line */
  focus: string;
  /** Own page, when the stage has one */
  href?: string;
};

export const STAGES: Stage[] = [
  {
    id: "discover",
    eyebrow: "Discovery",
    title: "Discover",
    body: "Validate the problem & founder-market fit.",
    Icon: TargetIcon,
    iconMove: "group-hover:-rotate-12 group-hover:scale-110",
    Art: DiscoverArt,
    weeks: "Weeks 1–2",
    focus: "Talk to 20 customers and write down the problem worth solving.",
  },
  {
    id: "build",
    eyebrow: "Build",
    title: "Build MVP",
    body: "Define value prop, ship lean product.",
    Icon: RocketIcon,
    iconMove: "group-hover:translate-x-1 group-hover:-translate-y-1.5",
    Art: BuildArt,
    weeks: "Weeks 2–4",
    focus: "Ship the smallest product that delivers the value proposition.",
  },
  {
    id: "validate",
    eyebrow: "Validation",
    title: "Validate",
    body: "Get real users, test & iterate on KPIs.",
    Icon: UserCheckIcon,
    iconMove: "group-hover:scale-115",
    Art: ValidateArt,
    weeks: "Weeks 4–6",
    focus: "Put it in front of real users and iterate on three KPIs.",
  },
  {
    id: "traction",
    eyebrow: "Traction",
    title: "Get Traction",
    body: "First revenue/paying customers, growth experiments.",
    Icon: ChartIcon,
    iconMove: "group-hover:-translate-y-1 group-hover:scale-110",
    Art: TractionArt,
    weeks: "Weeks 6–8",
    focus: "Land the first paying customers and run growth experiments.",
  },
  {
    id: "demo-day",
    eyebrow: "Demo Day",
    title: "Demo Day/ Fundraise",
    body: "Pitch-ready deck + investor matching.",
    Icon: UsersIcon,
    iconMove: "group-hover:scale-110 group-hover:rotate-6",
    Art: DemoDayArt,
    weeks: "Weeks 9–10",
    focus: "Pitch coaching, deck, data room and investor matching.",
    href: "/demo-day",
  },
  {
    id: "scale",
    eyebrow: "Scale",
    title: "Scale",
    body: "Hire, systematize ops, post-program mentorship.",
    Icon: GearIcon,
    iconMove: "group-hover:rotate-[120deg]",
    Art: ScaleArt,
    weeks: "After Demo Day",
    focus: "Close the round, hire, systematize operations.",
  },
];

export default function Journey() {
  return (
    <section
      id="program"
      aria-labelledby="program-title"
      className="relative isolate bg-cream px-4 pt-16 pb-12 sm:px-8 sm:py-24 xl:py-28"
    >
      <div className="mx-auto max-w-[1720px]">
        <div className="flex flex-col items-center text-center">
          <Reveal>
            <Eyebrow>The program</Eyebrow>
          </Reveal>
          <Reveal delay={90}>
            <h2 id="program-title" className="title-section mt-4">
              Six stages,
              <br />
              <span className="text-gold-deep">one founder journey</span>
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="lead mt-5 max-w-[560px]">
              From first idea to post-program scale: the path every founder
              takes with us, one milestone at a time.
            </p>
          </Reveal>
        </div>

        {/* Phones: one swipeable row (next stage peeks in). sm and up: the grid. */}
        <ol className="snap-row mt-10 pt-1 pb-8 [--bleed:16px] sm:mx-0 sm:mt-12 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:p-0 lg:grid-cols-3 xl:mt-14 2xl:grid-cols-6 2xl:gap-4">
          {STAGES.map(
            ({ id, eyebrow, title, body, Icon, Art, iconMove, href }, i) => (
              <Reveal
                key={id}
                as="li"
                delay={i * 90}
                className="flex w-[84%] max-w-[340px] sm:w-auto sm:max-w-none"
              >
                <TiltCard
                  id={`stage-${id}`}
                  className="card card-lift group relative flex w-full flex-col overflow-hidden"
                >
                  <span
                    aria-hidden="true"
                    className="absolute top-0 left-7 h-[3px] 2xl:left-6 w-10 rounded-b-full bg-gold transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-16"
                  />

                  {/* Stage counter — orients the swipe row on phones */}
                  <span
                    aria-hidden="true"
                    className="absolute top-6 right-6 font-display text-[13px] font-bold tracking-[0.04em] text-ink/30 tabular-nums sm:hidden"
                  >
                    <span className="text-gold-deep">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    &thinsp;/&thinsp;{String(STAGES.length).padStart(2, "0")}
                  </span>

                  <div className="relative px-7 pt-6 2xl:px-6">
                    <Icon
                      className={`h-6 w-6 text-gold transition-[translate,rotate,scale] duration-500 ease-[cubic-bezier(0.34,1.8,0.64,1)] ${iconMove}`}
                    />
                    <p className="type-wide mt-4 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                      {eyebrow}
                    </p>
                    <h3 className="mt-1.5 font-display text-[22px] leading-tight 2xl:text-[21px] font-bold tracking-[-0.01em] text-ink">
                      {title}
                    </h3>
                    <p className="mt-2.5 sm:min-h-[4.2em] text-[15px] leading-[1.5] text-ink-soft/75">
                      {body}
                    </p>
                    <Link
                      href={href ?? "/demo-day#roadmap"}
                      aria-label={`Learn more about ${title}`}
                      className="mt-3.5 inline-flex items-center gap-2.5 text-[15px] font-semibold text-ink"
                    >
                      <span className="bg-[linear-gradient(var(--gold),var(--gold))] bg-[length:100%_2px] bg-bottom bg-no-repeat pb-0.5">
                        Learn more
                      </span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>

                  <div className="relative mt-auto h-[130px] origin-bottom pt-4 transition-[scale] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]">
                    <Art />
                  </div>
                </TiltCard>
              </Reveal>
            ),
          )}
        </ol>
      </div>
    </section>
  );
}
