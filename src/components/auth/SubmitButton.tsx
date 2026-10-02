import { ArrowRight } from "../icons";

/* The orange pill used to submit both auth forms. */
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
      disabled={pending}
      className="btn-shine group flex h-[52px] w-full items-center justify-center gap-3 rounded-full bg-brand-strong shadow-[0_16px_38px_-16px_rgba(194,71,10,0.85)] transition-[filter,opacity] duration-200 hover:brightness-105 disabled:opacity-70 disabled:[&::after]:hidden"
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
