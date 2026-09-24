"use client";

import { useActionState, useState } from "react";
import { requestReset, type ResetFormState } from "@/app/(auth)/actions";
import { CheckIcon } from "../icons";
import Field from "./Field";
import FormBanner from "./FormBanner";
import SubmitButton from "./SubmitButton";

/* Owns the intro copy as well as the form, so both can be replaced by the
   confirmation once a link has been sent. */
export default function ForgotPasswordForm({
  defaultEmail = "",
}: {
  defaultEmail?: string;
}) {
  const [state, formAction, pending] = useActionState<ResetFormState, FormData>(
    requestReset,
    {},
  );
  /* Lets the user get back to the form after a send. Remembering *which*
     response they dismissed means a later send shows its confirmation
     again, with no effect needed to reset this. */
  const [dismissed, setDismissed] = useState<ResetFormState | null>(null);

  if (state.sent && dismissed !== state) {
    return (
      <div className="mt-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-chip text-gold-deep ring-1 ring-chip-line">
          <CheckIcon className="h-5 w-5" />
        </span>
        <h2 className="mt-5 font-display text-[22px] leading-tight font-bold tracking-[-0.01em] text-ink">
          Check your inbox
        </h2>
        <p className="lead mt-3">
          If an account exists for{" "}
          <span className="font-semibold text-ink">{state.email}</span>, a
          password reset link is on its way. The link is single-use and expires
          shortly.
        </p>
        <p className="mt-4 text-[14px] leading-[1.6] text-muted">
          Nothing after a minute or two? Check your spam folder, or try a
          different address.
        </p>

        <button
          type="button"
          onClick={() => setDismissed(state)}
          className="mt-8 flex h-12 w-full items-center justify-center rounded-full border border-line bg-white font-display text-[13px] font-semibold tracking-[0.04em] text-ink transition-colors duration-200 hover:border-gold"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <>
      <p className="lead mt-3">
        Enter the email you signed up with and we&rsquo;ll send you a link to
        set a new password.
      </p>

      <form action={formAction} noValidate className="mt-8 flex flex-col gap-5">
        {state.message && <FormBanner>{state.message}</FormBanner>}

        <Field
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@company.com"
          autoFocus
          defaultValue={state.values?.email ?? defaultEmail}
          error={state.errors?.email}
        />

        <SubmitButton pending={pending} pendingLabel="Sending link…">
          Send reset link
        </SubmitButton>
      </form>
    </>
  );
}
