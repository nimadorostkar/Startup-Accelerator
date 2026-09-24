/* Gold dot + tracked label that opens every section (same as the hero's). */
export default function Eyebrow({
  children,
  className = "",
  tone = "light",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <span className={`flex items-center gap-[0.85em] text-[11px] ${className}`}>
      <span
        aria-hidden="true"
        className="h-[1em] w-[1em] shrink-0 rounded-full bg-gold"
      />
      <span
        className={`font-display font-semibold tracking-[0.18em] uppercase ${
          tone === "dark" ? "text-gold" : "text-gold-deep"
        }`}
      >
        {children}
      </span>
    </span>
  );
}
