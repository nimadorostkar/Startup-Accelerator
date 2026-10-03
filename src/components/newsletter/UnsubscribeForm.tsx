"use client";

import Link from "next/link";
import { useActionState } from "react";
import { leaveNewsletter, type UnsubscribeState } from "@/app/newsletter/unsubscribe/actions";

/* A button rather than the link itself unsubscribes, so mail scanners that
   open every link can't unsubscribe people by accident. */
export default function UnsubscribeForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<UnsubscribeState, FormData>(leaveNewsletter, {});

  if (state.email) {
    return (
      <div className="mt-8">
        <p className="lead">
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
      {state.message && (
        <p role="status" className="rounded-xl border border-danger/25 bg-danger/[0.06] px-4 py-3 text-[13px] text-danger">
          {state.message}
        </p>
      )}
      <input type="hidden" name="token" value={token} />
      <button
        type="submit"
        disabled={pending || !token}
        className="flex h-12 w-full items-center justify-center rounded-full bg-ink font-display text-[13px] font-semibold tracking-[0.04em] text-white transition-colors duration-200 hover:bg-ink-soft disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {pending ? "Unsubscribing…" : "Unsubscribe"}
      </button>
    </form>
  );
}
