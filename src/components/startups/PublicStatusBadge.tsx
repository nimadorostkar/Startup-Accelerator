import {
  PUBLIC_STATUSES,
  type PublicStatus,
} from "@/lib/application/directory";

const TONES = {
  neutral: "bg-ink/[0.06] text-ink-soft ring-ink/10",
  gold: "bg-chip text-gold-deep ring-chip-line",
  green: "bg-green-light/70 text-green-deep ring-green/25",
} as const;

export default function PublicStatusBadge({
  status,
  className = "",
}: {
  status: PublicStatus;
  className?: string;
}) {
  const { label, tone } = PUBLIC_STATUSES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] leading-none font-semibold whitespace-nowrap ring-1 ring-inset ${TONES[tone]} ${className}`}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-current"
      />
      {label}
    </span>
  );
}
