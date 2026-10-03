import type { ReactNode } from "react";
import type { Category, PostSummary } from "./posts";

/* Drawn covers: no image downloads, crisp at any size. One motif and
   palette per category; the issue number keeps each one distinct. */

type Palette = {
  from: string;
  to: string;
  line: string;
  accent: string;
  ink: string;
};

const PALETTE: Record<Category, Palette> = {
  Fundraising: {
    from: "#ffe6d6",
    to: "#f58a4b",
    line: "rgba(40,14,3,0.16)",
    accent: "#2a1206",
    ink: "#2a1206",
  },
  Building: {
    from: "#141210",
    to: "#2e2620",
    line: "rgba(255,229,214,0.14)",
    accent: "#ef6f23",
    ink: "#fbefe7",
  },
  AI: {
    from: "#2a1206",
    to: "#c2470a",
    line: "rgba(255,214,190,0.18)",
    accent: "#ffb088",
    ink: "#fff1e8",
  },
  "Founder Stories": {
    from: "#fff6f0",
    to: "#fbd3bd",
    line: "rgba(194,71,10,0.2)",
    accent: "#c2470a",
    ink: "#3a1806",
  },
  "Program News": {
    from: "#141a22",
    to: "#2b3038",
    line: "rgba(239,111,35,0.22)",
    accent: "#ef6f23",
    ink: "#f6f1ec",
  },
};

function Motif({ category, p }: { category: Category; p: Palette }): ReactNode {
  switch (category) {
    case "Fundraising":
      return (
        <g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={430 + i * 58}
              y={400 - (i + 1) * 46}
              width="38"
              height={(i + 1) * 46 + 100}
              rx="6"
              fill={p.accent}
              opacity={0.08 + i * 0.05}
            />
          ))}
          <path
            d="M380 380 C 520 360, 600 250, 780 90"
            stroke={p.accent}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="780" cy="90" r="11" fill={p.accent} />
        </g>
      );
    case "Building":
      return (
        <g stroke={p.accent} strokeWidth="2.5" fill="none">
          {[0, 1, 2].map((row) =>
            [0, 1, 2].slice(0, 3 - row).map((col) => {
              const x = 480 + col * 96 + row * 48;
              const y = 360 - row * 84;
              return (
                <g key={`${row}-${col}`} opacity={0.35 + row * 0.25}>
                  <path
                    d={`M${x} ${y} l48 -28 l48 28 l-48 28 Z`}
                    fill={p.accent}
                    fillOpacity="0.12"
                  />
                  <path
                    d={`M${x} ${y} v56 l48 28 v-56 M${x + 96} ${y} v56 l-48 28`}
                  />
                </g>
              );
            }),
          )}
        </g>
      );
    case "AI": {
      const nodes = [
        [560, 250],
        [660, 170],
        [700, 320],
        [480, 150],
        [760, 240],
        [600, 380],
        [470, 330],
      ];
      const edges = [
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 4],
        [2, 4],
        [2, 5],
        [0, 6],
        [3, 1],
        [6, 5],
      ];
      return (
        <g>
          {[70, 130, 190].map((r) => (
            <circle
              key={r}
              cx="560"
              cy="250"
              r={r}
              stroke={p.accent}
              strokeOpacity="0.18"
              strokeDasharray="6 8"
              fill="none"
              strokeWidth="2"
            />
          ))}
          {edges.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={nodes[a][0]}
              y1={nodes[a][1]}
              x2={nodes[b][0]}
              y2={nodes[b][1]}
              stroke={p.accent}
              strokeOpacity="0.45"
              strokeWidth="2"
            />
          ))}
          {nodes.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i === 0 ? 16 : 8}
              fill={p.accent}
            />
          ))}
        </g>
      );
    }
    case "Founder Stories":
      return (
        <g>
          {[120, 200, 280].map((r) => (
            <circle
              key={r}
              cx="640"
              cy="260"
              r={r}
              stroke={p.accent}
              strokeOpacity="0.22"
              fill="none"
              strokeWidth="2"
            />
          ))}
          <g fill={p.accent} transform="translate(560 190) scale(5.4)">
            <path d="M0 12.5C0 6.8 3.6 2.4 10.6.2L12 2.4c-3.6 1.5-5.6 3.2-6.3 3.65A6.5 6.5 0 1 1 0 12.5Z" />
            <path d="M16 12.5C16 6.8 19.6 2.4 26.6.2L28 2.4c-3.6 1.5-5.6 3.2-6.3 3.65A6.5 6.5 0 1 1 16 12.5Z" />
          </g>
        </g>
      );
    case "Program News":
      return (
        <g stroke={p.accent} strokeLinecap="round">
          {Array.from({ length: 13 }, (_, i) => {
            const a = (-90 + i * 7.5) * (Math.PI / 180);
            return (
              <line
                key={i}
                x1={800 + Math.cos(a) * 120}
                y1={500 + Math.sin(a) * 120}
                x2={800 + Math.cos(a) * 520}
                y2={500 + Math.sin(a) * 520}
                strokeWidth="2"
                strokeOpacity={0.15 + (i % 3) * 0.12}
              />
            );
          })}
          <circle cx="800" cy="500" r="96" fill={p.accent} stroke="none" />
        </g>
      );
  }
}

export default function Cover({
  post,
  className = "",
  idSuffix = "",
}: {
  post: PostSummary;
  className?: string;
  /** Keeps SVG ids unique when the same cover renders twice on a page. */
  idSuffix?: string;
}) {
  const p = PALETTE[post.category];
  const id = `cover-${post.slug}${idSuffix}`;
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.from} />
          <stop offset="1" stopColor={p.to} />
        </linearGradient>
        <pattern
          id={`${id}-grid`}
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path d="M40 0H0V40" fill="none" stroke={p.line} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="800" height="500" fill={`url(#${id})`} />
      <rect width="800" height="500" fill={`url(#${id}-grid)`} />
      <Motif category={post.category} p={p} />
      <text
        x="48"
        y="74"
        fill={p.ink}
        fontFamily="var(--font-dm-sans), system-ui, sans-serif"
        fontSize="18"
        fontWeight="700"
        letterSpacing="4"
        opacity="0.75"
      >
        THE FOUNDER BRIEF
      </text>
      <text
        x="44"
        y="452"
        fill={p.ink}
        fontFamily="var(--font-dm-sans), system-ui, sans-serif"
        fontSize="132"
        fontWeight="800"
        letterSpacing="-6"
      >
        Nº{post.issue}
      </text>
    </svg>
  );
}
