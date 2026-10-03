"use client";

import { useActionState } from "react";
import { resendVerificationEmail, type SaveState } from "@/app/(app)/dashboard/actions";

/* Shown until the founder confirms their address, so decisions and
   reminders reach a real inbox. */
export default function VerifyEmailNotice({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(resendVerificationEmail, {});

  return (
    <div
      role="status"
      className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#f3cfa0] bg-[#fff8ef] p-4 text-[14px] text-ink sm:flex-row sm:items-center sm:justify-between"
    >
      <p>
        <span className="font-semibold">Confirm your email.</span> We sent a link to{" "}
        <span className="font-semibold">{email}</span>, so the review team can reach you.
        {state.message && <span className="mt-1 block text-[13px] text-ink-soft">{state.message}</span>}
      </p>
      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-full border border-[#e9b877] bg-white px-4 text-[13px] font-semibold whitespace-nowrap text-ink hover:border-brand disabled:opacity-60"
        >
          {pending ? "Sending…" : "Resend link"}
        </button>
      </form>
    </div>
  );
}
