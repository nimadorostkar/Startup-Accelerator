"use client";

import Link from "next/link";
import { useActionState } from "react";
import { chooseNewPassword, type AuthFormState } from "@/app/[lang]/(auth)/actions";
import Field from "./Field";
import FormBanner from "./FormBanner";
import SubmitButton from "./SubmitButton";

/* The second half of a password reset: the token comes from the emailed
   link, and a success signs the user straight in. */
export default function ResetPasswordForm({ token }: { token: string }) {
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
            Get a new link
          </Link>
        </FormBanner>
      )}
      <input type="hidden" name="token" value={token} />
      <Field
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters, with a number"
        error={state.errors?.password}
      />
      <SubmitButton pending={pending} pendingLabel="Saving…">
        Set new password
      </SubmitButton>
    </form>
  );
}
