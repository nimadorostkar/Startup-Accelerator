import { KitebaseMark, LedgerlyMark, RelaywaveMark } from "./brands";

const LOGOS = [
  {
    name: "Relaywave",
    mark: <RelaywaveMark className="h-7 w-auto" />,
  },
  {
    name: "Ledgerly",
    mark: <LedgerlyMark className="text-[23px]" />,
  },
  {
    name: "Kitebase",
    mark: <KitebaseMark className="text-[24px] leading-none" />,
  },
  {
    name: "Restly",
    mark: (
      <span className="font-display text-[23px] font-bold tracking-[-0.05em] text-[#1c1d1f] italic">
        Restly.
      </span>
    ),
  },
];

/**
 * Endless right-to-left logo strip. The track holds two identical sets and
 * slides by exactly one set width (-50%), so the loop is seamless. Each set
 * repeats the logos twice so it is always wider than the visible window.
 */
export default function LogoMarquee() {
  const set = [...LOGOS, ...LOGOS];
  return (
    <div
      role="region"
      aria-label="Alumni companies"
      className="marquee relative overflow-hidden py-1 [mask-image:linear-gradient(90deg,transparent,#000_14%,#000_86%,transparent)]"
    >
      <div className="marquee-track flex w-max">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1 || undefined}
            className="flex shrink-0 items-center gap-11 pr-11"
          >
            {set.map((logo, i) => (
              <li
                key={`${logo.name}-${i}`}
                className="shrink-0 opacity-85 transition-opacity duration-300 hover:opacity-100"
                aria-hidden={i >= LOGOS.length || undefined}
              >
                {logo.mark}
                {logo.name === "Relaywave" && (
                  <span className="sr-only">Relaywave</span>
                )}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
