/**
 * Startups pitching in the hero's Demo Day band.
 *
 * PLACEHOLDER CONTENT from the Fundup Club hero design: names, copy and stage
 * photos (cropped from the design mock-up, so they are low resolution). Swap in
 * the real line-up and full-size photos before launch.
 */
export type Pitch = {
  name: string;
  sector: string;
  blurb: string;
  photo: string;
};

export const PITCHES: Pitch[] = [
  {
    name: "Orbit",
    sector: "AI & Productivity",
    blurb:
      "A modern workspace for founders to capture, organize and turn ideas into real progress.",
    photo: "/images/demo-day/orbit.webp",
  },
  {
    name: "Numa",
    sector: "SaaS",
    blurb: "AI research partner for customer insights.",
    photo: "/images/demo-day/numa.webp",
  },
  {
    name: "Relay",
    sector: "Fintech",
    blurb: "Modern payments infrastructure for global founders.",
    photo: "/images/demo-day/relay.webp",
  },
];
