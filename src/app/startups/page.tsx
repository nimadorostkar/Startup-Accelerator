import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Reveal from "@/components/motion/Reveal";
import Navbar from "@/components/Navbar";
import Directory, {
  type DirectoryQuery,
} from "@/components/startups/Directory";
import Eyebrow from "@/components/ui/Eyebrow";
import UnicornCta from "@/components/UnicornCta";
import { toCard } from "@/lib/application/directory";
import { listPublicStartups } from "@/lib/application/public";

export const metadata: Metadata = {
  title: "Startups — VC Summit",
  description:
    "Every startup that has applied to the VC Summit program, from first idea to funded, with where each one is in the process.",
};

// Reads the live application store on every request.
export const dynamic = "force-dynamic";

export default async function StartupsPage({
  searchParams,
}: PageProps<"/startups">) {
  const sp = await searchParams;
  const str = (v: string | string[] | undefined) =>
    typeof v === "string" ? v : "";
  const initial: DirectoryQuery = {
    q: str(sp.q),
    status: str(sp.status),
    industry: str(sp.industry),
    stage: str(sp.stage),
    sort: str(sp.sort),
  };

  const all = await listPublicStartups();
  const cohort = all.filter((s) => s.status === "cohort").length;
  const industries = new Set(all.map((s) => s.industry).filter(Boolean)).size;
  const countries = new Set(all.map((s) => s.country).filter(Boolean)).size;
  const stats = [
    { value: all.length, label: all.length === 1 ? "Startup" : "Startups" },
    { value: cohort, label: "In the cohort" },
    { value: industries, label: industries === 1 ? "Industry" : "Industries" },
    { value: countries, label: countries === 1 ? "Country" : "Countries" },
  ];

  return (
    <>
      <Navbar />
      <main id="main">
        <section className="relative isolate overflow-hidden bg-cream px-4 pt-[124px] pb-12 sm:px-8 sm:pb-16 lg:pt-[calc(min(5.74vw,110px)+72px)]">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(0,15,22,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,15,22,0.04)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_top,#000,transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="absolute -top-40 right-[-10%] -z-10 h-[520px] w-[820px] rounded-full bg-[radial-gradient(closest-side,rgba(221,158,66,0.2),transparent)]"
          />
          <div className="mx-auto max-w-[1720px] lg:px-6">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-[760px]">
                <Reveal>
                  <Eyebrow>Startup directory</Eyebrow>
                </Reveal>
                <Reveal delay={90}>
                  <h1 className="mt-5 font-display text-[40px] leading-[1.02] font-extrabold tracking-[-0.025em] text-ink uppercase sm:text-[60px] xl:text-[72px]">
                    The startups
                    <br />
                    <span className="text-gold-deep">building with us</span>
                  </h1>
                </Reveal>
                <Reveal delay={180}>
                  <p className="lead mt-6 max-w-[600px] sm:text-[17px]">
                    Every company that has applied to the program, from first
                    idea to funded, with where each one is in the process. Open
                    a startup to meet the team and read what they&rsquo;re
                    building.
                  </p>
                </Reveal>
              </div>
              <Reveal delay={240} className="shrink-0">
                <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-line-soft bg-line-soft sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                  {stats.map((s) => (
                    <div
                      key={s.label}
                      className="flex flex-col-reverse justify-end bg-white px-5 py-4 sm:px-6"
                    >
                      <dt className="mt-1 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                        {s.label}
                      </dt>
                      <dd className="font-display text-[28px] leading-none font-extrabold tracking-[-0.02em] text-ink">
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </div>
        </section>

        <section
          aria-label="All startups"
          className="px-4 py-10 sm:px-8 sm:py-14"
        >
          <div className="mx-auto max-w-[1720px] lg:px-6">
            {all.length > 0 ? (
              <Directory startups={all.map(toCard)} initial={initial} />
            ) : (
              <div className="rounded-[18px] border border-dashed border-line px-6 py-16 text-center">
                <p className="font-display text-[20px] font-bold text-ink">
                  No startups yet
                </p>
                <p className="mt-2 text-[14px] text-muted">
                  The first applications for the next cohort will appear here.
                </p>
              </div>
            )}
          </div>
        </section>

        <UnicornCta />
      </main>
      <Footer />
    </>
  );
}
