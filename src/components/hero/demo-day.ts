import type { StartupCardData } from "@/lib/application/directory";
import { sectorLabel } from "./founders";

/**
 * The startups in the hero's Demo Day band: the three most recently accepted
 * into the cohort, from the API's public directory. The stage photos behind
 * them are event imagery (not pictures of these founders), used in order.
 */
export type Pitch = {
  slug: string;
  name: string;
  sector: string;
  blurb: string;
  photo: string;
};

const STAGE_PHOTOS = [
  "/images/demo-day/orbit.webp",
  "/images/demo-day/numa.webp",
  "/images/demo-day/relay.webp",
];

export function pitches(all: StartupCardData[]): Pitch[] {
  return all
    .filter((s) => s.status === "cohort")
    .toSorted((a, b) => (b.appliedAt ?? "").localeCompare(a.appliedAt ?? ""))
    .slice(0, STAGE_PHOTOS.length)
    .map((s, i) => ({
      slug: s.slug,
      name: s.name,
      sector: sectorLabel(s.industry),
      blurb: s.tagline,
      photo: STAGE_PHOTOS[i],
    }));
}
