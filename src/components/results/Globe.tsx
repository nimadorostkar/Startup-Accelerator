/**
 * Dashed wireframe globe, generated as an orthographic projection so the
 * meridians/parallels are geometrically correct (only the front hemisphere is drawn).
 */

const SIZE = 900;
const C = SIZE / 2;
const R = 422;
const TILT = (14 * Math.PI) / 180; // north pole tipped toward the viewer
const SPIN = (11 * Math.PI) / 180; // meridian phase, breaks left/right symmetry

function project(lat: number, lon: number) {
  const x = Math.cos(lat) * Math.sin(lon + SPIN);
  const y = Math.sin(lat);
  const z = Math.cos(lat) * Math.cos(lon + SPIN);
  const y2 = y * Math.cos(TILT) - z * Math.sin(TILT);
  const z2 = y * Math.sin(TILT) + z * Math.cos(TILT);
  return { X: C + R * x, Y: C - R * y2, visible: z2 >= 0 };
}

function curve(
  point: (t: number) => { X: number; Y: number; visible: boolean },
) {
  const steps = 160;
  let d = "";
  let pen = false;
  for (let i = 0; i <= steps; i++) {
    const p = point(i / steps);
    if (!p.visible) {
      pen = false;
      continue;
    }
    d += `${pen ? "L" : "M"}${p.X.toFixed(1)} ${p.Y.toFixed(1)}`;
    pen = true;
  }
  return d;
}

const deg = Math.PI / 180;
const MERIDIANS = Array.from({ length: 12 }, (_, k) =>
  curve((t) => project(-90 * deg + t * 180 * deg, k * 30 * deg)),
);
const PARALLELS = [-60, -30, 0, 30, 60].map((lat) =>
  curve((t) => project(lat * deg, t * 360 * deg)),
);
const PATHS = [...MERIDIANS, ...PARALLELS].filter(Boolean);

const DOTS = [
  { cx: 344, cy: 270 },
  { cx: 601, cy: 300 },
  { cx: 299, cy: 602 },
];

export default function Globe({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <g stroke="#d6e9dc" strokeWidth="1.8" strokeDasharray="8 7">
        <circle cx={C} cy={C} r={R} />
        {PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g fill="#b9dfc2">
        {DOTS.map((p) => (
          <circle key={`${p.cx}-${p.cy}`} {...p} r="4.5" />
        ))}
      </g>
    </svg>
  );
}
