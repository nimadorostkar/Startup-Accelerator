"use client";

import { useActionState, useId, useRef, useState } from "react";
import {
  sendContactMessage,
  type ContactFormState,
} from "@/app/[lang]/contact/actions";
import { useLocale } from "@/i18n/client";
import type { Messages } from "@/i18n/messages";
import { rich } from "../startups/i18n";
import Field from "../auth/Field";
import { FormAlert } from "../auth/FormBanner";
import SubmitButton from "../auth/SubmitButton";
import { useResponseFocus } from "../auth/useResponseFocus";
import { CheckIcon } from "../icons";

/* Topics come from the server page, since lib/contact is server-only. The
   form sends the English topic (what the API stores) and shows its label in
   the page's language. */
export default function ContactForm({
  topics,
  t,
}: {
  topics: readonly string[];
  t: Messages["contact"]["form"];
}) {
  const locale = useLocale();
  /* Each answer is numbered, so the topic dropdown can be re-created with the
     topic that was picked: React resets the form after the action runs, and a
     <select> would otherwise drop back to "Choose a topic". */
  const [state, formAction, pending] = useActionState<
    ContactFormState & { response?: number },
    FormData
  >(
    async (prev, form) => ({
      ...(await sendContactMessage(prev, form)),
      response: (prev.response ?? 0) + 1,
    }),
    {},
  );
  const [dismissed, setDismissed] = useState<ContactFormState | null>(null);
  const id = useId();
  const v = state.values ?? {};
  const err = state.errors ?? {};
  const form = useRef<HTMLFormElement>(null);
  const alert = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useResponseFocus(state, { heading, form, alert });

  if (state.sent && dismissed !== state) {
    return (
      <div>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-chip text-brand-strong ring-1 ring-chip-line">
          <CheckIcon className="h-5 w-5" />
        </span>
        <h2
          ref={heading}
          tabIndex={-1}
          className="mt-5 font-display text-[24px] leading-tight font-bold tracking-[-0.01em] text-ink"
        >
          {t.sentTitle}
        </h2>
        <p className="lead mt-3">
          {rich(t.sentBody, {
            name: <bdi>{state.sent.name.split(" ")[0]}</bdi>,
            email: (
              <bdi className="font-semibold text-ink">{state.sent.email}</bdi>
            ),
          })}
        </p>
        <button
          type="button"
          onClick={() => setDismissed(state)}
          className="mt-8 flex h-12 w-full items-center justify-center rounded-full border border-line bg-white font-display text-[13px] font-semibold tracking-[0.04em] text-ink transition-colors duration-200 hover:border-brand sm:w-auto sm:px-8"
        >
          {t.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form
      ref={form}
      action={formAction}
      noValidate
      className="flex flex-col gap-5"
    >
      <FormAlert ref={alert} message={state.message} />
      <input type="hidden" name="lang" value={locale} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={t.name}
          name="name"
          autoComplete="name"
          maxLength={80}
          // Back from "Send another message": start again at the top
          autoFocus={dismissed === state}
          placeholder={t.namePlaceholder}
          defaultValue={v.name}
          error={err.name}
        />
        <Field
          label={t.email}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={254}
          placeholder={t.emailPlaceholder}
          defaultValue={v.email}
          error={err.email}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={t.company}
          name="company"
          autoComplete="organization"
          maxLength={120}
          placeholder={t.companyPlaceholder}
          defaultValue={v.company}
          error={err.company}
        />
        <div>
          <label
            htmlFor={`${id}-topic`}
            className="font-display text-[13px] font-semibold text-ink"
          >
            {t.topic}
          </label>
          <select
            key={state.response ?? 0}
            id={`${id}-topic`}
            name="topic"
            defaultValue={v.topic ?? ""}
            aria-invalid={err.topic ? true : undefined}
            aria-describedby={err.topic ? `${id}-topic-error` : undefined}
            className="field-input mt-2"
          >
            <option value="" disabled>
              {t.topicPlaceholder}
            </option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {(t.topics as Record<string, string>)[topic] ?? topic}
              </option>
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
          {t.message}
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={6}
          maxLength={2000}
          placeholder={t.messagePlaceholder}
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
        className="absolute -start-[9999px] h-px w-px overflow-hidden"
      >
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="sm:max-w-[260px]">
        <SubmitButton pending={pending} pendingLabel={t.sending}>
          {t.send}
        </SubmitButton>
      </div>
    </form>
  );
}
