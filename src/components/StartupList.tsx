import {
  PUBLIC_STATUS_ORDER,
  type StartupCardData,
} from "@/lib/application/directory";
import { listPublicStartups } from "@/lib/application/public";
import Reveal from "./motion/Reveal";
import Browser, { type ListItem } from "./startup-list/Browser";
import ButtonLink from "./ui/ButtonLink";
import Eyebrow from "./ui/Eyebrow";

/* Landing: "Building with us right now". Every submitted startup (cohort
   first, then in review, then applied; newest first within each), filtered
   and paged in the browser by startup-list/Browser. Read from the API's
   public directory, like /startups (cached for a minute, refreshed on change). */

const WEEK = 7 * 86_400_000;

/** Ranked for the list; "new" means applied within the last week. */
function toItems(all: StartupCardData[], now = Date.now()): ListItem[] {
  const order = (s: StartupCardData) => PUBLIC_STATUS_ORDER.indexOf(s.status);
  return all
    .toSorted(
      (a, b) =>
        order(a) - order(b) ||
        (b.appliedAt ?? "").localeCompare(a.appliedAt ?? ""),
    )
    .map((s) => ({
      slug: s.slug,
      name: s.name,
      tagline: s.tagline,
      industry: s.industry,
      stageLabel: s.stageLabel,
      country: s.country,
      status: s.status,
      users: s.users,
      isNew: !!s.appliedAt && now - new Date(s.appliedAt).getTime() < WEEK,
    }));
}

export default async function StartupList() {
  const all = await listPublicStartups();
  const items = toItems(all);
  const industries = new Set(all.map((s) => s.industry).filter(Boolean)).size;
  const countries = new Set(all.map((s) => s.country).filter(Boolean)).size;

  return (
    <section
      id="startups"
      aria-labelledby="startups-title"
      className="relative isolate overflow-x-clip bg-cream px-4 pb-16 sm:px-8 sm:pb-24"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <Eyebrow>Our startups</Eyebrow>
            <h2
              id="startups-title"
              className="mt-3 font-display text-[28px] leading-[1.1] font-bold tracking-[-0.02em] text-ink sm:text-[34px]"
            >
              Building with us{" "}
              <span className="text-brand-strong">right now</span>
            </h2>
            {all.length > 0 && (
              <p className="mt-3 text-[15px] text-ink-soft/75">
                {all.length} {all.length === 1 ? "startup" : "startups"}
                {industries > 1 && ` across ${industries} industries`}
                {countries > 1 && ` and ${countries} countries`}, from first
                idea to funded.
              </p>
            )}
          </Reveal>
          <Reveal delay={120} className="hidden lg:block">
            <ButtonLink href="/startups">Explore startups</ButtonLink>
          </Reveal>
        </div>

        {items.length > 0 ? (
          <Reveal delay={160} className="mt-7">
            <Browser items={items} />
          </Reveal>
        ) : (
          <div className="mt-7 rounded-[24px] border border-dashed border-line bg-white px-6 py-12 text-center">
            <p className="font-display text-[18px] font-bold text-ink">
              The first startups are applying now
            </p>
            <p className="mt-2 text-[15px] text-ink-soft/75">
              Submitted applications appear here and in the directory.
            </p>
          </div>
        )}

        {/* Phones and tablets: the main button sits under the list */}
        <div className="mt-6 lg:hidden">
          <ButtonLink href="/startups" className="w-full sm:w-auto">
            Explore startups
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
