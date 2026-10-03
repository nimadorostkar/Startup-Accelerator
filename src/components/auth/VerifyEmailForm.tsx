"use client";

import Link from "next/link";
import { useActionState } from "react";
import { confirmEmail, type VerifyState } from "@/app/(auth)/actions";
import { CheckIcon } from "../icons";
import FormBanner from "./FormBanner";
import SubmitButton from "./SubmitButton";

export default function VerifyEmailForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<VerifyState, FormData>(confirmEmail, {});

  if (state.ok) {
    return (
      <div className="mt-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-chip text-brand-strong ring-1 ring-chip-line">
          <CheckIcon className="h-5 w-5" />
        </span>
        <h2 className="mt-5 font-display text-[22px] leading-tight font-bold tracking-[-0.01em] text-ink">
          Email confirmed
        </h2>
        <p className="lead mt-3">Thanks — we&rsquo;ll use this address for everything about your application.</p>
        <Link
          href="/dashboard"
          className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-ink font-display text-[13px] font-semibold tracking-[0.04em] text-white transition-colors duration-200 hover:bg-ink-soft"
        >
          Go to your dashboard
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      {state.message && <FormBanner>{state.message}</FormBanner>}
      <input type="hidden" name="token" value={token} />
      <SubmitButton pending={pending} pendingLabel="Confirming…">
        Confirm my email
      </SubmitButton>
    </form>
  );
}
