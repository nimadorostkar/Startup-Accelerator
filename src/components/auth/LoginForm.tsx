"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, type AuthFormState } from "@/app/(auth)/actions";
import Field from "./Field";
import FormBanner from "./FormBanner";
import SubmitButton from "./SubmitButton";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    login,
    {},
  );
  /* Held here so "Forgot password?" can carry the address across. */
  const [email, setEmail] = useState(state.values?.email ?? "");
  const resetHref = email.trim()
    ? `/forgot-password?email=${encodeURIComponent(email.trim())}`
    : "/forgot-password";

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state.message && <FormBanner>{state.message}</FormBanner>}

      <Field
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={state.errors?.email}
      />

      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Your password"
        error={state.errors?.password}
        action={
          <Link
            href={resetHref}
            className="text-[13px] font-semibold text-gold-deep transition-colors duration-200 hover:text-ink"
          >
            Forgot password?
          </Link>
        }
      />

      <label className="flex w-fit items-center gap-3 py-1 text-[14px] text-ink-soft select-none">
        <input type="checkbox" name="remember" className="field-check" />
        Keep me signed in
      </label>

      <SubmitButton pending={pending} pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
