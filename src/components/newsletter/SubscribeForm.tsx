"use client";

import { useActionState, useId } from "react";
import { subscribe, type SubscribeState } from "@/app/newsletter/actions";
import { ArrowRight, CheckIcon } from "../icons";

/* Inline email + button pill. `tone="dark"` for navy bands. */
export default function SubscribeForm({
  source,
  tone = "light",
  className = "",
}: {
  /** Where on the site the sign-up happened, stored with the address. */
  source: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const [state, formAction, pending] = useActionState<SubscribeState, FormData>(
    subscribe,
    {},
  );
  const id = useId();
  const dark = tone === "dark";

  if (state.done) {
    return (
      <p
        role="status"
        aria-live="polite"
        className={`flex items-center gap-3 rounded-full px-5 py-3.5 text-[15px] ${
          dark
            ? "bg-white/[0.08] text-white ring-1 ring-white/15"
            : "bg-chip text-ink ring-1 ring-chip-line"
        } ${className}`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-gold-ink">
          <CheckIcon className="h-4 w-4" />
        </span>
        {state.done === "new" ? (
          <span>
            You&rsquo;re in. The next issue goes to{" "}
            <strong className="font-semibold">{state.email}</strong>.
          </span>
        ) : (
          <span>
            <strong className="font-semibold">{state.email}</strong> is already
            on the list.
          </span>
        )}
      </p>
    );
  }

  return (
    <form action={formAction} noValidate className={className}>
      <input type="hidden" name="source" value={source} />
      <div
        className={`flex flex-col gap-2 rounded-[28px] p-1.5 sm:flex-row sm:items-center sm:rounded-full ${
          dark
            ? "bg-white/[0.07] ring-1 ring-white/15 focus-within:ring-gold/70"
            : "bg-white shadow-[0_18px_40px_-24px_rgba(0,15,22,0.35)] ring-1 ring-line focus-within:ring-gold"
        } transition-shadow duration-200`}
      >
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@company.com"
          defaultValue={state.email}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? `${id}-error` : undefined}
          className={`h-12 min-w-0 flex-1 rounded-full bg-transparent px-5 text-[16px] outline-none focus-visible:outline-none ${
            dark
              ? "text-white placeholder:text-white/45"
              : "text-ink placeholder:text-muted/70"
          }`}
        />
        <button
          type="submit"
          disabled={pending}
          className="btn-shine group flex h-12 shrink-0 items-center justify-center gap-2.5 rounded-full bg-gold-btn px-6 shadow-[0_12px_28px_-14px_rgba(214,150,67,0.9)] transition-[filter,opacity] duration-200 hover:brightness-105 disabled:opacity-70"
        >
          <span className="font-display text-[12px] font-bold tracking-[0.06em] text-gold-ink uppercase">
            {pending ? "Subscribing…" : "Subscribe"}
          </span>
          {!pending && (
            <ArrowRight className="h-4 w-4 text-gold-ink transition-transform duration-200 group-hover:translate-x-1" />
          )}
        </button>
      </div>
      {/* Honeypot — off-screen and skipped by keyboard and screen readers */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.error && (
        <p
          id={`${id}-error`}
          role="alert"
          className={`mt-2.5 px-5 text-[13px] ${dark ? "text-[#ffb4ab]" : "text-danger"}`}
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
