import { AlertIcon } from "../icons";

/* Message above a form. Announced politely so it reaches screen readers
   without interrupting whatever they're reading. */
export default function FormBanner({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={`flex items-start gap-2.5 rounded-xl border border-danger/25 bg-danger/[0.06] px-4 py-3 text-[13px] leading-[1.5] text-danger ${className}`}
    >
      <AlertIcon className="mt-px h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
