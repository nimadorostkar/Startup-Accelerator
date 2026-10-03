import type { ReactNode } from "react";
import { LocalLink as Link } from "@/i18n/client";
import { format, formatNumber } from "@/i18n/format";
import type { Messages } from "@/i18n/messages";
import enLanding from "@/i18n/messages/en/landing";
import { getDictionary, getLocale } from "@/i18n/server";
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

type StageText = Messages["landing"]["stages"][keyof Messages["landing"]["stages"]];

type Stage = StageText & {
  id: string;
  Icon: (p: { className?: string }) => ReactNode;
  Art: () => ReactNode;
  /** Hover gesture for the stage icon */
  iconMove: string;
  /** Own page, when the stage has one */
  href?: string;
};

/* The six stages; their words (eyebrow, title, body, weeks — where the stage
   sits in the ten-week program — and focus, what the founder is working on)
   are in the landing dictionary, `stages`. */
const STAGE_ART = [
  {
    id: "discover",
    key: "discover",
    Icon: TargetIcon,
    iconMove: "group-hover:-rotate-12 group-hover:scale-110",
    Art: DiscoverArt,
  },
  {
    id: "build",
    key: "build",
    Icon: RocketIcon,
    iconMove: "group-hover:translate-x-1 group-hover:-translate-y-1.5",
    Art: BuildArt,
  },
  {
    id: "validate",
    key: "validate",
    Icon: UserCheckIcon,
    iconMove: "group-hover:scale-115",
    Art: ValidateArt,
  },
  {
    id: "traction",
    key: "traction",
    Icon: ChartIcon,
    iconMove: "group-hover:-translate-y-1 group-hover:scale-110",
    Art: TractionArt,
  },
  {
    id: "demo-day",
    key: "demoDay",
    Icon: UsersIcon,
    iconMove: "group-hover:scale-110 group-hover:rotate-6",
    Art: DemoDayArt,
    href: "/demo-day",
  },
  {
    id: "scale",
    key: "scale",
    Icon: GearIcon,
    iconMove: "group-hover:rotate-[120deg]",
    Art: ScaleArt,
  },
] as const;

/** The program's six stages with their words in a language: `stagesIn(landing)`. */
export function stagesIn(landing: Messages["landing"]): Stage[] {
  return STAGE_ART.map(({ key, ...stage }) => ({ ...stage, ...landing.stages[key] }));
}

/** The stages in English. Pages in other languages use stagesIn(landing). */
export const STAGES: Stage[] = stagesIn(enLanding);

export default async function Journey() {
  const [{ landing }, locale] = await Promise.all([getDictionary(), getLocale()]);
  const t = landing.program;
  const stages = stagesIn(landing);
  const two = (n: number) => formatNumber(locale, n, { minimumIntegerDigits: 2 });
  return (
    <section
      id="program"
      aria-labelledby="program-title"
      className="relative isolate bg-cream px-4 pt-6 pb-12 sm:px-8 sm:pt-8 sm:pb-16"
    >
      <div className="mx-auto max-w-[1720px]">
        <div className="flex flex-col items-center text-center">
          <Reveal>
            <Eyebrow>{t.eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={90}>
            <h2 id="program-title" className="title-section mt-4">
              <span className="text-brand-strong">{t.title}</span>
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="lead mt-5 max-w-[560px]">{t.lead}</p>
          </Reveal>
        </div>

        {/* Compact stage cards. Phones: one swipeable row (next stage peeks in);
            sm: three across; lg and up: all six in one row. */}
        <ol className="snap-row mx-auto mt-8 max-w-[1180px] pt-1 pb-6 [--bleed:16px] sm:mt-10 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:p-0 lg:grid-cols-6">
          {stages.map(
            ({ id, eyebrow, title, body, Icon, Art, iconMove, href }, i) => (
              <Reveal
                key={id}
                as="li"
                delay={i * 90}
                className="flex w-[58%] max-w-[220px] sm:w-auto sm:max-w-none"
              >
                <TiltCard
                  id={`stage-${id}`}
                  className="card card-lift group relative flex w-full flex-col overflow-hidden rounded-[12px]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute top-0 start-4 h-[2px] w-6 rounded-b-full bg-brand transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-10"
                  />

                  {/* Stage counter — orients the swipe row on phones */}
                  <span
                    aria-hidden="true"
                    className="absolute top-4 end-4 font-display text-[11px] font-bold tracking-[0.04em] text-ink/30 tabular-nums sm:hidden"
                  >
                    <span className="text-brand-strong">
                      {two(i + 1)}
                    </span>
                    &thinsp;/&thinsp;{two(stages.length)}
                  </span>

                  <div className="relative px-4 pt-4">
                    <Icon
                      className={`h-4 w-4 text-brand transition-[translate,rotate,scale] duration-500 ease-[cubic-bezier(0.34,1.8,0.64,1)] ${iconMove}`}
                    />
                    <p className="type-wide mt-2.5 text-[9.5px] font-semibold tracking-[0.14em] text-muted uppercase">
                      {eyebrow}
                    </p>
                    <h3 className="mt-1 font-display text-[15px] leading-tight font-bold tracking-[-0.01em] text-ink">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-[12px] leading-[1.45] text-ink-soft/75 sm:min-h-[4.35em]">
                      {body}
                    </p>
                    <Link
                      href={href ?? "/demo-day#roadmap"}
                      aria-label={format(t.learnMoreAbout, { title })}
                      className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink"
                    >
                      <span className="bg-[linear-gradient(var(--brand),var(--brand))] bg-[length:100%_1.5px] bg-bottom bg-no-repeat pb-px">
                        {t.learnMore}
                      </span>
                      <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>

                  <div className="relative mt-auto h-[56px] origin-bottom pt-2 transition-[scale] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]">
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
