"use client";

import { useActionState } from "react";
import { resendVerificationEmail, type SaveState } from "@/app/(app)/dashboard/actions";

const ENGLISH = {
  title: "Confirm your email.",
  sentTo: "We sent a link to {email}, so the review team can reach you.",
  resend: "Resend link",
  sending: "Sending…",
};

/* Shown until the founder confirms their address, so decisions and
   reminders reach a real inbox. In English on the dashboard; the sign-in
   pages pass their language's words (`t`). */
export default function VerifyEmailNotice({ email, t = ENGLISH }: { email: string; t?: typeof ENGLISH }) {
  const [before, after = ""] = t.sentTo.split("{email}");
  const [state, formAction, pending] = useActionState<SaveState, FormData>(resendVerificationEmail, {});

  return (
    <div
      role="status"
      className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#f3cfa0] bg-[#fff8ef] p-4 text-[14px] text-ink sm:flex-row sm:items-center sm:justify-between"
    >
      <p>
        <span className="font-semibold">{t.title}</span> {before}
        <bdi className="font-semibold">{email}</bdi>
        {after}
        {state.message && <span className="mt-1 block text-[13px] text-ink-soft">{state.message}</span>}
      </p>
      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-full border border-[#e9b877] bg-white px-4 text-[13px] font-semibold whitespace-nowrap text-ink hover:border-brand disabled:opacity-60"
        >
          {pending ? t.sending : t.resend}
        </button>
      </form>
    </div>
  );
}
