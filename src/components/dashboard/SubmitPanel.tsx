"use client";

import { useActionState, useTransition, useState } from "react";
import { submitApplication, withdrawApplication, type SaveState } from "@/app/dashboard/actions";
import FormBanner from "../auth/FormBanner";
import { ArrowRight, CheckIcon } from "../icons";

export function SubmitPanel({
  ready,
  missingCount,
  resubmission,
}: {
  ready: boolean;
  missingCount: number;
  resubmission: boolean;
}) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(submitApplication, {});

  return (
    <form action={formAction} noValidate className="card p-5 sm:p-7">
      <h2 className="font-display text-[18px] font-bold tracking-[-0.01em] text-ink">
        {resubmission ? "Resubmit your application" : "Submit for review"}
      </h2>
      <p className="mt-1 text-[14px] leading-[1.6] text-muted">
        Once submitted, your answers are locked while our team validates and analyses them. You can withdraw
        until the review starts.
      </p>

      {state.message && !state.ok && <FormBanner className="mt-4">{state.message}</FormBanner>}

      <label className="mt-5 flex items-start gap-3 text-[14px] leading-[1.55] text-ink-soft">
        <input
          type="checkbox"
          name="confirm"
          disabled={!ready}
          aria-invalid={state.errors?.confirm ? true : undefined}
          aria-describedby={state.errors?.confirm ? "confirm-error" : undefined}
          className="field-check mt-0.5 shrink-0"
        />
        <span>
          I confirm these details are accurate, and that I&rsquo;m authorised to apply on behalf of the team.
        </span>
      </label>
      {state.errors?.confirm && (
        <p id="confirm-error" className="mt-1.5 text-[13px] text-danger">
          {state.errors.confirm}
        </p>
      )}

      <button
        type="submit"
        disabled={!ready || pending}
        className="btn-shine group mt-6 flex h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-gold-btn font-display text-[13px] font-bold tracking-[0.06em] text-gold-ink uppercase shadow-[0_16px_38px_-16px_rgba(214,150,67,0.85)] transition-[filter,opacity] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:[&::after]:hidden sm:w-auto sm:px-8"
      >
        {pending ? "Submitting…" : resubmission ? "Resubmit application" : "Submit application"}
        {!pending && <ArrowRight className="h-4 w-4 transition-transform group-enabled:group-hover:translate-x-1" />}
      </button>
      {!ready && (
        <p className="mt-3 text-[13px] text-muted">
          Answer the {missingCount} remaining required {missingCount === 1 ? "question" : "questions"} above to
          submit.
        </p>
      )}
    </form>
  );
}

export function WithdrawButton() {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<SaveState | null>(null);

  if (result?.ok)
    return (
      <p className="flex items-center gap-2 text-[14px] text-green">
        <CheckIcon className="h-4 w-4" />
        {result.message}
      </p>
    );

  return (
    <div>
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] text-ink-soft">Withdraw and return to draft?</span>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="h-10 rounded-full px-4 text-[13px] font-semibold text-muted hover:text-ink"
          >
            Keep it submitted
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => start(async () => setResult(await withdrawApplication()))}
            className="h-10 rounded-full bg-ink px-5 text-[13px] font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Withdrawing…" : "Yes, withdraw"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="h-10 rounded-full border border-line bg-white px-5 text-[13px] font-semibold text-ink transition-colors hover:border-gold"
        >
          Withdraw to make changes
        </button>
      )}
      {result && !result.ok && <FormBanner className="mt-3">{result.message}</FormBanner>}
    </div>
  );
}
