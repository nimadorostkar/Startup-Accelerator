"use client";

import { useActionState, useId, useState } from "react";
import {
  sendContactMessage,
  type ContactFormState,
} from "@/app/contact/actions";
import Field from "../auth/Field";
import FormBanner from "../auth/FormBanner";
import SubmitButton from "../auth/SubmitButton";
import { CheckIcon } from "../icons";

/* Topics come from the server page, since lib/contact is server-only. */
export default function ContactForm({ topics }: { topics: readonly string[] }) {
  const [state, formAction, pending] = useActionState<
    ContactFormState,
    FormData
  >(sendContactMessage, {});
  const [dismissed, setDismissed] = useState<ContactFormState | null>(null);
  const id = useId();
  const v = state.values ?? {};
  const err = state.errors ?? {};

  if (state.sent && dismissed !== state) {
    return (
      <div role="status" aria-live="polite">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-chip text-gold-deep ring-1 ring-chip-line">
          <CheckIcon className="h-5 w-5" />
        </span>
        <h2 className="mt-5 font-display text-[24px] leading-tight font-bold tracking-[-0.01em] text-ink">
          Message sent
        </h2>
        <p className="lead mt-3">
          Thanks, {state.sent.name.split(" ")[0]}. Our team will reply to{" "}
          <span className="font-semibold text-ink">{state.sent.email}</span>.
        </p>
        <button
          type="button"
          onClick={() => setDismissed(state)}
          className="mt-8 flex h-12 w-full items-center justify-center rounded-full border border-line bg-white font-display text-[13px] font-semibold tracking-[0.04em] text-ink transition-colors duration-200 hover:border-gold sm:w-auto sm:px-8"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state.message && <FormBanner>{state.message}</FormBanner>}

      <div className="grid gap-5 sm:grid-cols-2">
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
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Company (optional)"
          name="company"
          autoComplete="organization"
          placeholder="Your startup or firm"
          defaultValue={v.company}
          error={err.company}
        />
        <div>
          <label
            htmlFor={`${id}-topic`}
            className="font-display text-[13px] font-semibold text-ink"
          >
            What&rsquo;s this about?
          </label>
          <select
            id={`${id}-topic`}
            name="topic"
            defaultValue={v.topic ?? ""}
            aria-invalid={err.topic ? true : undefined}
            aria-describedby={err.topic ? `${id}-topic-error` : undefined}
            className="field-input mt-2"
          >
            <option value="" disabled>
              Choose a topic
            </option>
            {topics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          {err.topic && (
            <p
              id={`${id}-topic-error`}
              className="mt-1.5 text-[13px] text-danger"
            >
              {err.topic}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor={`${id}-message`}
          className="font-display text-[13px] font-semibold text-ink"
        >
          Message
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={6}
          maxLength={2000}
          placeholder="How can we help?"
          defaultValue={v.message}
          aria-invalid={err.message ? true : undefined}
          aria-describedby={err.message ? `${id}-message-error` : undefined}
          className="field-input mt-2"
        />
        {err.message && (
          <p
            id={`${id}-message-error`}
            className="mt-1.5 text-[13px] text-danger"
          >
            {err.message}
          </p>
        )}
      </div>

      {/* Honeypot — off-screen and skipped by keyboard and screen readers */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="sm:max-w-[260px]">
        <SubmitButton pending={pending} pendingLabel="Sending…">
          Send message
        </SubmitButton>
      </div>
    </form>
  );
}
