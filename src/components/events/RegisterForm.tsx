"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";
import { registerForEvent, type RegisterState } from "@/app/[lang]/events/actions";
import Field from "../auth/Field";
import { FormAlert } from "../auth/FormBanner";
import SubmitButton from "../auth/SubmitButton";
import { useResponseFocus } from "../auth/useResponseFocus";
import { ArrowRight, CalendarIcon, CheckIcon } from "../icons";

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
  const form = useRef<HTMLFormElement>(null);
  const alert = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useResponseFocus(state, { heading, form, alert });

  // The event ended or filled up while the page was open: no point retrying.
  if (state.closed) {
    return (
      <div>
        <h3
          ref={heading}
          tabIndex={-1}
          className="font-display text-[20px] font-bold text-ink"
        >
          Registration is closed
        </h3>
        <p className="mt-2 text-[14px] leading-[1.6] text-muted">
          {state.closed}
        </p>
        <Link
          href="/events#upcoming"
          className="mt-5 flex h-12 items-center justify-center gap-2.5 rounded-full bg-brand-strong font-display text-[13px] font-bold tracking-[0.06em] text-white uppercase"
        >
          Upcoming events
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (state.done) {
    return (
      <div>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-chip text-brand-strong ring-1 ring-chip-line">
          <CheckIcon className="h-5 w-5" />
        </span>
        <h3
          ref={heading}
          tabIndex={-1}
          className="mt-4 font-display text-[20px] font-bold text-ink"
        >
          {state.done.existing
            ? "You're already registered"
            : "You're registered"}
        </h3>
        <p className="mt-2 text-[14px] leading-[1.6] text-muted">
          Joining details go to{" "}
          <span className="font-semibold text-ink">{state.done.email}</span>{" "}
          before the event.
        </p>
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex h-12 items-center justify-center gap-2.5 rounded-full border border-line bg-white font-display text-[13px] font-semibold text-ink transition-colors duration-200 hover:border-brand"
        >
          <CalendarIcon className="h-[18px] w-[18px] text-brand-strong" />
          Add to Google Calendar
        </a>
      </div>
    );
  }

  return (
    <form
      ref={form}
      action={formAction}
      noValidate
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="event" value={slug} />
      <FormAlert ref={alert} message={state.message} />
      <Field
        label="Full name"
        name="name"
        autoComplete="name"
        maxLength={80}
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
        maxLength={254}
        placeholder="you@company.com"
        defaultValue={v.email}
        error={err.email}
      />
      <Field
        label="Company (optional)"
        name="company"
        autoComplete="organization"
        maxLength={120}
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
