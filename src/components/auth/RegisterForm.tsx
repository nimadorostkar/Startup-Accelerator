"use client";

import { useActionState, useId } from "react";
import { register, type AuthFormState } from "@/app/[lang]/(auth)/actions";
import { LocalLink as Link, useLocale } from "@/i18n/client";
import type { Messages } from "@/i18n/messages";
import Field from "./Field";
import { rich } from "@/i18n/rich";
import FormBanner from "./FormBanner";
import SubmitButton from "./SubmitButton";

type Strings = Messages["auth"]["fields"] & Messages["auth"]["register"]["form"];

export default function RegisterForm({ t }: { t: Strings }) {
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    register,
    {},
  );
  const termsError = useId();
  const legalLink = "font-semibold text-brand-strong underline-offset-2 hover:underline";

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state.message && <FormBanner>{state.message}</FormBanner>}
      <input type="hidden" name="lang" value={locale} />

      <Field
        label={t.name}
        name="name"
        autoComplete="name"
        placeholder={t.namePlaceholder}
        defaultValue={state.values?.name}
        error={state.errors?.name}
      />

      <Field
        label={t.email}
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder={t.emailPlaceholder}
        defaultValue={state.values?.email}
        error={state.errors?.email}
      />

      <Field
        label={t.password}
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder={t.passwordPlaceholder}
        showPasswordLabel={t.showPassword}
        hidePasswordLabel={t.hidePassword}
        error={state.errors?.password}
      />
      {!state.errors?.password && (
        <p className="-mt-3 text-[13px] text-muted">{t.passwordHint}</p>
      )}

      <div>
        <label className="flex items-start gap-3 text-[14px] leading-[1.55] text-ink-soft">
          <input
            type="checkbox"
            name="terms"
            defaultChecked={state.values?.terms === "on"}
            aria-invalid={state.errors?.terms ? true : undefined}
            aria-describedby={state.errors?.terms ? termsError : undefined}
            className="field-check mt-0.5 shrink-0"
          />
          <span>
            {rich(t.terms, {
              terms: (
                <Link href="/terms" className={legalLink}>
                  {t.termsLink}
                </Link>
              ),
              privacy: (
                <Link href="/privacy" className={legalLink}>
                  {t.privacyLink}
                </Link>
              ),
            })}
          </span>
        </label>
        {state.errors?.terms && (
          <p id={termsError} className="mt-1.5 text-[13px] text-danger">
            {state.errors.terms}
          </p>
        )}
      </div>

      <SubmitButton pending={pending} pendingLabel={t.pending}>
        {t.submit}
      </SubmitButton>
    </form>
  );
}
