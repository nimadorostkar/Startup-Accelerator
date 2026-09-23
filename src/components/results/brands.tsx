/*
 * Wordmarks for the (placeholder) alumni companies.
 * Swap these for real alumni logos (SVG preferred) before launch.
 */
import type { BrandId } from "./data";

export function NorthvaleMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 28"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="38"
        height="26"
        rx="3"
        stroke="#e8836b"
        strokeWidth="2"
      />
      <path
        d="M8 20V8l8 12V8M22 8l5 12 5-12"
        stroke="#e8836b"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KitebaseMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-end font-sans font-bold tracking-[-0.04em] text-[#1c1d1f] ${className}`}
    >
      <span className="relative">
        k
        <svg
          viewBox="0 0 20 10"
          className="absolute -top-[0.28em] left-[-0.02em] w-[0.62em]"
          aria-hidden="true"
        >
          <path
            d="M1 9 10 2l9 7"
            fill="none"
            stroke="#a435f0"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      itebase
    </span>
  );
}

export function TidewellMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-[0.25em] font-sans font-semibold tracking-[-0.01em] ${className}`}
    >
      <svg
        viewBox="0 0 20 20"
        className="h-[1.15em] w-[1.15em]"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="9" fill="#e5484d" />
        <path
          d="M4 11c2.5-3 5.5-3 8 0s4.5 3 5 1"
          fill="none"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-[#1c1d1f]">
        Tide<span className="text-[#e5484d]">well</span>
      </span>
    </span>
  );
}

export function RestlyMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-[0.2em] font-sans font-semibold text-[#2aa7b8] ${className}`}
    >
      <svg viewBox="0 0 12 12" className="h-[1em] w-[1em]" aria-hidden="true">
        <path
          d="M9.5 3.5A4.5 4.5 0 1 0 10 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      Restly
    </span>
  );
}

/** Small logo shown in the corner of a testimonial card. */
export function BrandBadge({ brand }: { brand: BrandId }) {
  switch (brand) {
    case "northvale":
      return <NorthvaleMark className="h-7 w-auto" />;
    case "kitebase":
      return <KitebaseMark className="text-[25px] leading-none" />;
    case "tidewell":
      return <TidewellMark className="text-[13px]" />;
    case "restly":
      return <RestlyMark className="text-[10px]" />;
  }
}

/* ---- Logo strip ---- */

export function RelaywaveMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 40" className={className} aria-hidden="true">
      <circle cx="4" cy="14" r="2.4" fill="#c4b5fd" />
      <circle cx="3" cy="22" r="2" fill="#ddd6fe" />
      <path
        d="M17 8.5a14 14 0 1 1-3.6 17"
        fill="none"
        stroke="#7c3aed"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LedgerlyMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-[0.28em] font-sans font-bold tracking-[-0.02em] text-[#1c1d1f] ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[0.95em] w-[0.95em]"
        aria-hidden="true"
      >
        <path d="M3 3h14l4 4v14H7l-4-4Z" fill="#f5c400" />
        <path d="M9 9h6v6H9Z" fill="#fff" />
      </svg>
      Ledgerly
    </span>
  );
}
