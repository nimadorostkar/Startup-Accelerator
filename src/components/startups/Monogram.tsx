import { initials } from "../dashboard/initials";
import { monogramGradient } from "@/lib/application/directory";

/* Logo stand-in: the startup's initials on its own gradient. */
export default function Monogram({
  name,
  className = "h-14 w-14 rounded-[16px] text-[18px]",
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={{ background: monogramGradient(name) }}
      className={`flex shrink-0 items-center justify-center font-display font-extrabold tracking-[-0.02em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_24px_-12px_rgba(0,15,22,0.5)] ${className}`}
    >
      {initials(name)}
    </span>
  );
}

export function FounderDot({
  name,
  className = "h-7 w-7 text-[10px]",
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-chip font-display font-bold tracking-[0.02em] text-gold-deep ring-2 ring-white ${className}`}
    >
      {initials(name)}
    </span>
  );
}
