"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { register, type AuthFormState } from "@/app/(auth)/actions";
import Field from "./Field";
import FormBanner from "./FormBanner";
import SubmitButton from "./SubmitButton";

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    register,
    {},
  );
  const termsError = useId();

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state.message && <FormBanner>{state.message}</FormBanner>}

      <Field
        label="Full name"
        name="name"
        autoComplete="name"
        placeholder="Ada Lovelace"
        defaultValue={state.values?.name}
        error={state.errors?.name}
      />

      <Field
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@company.com"
        defaultValue={state.values?.email}
        error={state.errors?.email}
      />

      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={state.errors?.password}
      />
      {!state.errors?.password && (
        <p className="-mt-3 text-[13px] text-muted">
          At least 8 characters, with a letter and a number.
        </p>
      )}

      <div>
        <label className="flex items-start gap-3 text-[14px] leading-[1.55] text-ink-soft">
          <input
            type="checkbox"
            name="terms"
            aria-invalid={state.errors?.terms ? true : undefined}
            aria-describedby={state.errors?.terms ? termsError : undefined}
            className="field-check mt-0.5 shrink-0"
          />
          <span>
            I agree to the{" "}
            <Link href="/register" className="font-semibold text-gold-deep underline-offset-2 hover:underline">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link href="/register" className="font-semibold text-gold-deep underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {state.errors?.terms && (
          <p id={termsError} className="mt-1.5 text-[13px] text-danger">
            {state.errors.terms}
          </p>
        )}
      </div>

      <SubmitButton pending={pending} pendingLabel="Creating account…">
        Create account
      </SubmitButton>
    </form>
  );
}
