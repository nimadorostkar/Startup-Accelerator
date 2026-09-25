"use client";

import { useActionState } from "react";
import { registerForEvent, type RegisterState } from "@/app/events/actions";
import Field from "../auth/Field";
import FormBanner from "../auth/FormBanner";
import SubmitButton from "../auth/SubmitButton";
import { CalendarIcon, CheckIcon } from "../icons";

export default function RegisterForm({
  slug,
  calendarUrl,
}: {
  slug: string;
  calendarUrl: string;
}) {
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(
    registerForEvent,
    {},
  );
  const v = state.values ?? {};
  const err = state.errors ?? {};

  if (state.done) {
    return (
      <div role="status" aria-live="polite">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-chip text-gold-deep ring-1 ring-chip-line">
          <CheckIcon className="h-5 w-5" />
        </span>
        <p className="mt-4 font-display text-[20px] font-bold text-ink">
          {state.done.existing
            ? "You're already registered"
            : "You're registered"}
        </p>
        <p className="mt-2 text-[14px] leading-[1.6] text-muted">
          Joining details go to{" "}
          <span className="font-semibold text-ink">{state.done.email}</span>{" "}
          before the event.
        </p>
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex h-12 items-center justify-center gap-2.5 rounded-full border border-line bg-white font-display text-[13px] font-semibold text-ink transition-colors duration-200 hover:border-gold"
        >
          <CalendarIcon className="h-[18px] w-[18px] text-gold-deep" />
          Add to Google Calendar
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="event" value={slug} />
      {state.message && <FormBanner>{state.message}</FormBanner>}
      <Field
        label="Full name"
        name="name"
        autoComplete="name"
        placeholder="Jane Founder"
        defaultValue={v.name}
        error={err.name}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@company.com"
        defaultValue={v.email}
        error={err.email}
      />
      <Field
        label="Company (optional)"
        name="company"
        autoComplete="organization"
        placeholder="Your startup or firm"
        defaultValue={v.company}
        error={err.company}
      />
      {/* Honeypot — off-screen and skipped by keyboard and screen readers */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <SubmitButton pending={pending} pendingLabel="Reserving…">
        Reserve my spot
      </SubmitButton>
      <p className="text-center text-[12px] text-muted">Free to attend.</p>
    </form>
  );
}
