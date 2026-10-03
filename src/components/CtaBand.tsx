import { getDictionary } from "@/i18n/server";
import Reveal from "./motion/Reveal";
import { CalendarIcon } from "./icons";
import ButtonLink from "./ui/ButtonLink";

export default async function CtaBand() {
  const t = (await getDictionary()).landing.cta;
  return (
    <section
      aria-labelledby="cta-title"
      className="relative isolate overflow-hidden bg-night"
    >
      {/* Faint grid, fading out toward the centre */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 [mask-image:linear-gradient(90deg,#000,rgba(0,0,0,0.35)_45%,#000)] rtl:[mask-image:linear-gradient(270deg,#000,rgba(0,0,0,0.35)_45%,#000)] bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:50px_50px]"
      />
      {/* Gold glows: top-end and bottom-start corners */}
      <div
        aria-hidden="true"
        className="cta-glow absolute -top-40 -end-24 -z-10 h-[340px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgba(239,111,35,0.42),transparent)] rtl:[--glow-dir:-1]"
      />
      <div
        aria-hidden="true"
        className="cta-glow absolute -bottom-40 -start-32 -z-10 h-[300px] w-[680px] rounded-full bg-[radial-gradient(closest-side,rgba(239,111,35,0.3),transparent)] [--glow-dir:-1] rtl:[--glow-dir:1]"
      />

      <div className="mx-auto flex max-w-[1720px] flex-col gap-8 px-4 py-14 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-6 xl:py-16">
        <div>
          <Reveal x={-24} y={0}>
            <h2
              id="cta-title"
              className="font-display text-[24px] leading-tight font-bold tracking-[-0.015em] text-white sm:text-[28px]"
            >
              {t.title}
            </h2>
          </Reveal>
          <Reveal x={-24} y={0} delay={120}>
            <p className="mt-2.5 text-[16px] text-white/75 sm:text-[17px]">
              {t.lede}
            </p>
          </Reveal>
        </div>

        <Reveal
          x={24}
          y={0}
          delay={220}
          className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap"
        >
          <ButtonLink href="/dashboard">{t.apply}</ButtonLink>
          <ButtonLink href="/events" variant="outline-dark" icon={CalendarIcon}>
            {t.event}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
