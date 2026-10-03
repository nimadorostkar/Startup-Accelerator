"use client";

import { useActionState } from "react";
import { chooseNewPassword, type AuthFormState } from "@/app/[lang]/(auth)/actions";
import { LocalLink as Link, useLocale } from "@/i18n/client";
import type { Messages } from "@/i18n/messages";
import Field from "./Field";
import FormBanner from "./FormBanner";
import SubmitButton from "./SubmitButton";

/* The second half of a password reset: the token comes from the emailed
   link, and a success signs the user straight in. */
type Strings = Pick<Messages["auth"]["fields"], "showPassword" | "hidePassword"> &
  Messages["auth"]["reset"]["form"];

export default function ResetPasswordForm({ t, token }: { t: Strings; token: string }) {
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    chooseNewPassword,
    {},
  );

  return (
    <form action={formAction} noValidate className="mt-8 flex flex-col gap-5">
      {state.message && (
        <FormBanner>
          {state.message}{" "}
          <Link href="/forgot-password" className="font-semibold underline underline-offset-2">
            {t.newLink}
          </Link>
        </FormBanner>
      )}
      <input type="hidden" name="lang" value={locale} />
      <input type="hidden" name="token" value={token} />
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
      <SubmitButton pending={pending} pendingLabel={t.pending}>
        {t.submit}
      </SubmitButton>
    </form>
  );
}
