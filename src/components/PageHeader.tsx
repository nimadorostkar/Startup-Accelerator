import type { ReactNode } from "react";
import Reveal from "./motion/Reveal";
import Eyebrow from "./ui/Eyebrow";

/* Intro band for inner pages. The top padding clears the header, which is
   fixed below lg and overlays the page (absolute) from lg up. */
export default function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-cream px-4 pt-[124px] pb-14 sm:px-8 sm:pb-20 lg:pt-[calc(min(5.74vw,110px)+72px)] xl:pb-24">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(0,15,22,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,15,22,0.04)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_top,#000,transparent_70%)]"
      />
      <div className="mx-auto max-w-[1720px] lg:px-6">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={90}>
          <h1 className="mt-5 max-w-[900px] font-display text-[40px] leading-[1.02] font-extrabold tracking-[-0.025em] text-ink uppercase sm:text-[60px] xl:text-[72px]">
            {title}
          </h1>
        </Reveal>
        {children && (
          <Reveal delay={180}>
            <p className="lead mt-6 max-w-[640px] sm:text-[17px]">{children}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
