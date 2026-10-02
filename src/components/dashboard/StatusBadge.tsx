import { STATUSES, type Status } from "@/lib/application/types";

const TONES = {
  neutral: "bg-ink/[0.06] text-ink-soft ring-ink/10",
  brand: "bg-chip text-brand-strong ring-chip-line",
  // Needs the founder's attention: yellow, so it reads apart from orange and calmer than an error.
  warn: "bg-[#fff7d6] text-[#735400] ring-[#f0dc8a]",
  green: "bg-green-light/70 text-green-deep ring-green/25",
} as const;

export default function StatusBadge({ status, className = "" }: { status: Status; className?: string }) {
  const { label, tone } = STATUSES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] leading-none font-semibold whitespace-nowrap ring-1 ring-inset ${TONES[tone]} ${className}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
