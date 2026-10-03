"use client";

import { ArrowRight } from "../icons";

/* The orange pill that submits the auth and public forms. While the form is
   sending it is aria-disabled rather than disabled: a disabled button drops
   keyboard focus to the page, so the answer couldn't be announced from where
   the visitor was. Clicks (and Enter in a field) are ignored meanwhile. */
export default function SubmitButton({
  children,
  pending,
  pendingLabel,
}: {
  children: React.ReactNode;
  pending: boolean;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      aria-disabled={pending || undefined}
      onClick={(e) => {
        if (pending) e.preventDefault();
      }}
      className="btn-shine group flex h-[52px] w-full items-center justify-center gap-3 rounded-full bg-brand-strong shadow-[0_16px_38px_-16px_rgba(194,71,10,0.85)] transition-[filter,opacity] duration-200 hover:brightness-105 aria-disabled:cursor-default aria-disabled:opacity-70 aria-disabled:[&::after]:hidden"
    >
      <span className="font-display text-[13px] font-bold tracking-[0.06em] text-white uppercase">
        {pending ? pendingLabel : children}
      </span>
      {!pending && (
        <ArrowRight className="h-[18px] w-[18px] shrink-0 text-white transition-transform duration-200 group-hover:translate-x-1" />
      )}
    </button>
  );
}
