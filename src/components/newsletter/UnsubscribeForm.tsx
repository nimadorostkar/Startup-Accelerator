"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";
import { leaveNewsletter, type UnsubscribeState } from "@/app/newsletter/unsubscribe/actions";
import { FormAlert } from "../auth/FormBanner";
import { useResponseFocus } from "../auth/useResponseFocus";

/* A button rather than the link itself unsubscribes, so mail scanners that
   open every link can't unsubscribe people by accident. The page only shows
   this with a token (an incomplete link gets a note instead). */
export default function UnsubscribeForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<UnsubscribeState, FormData>(leaveNewsletter, {});
  const alert = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useResponseFocus(state, { heading, alert });

  if (state.email) {
    return (
      <div className="mt-8">
        <h2 ref={heading} tabIndex={-1} className="font-display text-[22px] font-bold text-ink">
          You&rsquo;re unsubscribed
        </h2>
        <p className="lead mt-2">
          <span className="font-semibold text-ink">{state.email}</span> won&rsquo;t get The Founder Brief any more.
        </p>
        <p className="mt-3 text-[14px] text-muted">
          Changed your mind? You can{" "}
          <Link href="/newsletter" className="font-semibold text-brand-strong hover:text-ink">
            sign up again
          </Link>{" "}
          at any time.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <FormAlert ref={alert} message={state.message} />
      <input type="hidden" name="token" value={token} />
      {/* aria-disabled rather than disabled while sending, so focus stays on it */}
      <button
        type="submit"
        aria-disabled={pending || undefined}
        onClick={(e) => {
          if (pending) e.preventDefault();
        }}
        className="flex h-12 w-full items-center justify-center rounded-full bg-ink font-display text-[13px] font-semibold tracking-[0.04em] text-white transition-colors duration-200 hover:bg-ink-soft aria-disabled:cursor-default aria-disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {pending ? "Unsubscribing…" : "Unsubscribe"}
      </button>
    </form>
  );
}
