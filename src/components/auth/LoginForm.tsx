"use client";

import { useActionState, useState } from "react";
import { login, type AuthFormState } from "@/app/[lang]/(auth)/actions";
import { LocalLink as Link, useLocale } from "@/i18n/client";
import type { Messages } from "@/i18n/messages";
import Field from "./Field";
import FormBanner from "./FormBanner";
import SubmitButton from "./SubmitButton";

type Strings = Messages["auth"]["fields"] & Messages["auth"]["login"]["form"];

/** `notice` is shown in the banner before the first submit (e.g. a failed Google sign-in);
    `next` is where to go once signed in (checked on the server). */
export default function LoginForm({ t, notice, next }: { t: Strings; notice?: string; next?: string }) {
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    login,
    notice ? { message: notice } : {},
  );
  /* Held here so "Forgot password?" can carry the address across. */
  const [email, setEmail] = useState(state.values?.email ?? "");
  const resetHref = email.trim()
    ? `/forgot-password?email=${encodeURIComponent(email.trim())}`
    : "/forgot-password";

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state.message && <FormBanner>{state.message}</FormBanner>}
      <input type="hidden" name="lang" value={locale} />
      {next && <input type="hidden" name="next" value={next} />}

      <Field
        label={t.email}
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder={t.emailPlaceholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={state.errors?.email}
      />

      <Field
        label={t.password}
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder={t.passwordPlaceholder}
        showPasswordLabel={t.showPassword}
        hidePasswordLabel={t.hidePassword}
        error={state.errors?.password}
        action={
          <Link
            href={resetHref}
            className="text-[13px] font-semibold text-brand-strong transition-colors duration-200 hover:text-ink"
          >
            {t.forgot}
          </Link>
        }
      />

      <label className="flex w-fit items-center gap-3 py-1 text-[14px] text-ink-soft select-none">
        <input
          type="checkbox"
          name="remember"
          defaultChecked={state.values?.remember === "on"}
          className="field-check"
        />
        {t.remember}
      </label>

      <SubmitButton pending={pending} pendingLabel={t.pending}>
        {t.submit}
      </SubmitButton>
    </form>
  );
}
