import Image from "next/image";
import { getDictionary } from "@/i18n/server";
import Reveal from "./motion/Reveal";
import { CalendarIcon } from "./icons";
import ButtonLink from "./ui/ButtonLink";

export default async function JoinBanner() {
  const t = (await getDictionary()).landing.join;
  return (
    <section
      aria-labelledby="join-title"
      className="relative isolate overflow-hidden bg-night"
    >
      {/* Faint grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:50px_50px]"
      />
      {/* Orange glow, bottom-start */}
      <div
        aria-hidden="true"
        className="cta-glow absolute -bottom-44 -start-40 -z-10 h-[380px] w-[760px] rounded-full bg-[radial-gradient(closest-side,rgba(239,111,35,0.55),transparent)] [--glow-dir:-1] rtl:[--glow-dir:1]"
      />

      {/* The team photo, whole: on the end half (the right in English), as tall as its own shape
          makes it (4:3), standing on the bottom edge. On wide screens it fills
          the panel's height and only the floor is cropped; nobody at the sides
          is cut off. Its start and top edges fade into the dark panel. On
          phones it is a dimmed backdrop behind the text. */}
      <div className="absolute end-0 bottom-0 -z-10 w-full max-md:inset-y-0 md:aspect-[1237/932] md:max-h-full md:w-1/2">
        <Image
          src="/images/fundup-team.png"
          alt={t.photoAlt}
          fill
          quality={75}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-top"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-night via-night/25 via-8% to-transparent to-20% max-md:bg-night/80"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-night to-transparent max-md:hidden"
        />
      </div>

      <div className="mx-auto max-w-[1720px] px-4 py-20 sm:px-8 sm:py-24 lg:px-10 xl:py-28">
        <div className="max-w-[600px]">
          <Reveal x={-24} y={0}>
            <p className="type-wide text-[11px] font-semibold tracking-[0.2em] text-brand-soft uppercase">
              <span className="block sm:inline">{t.open}</span>
              <span aria-hidden="true" className="mx-2.5 hidden sm:inline">
                ·
              </span>
              <span className="block sm:inline">{t.cohort}</span>
            </p>
          </Reveal>
          <Reveal x={-24} y={0} delay={90}>
            <h2
              id="join-title"
              className="mt-5 font-display text-[40px] leading-[1.04] font-bold tracking-[-0.025em] text-white sm:text-[52px]"
            >
              {t.titleLine1}
              <br />
              {t.titleLine2}
            </h2>
          </Reveal>
          <Reveal x={-24} y={0} delay={180}>
            <p className="mt-6 max-w-[560px] text-[16px] leading-[1.7] text-white/80 sm:text-[17px]">
              {t.body}
            </p>
          </Reveal>
          <Reveal
            x={-24}
            y={0}
            delay={260}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <ButtonLink href="/dashboard" variant="bright">
              {t.apply}
            </ButtonLink>
            <ButtonLink href="/events" variant="outline-dark" icon={CalendarIcon}>
              {t.event}
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
