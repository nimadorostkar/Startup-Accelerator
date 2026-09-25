import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckIcon } from "@/components/icons";
import { VCMark } from "@/components/Logo";

const PROOF = [
  "Apply once, reach 180+ investment firms",
  "Mentors and operators from 65+ markets",
  "Demo Day, pitch reviews and warm intros",
];

/* Two-panel auth shell: brand story on the left from lg up, form on the
   right. Below lg the panel drops away and the form gets the screen. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-[100svh] flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Brand panel */}
      <section
        aria-hidden="true"
        className="relative isolate hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16"
      >
        <Image
          src="/images/hero.webp"
          alt=""
          fill
          sizes="50vw"
          className="-z-20 object-cover object-[58%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,rgba(0,15,22,0.92),rgba(0,15,22,0.55)_45%,rgba(0,15,22,0.88))]" />
        <div className="cta-glow absolute -top-32 -left-24 -z-10 h-[340px] w-[620px] rounded-full bg-[radial-gradient(closest-side,rgba(221,158,66,0.35),transparent)] blur-2xl" />

        <span className="flex items-center gap-3 text-white">
          <VCMark className="h-[26px] w-auto" />
          <span className="font-display text-[13px] leading-none font-semibold tracking-[0.115em]">
            SUMMIT
          </span>
        </span>

        <div className="max-w-[460px]">
          <p className="type-wide text-[11px] font-semibold tracking-[0.2em] text-gold uppercase">
            Founder access
          </p>
          <p className="mt-5 font-display text-[34px] leading-[1.1] font-bold tracking-[-0.02em] text-white xl:text-[40px]">
            The room where ideas
            <br />
            find their capital.
          </p>
          <ul className="mt-8 flex flex-col gap-3.5">
            {PROOF.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 text-[15px] leading-[1.5] text-white/80"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold">
                  <CheckIcon className="h-3 w-3" />
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>

        <dl className="flex gap-10">
          {[
            ["$420B+", "Capital represented"],
            ["25,000+", "Founders trained"],
          ].map(([value, label]) => (
            <div key={label} className="flex flex-col-reverse">
              <dt className="font-display mt-1.5 text-[11px] font-semibold tracking-[0.1em] text-white/70 uppercase">
                {label}
              </dt>
              <dd className="font-display text-[26px] leading-none font-extrabold text-white">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Form panel */}
      <div className="flex flex-1 flex-col bg-white">
        <header className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-8 sm:pt-7 lg:justify-end lg:px-12 lg:pt-10">
          <Link
            href="/"
            aria-label="VC Summit home"
            className="flex items-center gap-3 text-ink lg:hidden"
          >
            <VCMark className="h-[24px] w-auto" />
            <span className="font-display text-[12px] leading-none font-semibold tracking-[0.115em]">
              SUMMIT
            </span>
          </Link>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-[13px] font-semibold text-muted transition-colors duration-200 hover:text-ink"
          >
            <ArrowRight className="h-4 w-4 rotate-180 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to site
          </Link>
        </header>

        <main id="main" className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 sm:py-14">
          <div className="w-full max-w-[420px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
