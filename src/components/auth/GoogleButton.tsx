"use client";

import { useActionState } from "react";
import { continueWithGoogle, type AuthFormState } from "@/app/[lang]/(auth)/actions";
import { useLocale } from "@/i18n/client";
import { GoogleMark } from "../icons";
import FormBanner from "./FormBanner";

/* Its own form, so a Google failure doesn't wipe what's typed in the
   email form next to it. */
export default function GoogleButton({
  label,
  pendingLabel = "Opening Google…",
  next,
}: {
  label: string;
  pendingLabel?: string;
  next?: string;
}) {
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    continueWithGoogle,
    {},
  );

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="lang" value={locale} />
        {next && <input type="hidden" name="next" value={next} />}
        <button
          type="submit"
          disabled={pending}
          className="flex h-[52px] w-full items-center justify-center gap-3 rounded-full border border-line bg-white text-ink transition-[border-color,background-color,opacity] duration-200 hover:border-ink/30 hover:bg-cream/60 disabled:opacity-60"
        >
          <GoogleMark className="h-[18px] w-[18px] shrink-0" />
          <span className="font-display text-[14px] font-semibold">
            {pending ? pendingLabel : label}
          </span>
        </button>
      </form>
      {state.message && <FormBanner className="mt-4">{state.message}</FormBanner>}
    </div>
  );
}
