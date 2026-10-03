"use client";

import { useActionState } from "react";
import { saveAccountName, savePassword, type SaveState } from "@/app/(app)/dashboard/actions";
import FormBanner from "../auth/FormBanner";
import SignInAgain from "../auth/SignInAgain";
import { CheckIcon } from "../icons";
import { TextField } from "./fields";

function Outcome({ state }: { state: SaveState }) {
  if (!state.message) return null;
  return state.ok ? (
    <p role="status" className="flex items-start gap-2 text-[13px] text-green">
      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
      {state.message}
    </p>
  ) : (
    <FormBanner>
      {state.message}
      <SignInAgain href={state.signInHref} />
    </FormBanner>
  );
}

function SaveButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 self-start rounded-full bg-brand-strong px-6 font-display text-[12px] font-bold tracking-[0.06em] text-white uppercase transition-[filter,opacity] hover:brightness-105 disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

/* The name on the account: used in emails and shown to the review team. */
export function NameForm({ name }: { name: string }) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(saveAccountName, {});
  return (
    <form action={formAction} noValidate className="card flex flex-col gap-5 p-5 sm:p-7">
      <h2 className="font-display text-[18px] font-bold tracking-[-0.01em] text-ink">Your name</h2>
      <TextField
        key={state.savedAt ?? "initial"}
        idPrefix="account"
        name="name"
        label="Name"
        autoComplete="name"
        hint="Used in our emails to you. Your application has its own “full name” field."
        defaultValue={state.values?.name ?? name}
        error={state.errors?.name}
      />
      <Outcome state={state} />
      <SaveButton pending={pending} label="Save name" />
    </form>
  );
}

/* Change the password, or set one on an account that only signed in with Google.
   The API ends every other session, so a stolen one stops working. */
export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(savePassword, {});
  return (
    <form action={formAction} noValidate className="card flex flex-col gap-5 p-5 sm:p-7">
      <div>
        <h2 className="font-display text-[18px] font-bold tracking-[-0.01em] text-ink">
          {hasPassword ? "Change your password" : "Set a password"}
        </h2>
        {!hasPassword && (
          <p className="mt-1 text-[14px] leading-[1.6] text-muted">
            You sign in with Google. Set a password to sign in with your email as well.
          </p>
        )}
      </div>
      {/* Keyed on the last save, so the boxes clear once it worked. */}
      <div key={state.savedAt ?? "initial"} className="flex flex-col gap-5">
        {hasPassword && (
          <TextField
            idPrefix="account"
            name="currentPassword"
            label="Current password"
            type="password"
            autoComplete="current-password"
            error={state.errors?.currentPassword}
          />
        )}
        <TextField
          idPrefix="account"
          name="newPassword"
          label="New password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
          error={state.errors?.newPassword}
        />
      </div>
      <Outcome state={state} />
      <SaveButton pending={pending} label={hasPassword ? "Change password" : "Set password"} />
    </form>
  );
}
