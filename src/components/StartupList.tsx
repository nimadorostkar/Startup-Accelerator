import {
  distinctCount,
  PUBLIC_STATUS_ORDER,
  type StartupCardData,
} from "@/lib/application/directory";
import { formatNumber, format } from "@/i18n/format";
import type { Messages } from "@/i18n/messages";
import { getDictionary, getLocale } from "@/i18n/server";
import { listPublicStartups } from "@/lib/application/public";
import Reveal from "./motion/Reveal";
import Browser, { type ListItem } from "./startup-list/Browser";
import { optionLabel, stageName } from "./startups/i18n";
import ButtonLink from "./ui/ButtonLink";
import Eyebrow from "./ui/Eyebrow";

/* Landing: "Building with us right now". Every submitted startup (cohort
   first, then in review, then applied; newest first within each), filtered
   and paged in the browser by startup-list/Browser. Read from the API's
   public directory, like /startups (cached for a minute, refreshed on change). */

const WEEK = 7 * 86_400_000;

/** Ranked for the list; "new" means applied within the last week. */
function toItems(
  all: StartupCardData[],
  options: Messages["startups"]["options"],
  now = Date.now(),
): ListItem[] {
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
      logo: s.logo,
      tagline: s.tagline,
      industry: optionLabel(options.industries, s.industry),
      stageLabel: stageName(options, s.stage),
      country: s.country,
      status: s.status,
      users: s.users,
      isNew: !!s.appliedAt && now - new Date(s.appliedAt).getTime() < WEEK,
    }));
}

export default async function StartupList() {
  const [all, { startups: dict }, locale] = await Promise.all([
    listPublicStartups(),
    getDictionary(),
    getLocale(),
  ]);
  const t = dict.list;
  const items = toItems(all, dict.options);
  const industries = distinctCount(all.map((s) => s.industry));
  const countries = distinctCount(all.map((s) => s.country));
  // "12 startups across 5 industries and 8 countries", leaving out whichever
  // has only one; a single startup can't span a range, so it gets its own line.
  // Every count in these sentences is above one.
  const n = (value: number) => formatNumber(locale, value);
  const counts = { startups: n(all.length), industries: n(industries), countries: n(countries) };
  const summary =
    all.length === 1
      ? format(t.summaryOne, { count: n(1) })
      : format(
          industries > 1 && countries > 1
            ? t.summaryBoth
            : industries > 1
              ? t.summaryIndustries
              : countries > 1
                ? t.summaryCountries
                : t.summaryPlain,
          counts,
        );

  return (
    <section
      id="startups"
      aria-labelledby="startups-title"
      className="relative isolate overflow-x-clip bg-cream px-4 pb-16 sm:px-8 sm:pb-24"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h2
              id="startups-title"
              className="mt-3 font-display text-[28px] leading-[1.1] font-bold tracking-[-0.02em] text-ink sm:text-[34px]"
            >
              {t.titleStart}{" "}
              <span className="text-brand-strong">{t.titleAccent}</span>
            </h2>
            {all.length > 0 && (
              <p className="mt-3 text-[15px] text-ink-soft/75">{summary}</p>
            )}
          </Reveal>
          <Reveal delay={120} className="hidden lg:block">
            <ButtonLink href="/startups">{t.explore}</ButtonLink>
          </Reveal>
        </div>

        {items.length > 0 ? (
          <Reveal delay={160} className="mt-7">
            <Browser
              items={items}
              t={dict.browser}
              statuses={dict.options.statuses}
            />
          </Reveal>
        ) : (
          <div className="mt-7 rounded-[24px] border border-dashed border-line bg-white px-6 py-12 text-center">
            <p className="font-display text-[18px] font-bold text-ink">
              {t.emptyTitle}
            </p>
            <p className="mt-2 text-[15px] text-ink-soft/75">
              {t.emptyBody}
            </p>
          </div>
        )}

        {/* Phones and tablets: the main button sits under the list */}
        <div className="mt-6 lg:hidden">
          <ButtonLink href="/startups" className="w-full sm:w-auto">
            {t.explore}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
