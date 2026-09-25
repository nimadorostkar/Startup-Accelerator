"use client";

import { useEffect, useRef } from "react";

/**
 * Dashed wireframe globe — a true orthographic projection that slowly spins.
 * Only the front hemisphere is drawn; city dots rotate with the sphere and
 * fade out as they reach the limb. Animation pauses off-screen and is
 * disabled for users who prefer reduced motion.
 */

const SIZE = 900;
const C = SIZE / 2;
const R = 422;
const TILT = (14 * Math.PI) / 180; // north pole tipped toward the viewer
const START_SPIN = (11 * Math.PI) / 180;
const SPEED = (5 * Math.PI) / 180; // radians per second (one turn ≈ 72s)
const deg = Math.PI / 180;
const FRAME_MS = 50;

// Program cities (lat, lon)
const CITIES: [number, number][] = [
  [41.0, 29.0], // Istanbul
  [37.8, -122.4], // San Francisco
  [40.7, -74.0], // New York
  [51.5, -0.1], // London
  [6.5, 3.4], // Lagos
  [1.35, 103.8], // Singapore
  [-6.2, 106.8], // Jakarta
  [-23.5, -46.6], // São Paulo
  [25.2, 55.3], // Dubai
];

function project(lat: number, lon: number, spin: number) {
  const x = Math.cos(lat) * Math.sin(lon + spin);
  const y = Math.sin(lat);
  const z = Math.cos(lat) * Math.cos(lon + spin);
  const y2 = y * Math.cos(TILT) - z * Math.sin(TILT);
  const z2 = y * Math.sin(TILT) + z * Math.cos(TILT);
  return { X: C + R * x, Y: C - R * y2, z: z2 };
}

function curve(point: (t: number) => { X: number; Y: number; z: number }) {
  const steps = 64;
  let d = "";
  let pen = false;
  for (let i = 0; i <= steps; i++) {
    const p = point(i / steps);
    if (p.z < 0) {
      pen = false;
      continue;
    }
    d += `${pen ? "L" : "M"}${p.X.toFixed(1)} ${p.Y.toFixed(1)}`;
    pen = true;
  }
  return d || "M0 0";
}

function frame(spin: number) {
  const paths = [
    ...Array.from({ length: 12 }, (_, k) =>
      curve((t) => project(-90 * deg + t * 180 * deg, k * 30 * deg, spin)),
    ),
    ...[-60, -30, 0, 30, 60].map((lat) =>
      curve((t) => project(lat * deg, t * 360 * deg, spin)),
    ),
  ];
  const dots = CITIES.map(([lat, lon]) => {
    const p = project(lat * deg, lon * deg, spin);
    return { X: p.X, Y: p.Y, o: Math.max(0, Math.min(1, p.z * 3)) };
  });
  return { paths, dots };
}

const INITIAL = frame(START_SPIN);

export default function Globe({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const dotRefs = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let spin = START_SPIN;
    let last = 0;
    let raf = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      // The spin is slow, so ~20fps looks identical and costs a third of the work
      if (last && now - last < FRAME_MS) return;
      if (last) spin += ((now - last) / 1000) * SPEED;
      last = now;
      const f = frame(spin);
      f.paths.forEach((d, i) => pathRefs.current[i]?.setAttribute("d", d));
      f.dots.forEach((p, i) => {
        const g = dotRefs.current[i];
        if (!g) return;
        g.setAttribute(
          "transform",
          `translate(${p.X.toFixed(1)} ${p.Y.toFixed(1)})`,
        );
        g.style.opacity = String(p.o);
      });
    };

    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(svg);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx={C}
        cy={C}
        r={R}
        stroke="#eadfcb"
        strokeWidth="1.8"
        strokeDasharray="8 7"
      />
      <g stroke="#eadfcb" strokeWidth="1.8" strokeDasharray="8 7">
        {INITIAL.paths.map((d, i) => (
          <path
            key={i}
            d={d}
            ref={(el) => {
              pathRefs.current[i] = el;
            }}
          />
        ))}
      </g>
      <g>
        {INITIAL.dots.map((p, i) => (
          <g
            key={i}
            ref={(el) => {
              dotRefs.current[i] = el;
            }}
            transform={`translate(${p.X.toFixed(1)} ${p.Y.toFixed(1)})`}
            style={{ opacity: p.o }}
          >
            <circle
              r="5"
              fill="#e6c48f"
              className="globe-ping"
              style={{ animationDelay: `${(i * 0.37) % 2.6}s` }}
            />
            <circle r="5" fill="#e6c48f" />
          </g>
        ))}
      </g>
    </svg>
  );
}
