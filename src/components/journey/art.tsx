import type { CSSProperties, ReactNode } from "react";

const GOLD = "var(--gold)";
const LINE = "#dcd6ca";
const SOFT = "#f4f1eb";
const TINT = "#fbf0dc";

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

/* Paths deliberately run past the viewBox so wider cards still bleed to the edges. */
function Art({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 280 170"
      overflow="visible"
      className="h-full w-full"
      fill="none"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function ActiveNode({
  x,
  y,
  r = 11,
  i = 0,
}: {
  x: number;
  y: number;
  r?: number;
  i?: number;
}) {
  return (
    <g className="node-pop" style={v({ "--i": i })}>
      <circle cx={x} cy={y} r={r * 1.9} fill={TINT} opacity="0.7" />
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={GOLD}
        opacity="0.35"
        className="globe-ping"
      />
      <circle cx={x} cy={y} r={r} fill="#fff" stroke={GOLD} strokeWidth="2" />
      <circle cx={x} cy={y} r={r * 0.45} fill={GOLD} />
    </g>
  );
}

function Node({
  x,
  y,
  r = 8,
  i = 0,
}: {
  x: number;
  y: number;
  r?: number;
  i?: number;
}) {
  return (
    <circle
      cx={x}
      cy={y}
      r={r}
      fill="#fff"
      stroke={LINE}
      strokeWidth="1.6"
      className="node-pop"
      style={v({ "--i": i })}
    />
  );
}

/* A glowing spark that travels along `path` forever. */
function Spark({
  path,
  dur = 3,
  begin = 0,
  r = 3,
}: {
  path: string;
  dur?: number;
  begin?: number;
  r?: number;
}) {
  return (
    <g className="motion-only">
      <circle r={r * 2.4} fill={GOLD} opacity="0">
        <animateMotion path={path} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" />
        <animate
          attributeName="opacity"
          values="0;0.22;0.22;0"
          keyTimes="0;0.15;0.8;1"
          dur={`${dur}s`}
          begin={`${begin}s`}
          repeatCount="indefinite"
        />
      </circle>
      <circle r={r} fill={GOLD} opacity="0">
        <animateMotion path={path} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" />
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          keyTimes="0;0.15;0.8;1"
          dur={`${dur}s`}
          begin={`${begin}s`}
          repeatCount="indefinite"
        />
      </circle>
    </g>
  );
}

function Person({
  x,
  y,
  r,
  color,
  ring = color,
}: {
  x: number;
  y: number;
  r: number;
  color: string;
  ring?: string;
}) {
  const s = r / 14;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#fff" stroke={ring} strokeWidth="1.8" />
      <circle
        cx={x}
        cy={y - 3.2 * s}
        r={3.6 * s}
        stroke={color}
        strokeWidth="1.6"
      />
      <path
        d={`M${x - 6.5 * s} ${y + 7.5 * s}a${6.5 * s} ${6 * s} 0 0 1 ${13 * s} 0`}
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </g>
  );
}

export function DiscoverArt() {
  const trail = "M44 58C80 58 92 74 118 74S178 90 206 88 260 72 300 70";
  return (
    <Art>
      <path
        d="M-200 58H44"
        stroke={LINE}
        strokeWidth="1.6"
        strokeDasharray="3 5"
        className="march art-fade"
      />
      <path
        d="M44 58C80 58 92 74 118 74S178 90 206 88 260 72 480 70"
        pathLength={1}
        stroke={LINE}
        strokeWidth="1.6"
        className="draw"
      />
      <path
        d="M44 58C66 58 80 64 96 69"
        pathLength={1}
        stroke={GOLD}
        strokeWidth="2"
        className="draw"
        style={v({ "--dd": "250ms" })}
      />
      <path
        d="M150 62c16-26 44-30 62-16M226 44c18-18 44-18 60-8"
        stroke={LINE}
        strokeWidth="1.4"
        strokeDasharray="3 5"
        className="march art-fade"
        style={v({ "--dd": "700ms" })}
      />
      <path
        d="M44 70v18"
        pathLength={1}
        stroke={GOLD}
        strokeWidth="1.6"
        className="draw"
        style={v({ "--dd": "500ms" })}
      />
      <rect
        x="26"
        y="90"
        width="36"
        height="20"
        rx="4"
        fill={TINT}
        stroke={GOLD}
        strokeOpacity="0.45"
        className="node-pop"
        style={v({ "--i": 3 })}
      />
      <Spark path={trail} dur={3.4} />
      <ActiveNode x={44} y={58} />
      <Node x={118} y={74} i={1} />
      <Node x={206} y={88} i={2} />
    </Art>
  );
}

export function BuildArt() {
  const xs = [30, 104, 178, 252];
  return (
    <Art>
      <path
        d="M-200 62H480"
        pathLength={1}
        stroke={LINE}
        strokeWidth="1.6"
        className="draw"
      />
      <path
        d="M30 62H104"
        pathLength={1}
        stroke={GOLD}
        strokeWidth="2"
        className="draw"
        style={v({ "--dd": "300ms" })}
      />
      <path
        d="M36 50c14-26 50-26 62 0M112 46c16-28 50-28 60 4M186 50c14-24 48-24 60 0"
        stroke={LINE}
        strokeWidth="1.4"
        strokeDasharray="3 5"
        className="march art-fade"
        style={v({ "--dd": "600ms" })}
      />
      <Spark path="M104 62H300" dur={2.8} />
      {xs.map((x, i) => (
        <g key={x}>
          <rect
            x={x - 19}
            y="92"
            width="38"
            height="22"
            rx="4"
            fill={i === 1 ? TINT : SOFT}
            stroke={i === 1 ? GOLD : LINE}
            strokeOpacity={i === 1 ? 0.5 : 1}
            className="node-pop"
            style={v({ "--i": i + 2 })}
          />
          {i === 1 ? (
            <ActiveNode x={x} y={62} i={i} />
          ) : (
            <Node x={x} y={62} i={i} />
          )}
        </g>
      ))}
    </Art>
  );
}

export function ValidateArt() {
  const c = { x: 140, y: 78 };
  const outer = [
    [58, 22],
    [222, 14],
    [252, 78],
    [58, 112],
    [180, 150],
  ];
  return (
    <Art>
      <g className="art-fade">
        <circle
          cx={c.x}
          cy={c.y}
          r="62"
          stroke={LINE}
          strokeWidth="1.3"
          strokeDasharray="2 5"
          className="spin-slow"
        />
      </g>
      {outer.map(([x, y], i) => (
        <g key={`${x}-${y}`}>
          <path
            d={`M${c.x} ${c.y}L${x} ${y}`}
            pathLength={1}
            stroke={LINE}
            strokeWidth="1.6"
            className="draw"
            style={v({ "--dd": `${i * 90}ms` })}
          />
          {/* data pulses flowing from users into the product */}
          <path
            d={`M${x} ${y}L${c.x} ${c.y}`}
            pathLength={1}
            stroke={GOLD}
            strokeWidth="2"
            strokeLinecap="round"
            className="flow"
            style={v({ "--dur": `${2.2 + (i % 3) * 0.5}s`, "--del": `${1.6 + i * 0.45}s` })}
          />
        </g>
      ))}
      {outer.map(([x, y], i) => (
        <g
          key={`n${x}-${y}`}
          className="node-pop"
          style={v({ "--i": i + 1 })}
        >
          <circle cx={x} cy={y} r="7" fill="#fff" stroke={LINE} strokeWidth="1.6" />
          <circle cx={x} cy={y} r="2.4" fill={LINE} />
        </g>
      ))}
      <g className="node-pop">
        <circle cx={c.x} cy={c.y} r="36" fill={TINT} opacity="0.6" />
        <circle
          cx={c.x}
          cy={c.y}
          r="26"
          fill={GOLD}
          opacity="0.3"
          className="globe-ping"
        />
        <Person x={c.x} y={c.y} r={26} color={GOLD} />
      </g>
    </Art>
  );
}

export function TractionArt() {
  const pts = [
    [-200, 180],
    [28, 132],
    [84, 112],
    [140, 92],
    [196, 66],
    [252, 30],
  ];
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("");
  const run = pts
    .slice(1)
    .map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`)
    .join("");
  return (
    <Art>
      <defs>
        <linearGradient id="traction-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={GOLD} stopOpacity="0.16" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[56, 112, 168, 224].map((x, i) => (
        <path
          key={x}
          d={`M${x} 200V20`}
          pathLength={1}
          stroke={SOFT}
          strokeWidth="1.6"
          className="draw"
          style={v({ "--dd": `${i * 80}ms` })}
        />
      ))}
      <path
        d={`${line}L252 200L-200 200Z`}
        fill="url(#traction-fill)"
        className="art-fade"
        style={v({ "--dd": "900ms" })}
      />
      <path
        d={line}
        pathLength={1}
        stroke={GOLD}
        strokeWidth="2"
        strokeLinejoin="round"
        className="draw"
        style={v({ "--dd": "150ms" })}
      />
      <Spark path={run} dur={2.6} begin={1.5} />
      {pts.slice(1, -1).map(([x, y], i) => (
        <circle
          key={x}
          cx={x}
          cy={y}
          r="6"
          fill="#fff"
          stroke={GOLD}
          strokeWidth="2"
          className="node-pop"
          style={v({ "--i": i + 1 })}
        />
      ))}
      <ActiveNode x={252} y={30} r={8} i={5} />
    </Art>
  );
}

export function DemoDayArt() {
  const c = { x: 140, y: 96 };
  const R = 84;
  const orbit = `M${c.x - 118} ${c.y}a118 26 0 1 0 236 0a118 26 0 1 0 -236 0`;
  return (
    <Art>
      <g className="art-fade">
        <circle cx={c.x} cy={c.y} r={R} fill="#fff" stroke={LINE} strokeWidth="1.4" />
        <path d={`M${c.x} 12V180`} stroke={LINE} strokeWidth="1.2" />
        {[-52, 0, 52].map((dy) => {
          const hw = Math.sqrt(R * R - dy * dy);
          return (
            <ellipse
              key={dy}
              cx={c.x}
              cy={c.y + dy}
              rx={hw}
              ry={hw * 0.12}
              stroke={LINE}
              strokeWidth="1.2"
            />
          );
        })}

        {/* Static meridians for reduced motion; spinning ones otherwise */}
        <g className="reduce-only">
          {[26, 54].map((rx) => (
            <ellipse key={rx} cx={c.x} cy={c.y} rx={rx} ry={R} stroke={LINE} strokeWidth="1.2" />
          ))}
        </g>
        <g className="motion-only">
          {[0, -2, -4].map((begin) => (
            <ellipse key={begin} cx={c.x} cy={c.y} rx={R} ry={R} stroke={LINE} strokeWidth="1.2">
              <animate
                attributeName="rx"
                values={`${R};0`}
                dur="6s"
                begin={`${begin}s`}
                calcMode="spline"
                keySplines="0.4 0 0.6 1"
                repeatCount="indefinite"
              />
            </ellipse>
          ))}
        </g>
      </g>

      <g transform={`rotate(-8 ${c.x} ${c.y})`}>
        <path
          d={orbit}
          pathLength={1}
          stroke={GOLD}
          strokeWidth="1.6"
          className="draw"
          style={v({ "--dd": "250ms" })}
        />
        {[0, -1.6, -3.3, -5.1].map((begin, i) => (
          <circle key={begin} r={i === 0 ? 3.6 : 2.6} fill={GOLD} className="motion-only">
            <animateMotion path={orbit} dur="6.8s" begin={`${begin}s`} repeatCount="indefinite" />
          </circle>
        ))}
        <g className="reduce-only">
          {[
            [30, 94],
            [214, 80],
            [94, 120],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="2.6" fill={GOLD} />
          ))}
        </g>
      </g>
      <ActiveNode x={c.x} y={c.y} r={10} i={2} />
    </Art>
  );
}

export function ScaleArt() {
  const top = { x: 140, y: 42 };
  const kids = [72, 140, 208];
  const branches = [
    `M${top.x} ${top.y + 24}V98H86q-14 0-14 14v8`,
    `M${top.x} ${top.y + 24}V120`,
    `M${top.x} ${top.y + 24}V98H194q14 0 14 14v8`,
  ];
  return (
    <Art>
      <path
        d="M58 96C58 30 100 4 140 4s82 26 82 92"
        stroke={LINE}
        strokeWidth="1.3"
        strokeDasharray="2 5"
        className="march art-fade"
      />
      {branches.map((d, i) => (
        <path
          key={d}
          d={d}
          pathLength={1}
          stroke={GOLD}
          strokeWidth="1.8"
          className="draw"
          style={v({ "--dd": `${250 + i * 120}ms` })}
        />
      ))}
      {branches.map((d, i) => (
        <Spark key={`s${d}`} path={d} dur={2.4} begin={1.8 + i * 0.8} r={2.6} />
      ))}
      <g className="node-pop">
        <circle cx={top.x} cy={top.y} r="34" fill={TINT} opacity="0.6" />
        <circle
          cx={top.x}
          cy={top.y}
          r="24"
          fill={GOLD}
          opacity="0.3"
          className="globe-ping"
        />
        <Person x={top.x} y={top.y} r={24} color={GOLD} />
      </g>
      {kids.map((x, i) => (
        <g key={x} className="node-pop" style={v({ "--i": i + 3 })}>
          <Person x={x} y={134} r={16} color="#b9b2a4" ring={LINE} />
        </g>
      ))}
    </Art>
  );
}
