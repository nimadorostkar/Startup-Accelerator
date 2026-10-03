import { getDictionary } from "@/i18n/server";
import Reveal from "./motion/Reveal";
import ButtonLink from "./ui/ButtonLink";

/* The closing band of the landing, about and startups pages. */
export default async function UnicornCta() {
  const t = (await getDictionary()).landing.unicorn;
  return (
    <section
      aria-labelledby="unicorn-title"
      className="relative isolate overflow-hidden bg-[linear-gradient(120deg,var(--night)_0%,var(--ember)_55%,var(--brand-strong)_100%)] rtl:bg-[linear-gradient(240deg,var(--night)_0%,var(--ember)_55%,var(--brand-strong)_100%)] px-4 py-20 text-center sm:px-8 sm:py-24 xl:py-28"
    >
      {/* Soft light pools, same idea as the glows on the dark bands */}
      <div
        aria-hidden="true"
        className="cta-glow absolute -top-40 start-1/4 -z-10 h-[360px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgba(170,235,170,0.14),transparent)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,#000,transparent_75%)]"
      />

      <div className="mx-auto max-w-[680px]">
        <Reveal>
          <p className="type-wide text-[11px] font-semibold tracking-[0.2em] text-brand-soft uppercase">
            <span className="block sm:inline">{t.capital}</span>
            <span aria-hidden="true" className="mx-2.5 hidden sm:inline">
              ·
            </span>
            <span className="block sm:inline">{t.firms}</span>
          </p>
        </Reveal>
        <Reveal delay={90}>
          <h2
            id="unicorn-title"
            className="mt-5 font-display text-[34px] leading-[1.08] font-bold tracking-[-0.02em] text-white sm:text-[48px]"
          >
            {t.title}
          </h2>
        </Reveal>
        <Reveal delay={180}>
          <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-[1.65] text-white/85">
            {t.body}
          </p>
        </Reveal>
        <Reveal delay={260}>
          <ButtonLink
            href="/dashboard"
            variant="white"
            className="mt-9 w-full max-w-[400px] sm:w-auto"
          >
            {t.apply}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
