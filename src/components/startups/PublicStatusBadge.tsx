import {
  PUBLIC_STATUSES,
  type PublicStatus,
} from "@/lib/application/directory";

const TONES = {
  neutral: "bg-ink/[0.06] text-ink-soft ring-ink/10",
  brand: "bg-chip text-brand-strong ring-chip-line",
  green: "bg-green-light/70 text-green-deep ring-green/25",
} as const;

/* `label` is the status in the page's language (startups.options.statuses). */
export default function PublicStatusBadge({
  status,
  label,
  className = "",
}: {
  status: PublicStatus;
  label: string;
  className?: string;
}) {
  const { tone } = PUBLIC_STATUSES[status];
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
