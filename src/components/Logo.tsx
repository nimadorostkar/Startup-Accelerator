import { useId } from "react";

/** VC monogram: thick/hairline V with a high-contrast C the hairline cuts through. */
export function VCMark({ className = "" }: { className?: string }) {
  const cut = useId();
  return (
    <svg
      viewBox="0 0 60 32"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <mask id={cut}>
          <rect width="60" height="32" fill="#fff" />
          <path d="M18.6 31.4 30.6 0.4" stroke="#000" strokeWidth="4.8" />
        </mask>
      </defs>
      <path d="M0.4 0h8.8L21 32h-5.6Z" />
      <path
        mask={`url(#${cut})`}
        d="M54.89 5.29A16 16 0 1 0 54.89 26.71L52.29 23.88A10.6 10.6 0 1 1 52.29 8.12Z"
      />
      <path
        d="M18.6 31.4 30.6 0.4"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
      />
    </svg>
  );
}
