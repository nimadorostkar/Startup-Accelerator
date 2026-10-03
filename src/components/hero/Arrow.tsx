/** The hero handoff's long arrow (16×12), drawn in currentColor. It points
    forward, so it turns around on right-to-left pages (data-flip, globals.css). */
export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      data-flip=""
      viewBox="0 0 16 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M1 6h13M9 1l5 5-5 5" />
    </svg>
  );
}
