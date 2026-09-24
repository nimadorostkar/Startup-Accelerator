import Link from "next/link";
import Reveal from "./motion/Reveal";
import { ArrowRight } from "./icons";

export default function UnicornCta() {
  return (
    <section
      aria-labelledby="unicorn-title"
      className="relative isolate overflow-hidden bg-[linear-gradient(120deg,#165432_0%,#2c6e41_50%,#367c46_100%)] px-4 py-20 text-center sm:px-8 sm:py-24"
    >
      {/* Soft light pools, same idea as the glows on the dark bands */}
      <div
        aria-hidden="true"
        className="cta-glow absolute -top-40 left-1/4 -z-10 h-[360px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgba(170,235,170,0.14),transparent)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,#000,transparent_75%)]"
      />

      <div className="mx-auto max-w-[680px]">
        <Reveal>
          <p className="type-wide text-[11px] font-semibold tracking-[0.2em] text-[#aee7a4] uppercase">
            $420B+ capital represented · 180+ investment firms
          </p>
        </Reveal>
        <Reveal delay={90}>
          <h2
            id="unicorn-title"
            className="mt-5 font-display text-[34px] leading-[1.1] font-bold tracking-[-0.02em] text-white sm:text-[46px]"
          >
            Turn your idea into the next unicorn
          </h2>
        </Reveal>
        <Reveal delay={180}>
          <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-[1.65] text-white/85">
            Founders from 65+ markets have used the program to build, launch
            and fund their companies. Yours could be next.
          </p>
        </Reveal>
        <Reveal delay={260}>
          <Link
            href="#request"
            className="group mt-9 inline-flex h-12 items-center gap-3 rounded-full bg-white px-7 shadow-[0_18px_40px_-18px_rgba(5,40,20,0.7)] transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_-18px_rgba(5,40,20,0.85)]"
          >
            <span className="font-display text-[12px] font-bold tracking-[0.06em] text-[#1f6a3a] uppercase">
              Apply now
            </span>
            <ArrowRight className="h-[18px] w-[18px] text-[#1f6a3a] transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
