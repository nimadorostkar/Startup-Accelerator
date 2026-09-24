"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

const MAX_TILT = 6;

/* Card that leans toward the cursor and carries a gold spotlight under it. */
export default function TiltCard({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  const canTilt = () =>
    matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)")
      .matches;

  function onMove(e: PointerEvent<HTMLElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    if (canTilt()) {
      el.style.setProperty("--tx", `${(0.5 - py) * MAX_TILT}deg`);
      el.style.setProperty("--ty", `${(px - 0.5) * MAX_TILT}deg`);
    }
  }

  function onLeave() {
    ref.current?.style.setProperty("--tx", "0deg");
    ref.current?.style.setProperty("--ty", "0deg");
  }

  return (
    <article
      ref={ref}
      id={id}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`[transform:perspective(900px)_rotateX(var(--tx,0deg))_rotateY(var(--ty,0deg))] ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(260px circle at var(--mx, 50%) var(--my, 30%), rgba(221,158,66,0.13), transparent 70%)",
        }}
      />
      {children}
    </article>
  );
}
