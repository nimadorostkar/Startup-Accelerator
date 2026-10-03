import type { Ref } from "react";
import { AlertIcon } from "../icons";

const BANNER =
  "flex items-start gap-2.5 rounded-xl border border-danger/25 bg-danger/[0.06] px-4 py-3 text-[13px] leading-[1.5] text-danger";

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
    <p role="status" aria-live="polite" className={`${BANNER} ${className}`}>
      <AlertIcon className="mt-px h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/* The same banner for a form's refusals, as an alert that is always mounted:
   a live region created together with its text is often not announced, so
   this one sits empty (and out of the layout) until there's a message.
   Focusable, so the form can move focus to it (see useResponseFocus). */
export function FormAlert({
  message,
  ref,
  className = "",
}: {
  message?: string;
  ref?: Ref<HTMLDivElement>;
  className?: string;
}) {
  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className={`rounded-xl empty:absolute ${className}`}
    >
      {message ? (
        <p className={BANNER}>
          <AlertIcon className="mt-px h-4 w-4 shrink-0" />
          <span>{message}</span>
        </p>
      ) : null}
    </div>
  );
}
