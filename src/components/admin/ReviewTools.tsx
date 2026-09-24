"use client";

import { useActionState, useState, useTransition } from "react";
import {
  addNote,
  assignToMe,
  decide,
  saveScorecard,
  unassign,
  type ReviewState,
} from "@/app/admin/actions";
import { DECISIONS, type Decision } from "@/lib/application/decisions";
import { RECOMMENDATIONS, SCORE_AREAS, type Scorecard } from "@/lib/application/types";
import FormBanner from "../auth/FormBanner";
import { CheckIcon } from "../icons";

function Result({ state }: { state: ReviewState }) {
  if (!state.message) return null;
  return state.ok ? (
    <p role="status" className="mt-3 flex items-start gap-2 text-[13px] text-green">
      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
      {state.message}
    </p>
  ) : (
    <FormBanner className="mt-3">{state.message}</FormBanner>
  );
}

const TONE: Record<Decision, string> = {
  start_review: "bg-ink text-white hover:bg-ink-soft",
  request_changes: "bg-[#fff1e0] text-[#8f4700] ring-1 ring-[#f3cfa0] hover:bg-[#ffe8cc]",
  accept: "bg-green text-white hover:brightness-110",
  decline: "bg-white text-danger ring-1 ring-danger/30 hover:bg-danger/[0.05]",
  reopen: "bg-white text-ink ring-1 ring-line hover:ring-gold",
};

const PROMPT: Record<Decision, string> = {
  start_review: "Optional note to the founder, e.g. who's reviewing and when to expect news.",
  request_changes: "What should the founder change or add? They'll see this exactly as written.",
  accept: "Optional welcome message — next steps, onboarding date.",
  decline: "Optional message. A sentence of honest feedback goes a long way.",
  reopen: "Optional note explaining why the decision is being revisited.",
};

/* Pick a decision → write the founder-facing message → confirm. Two steps,
   because every decision is visible to the founder immediately. */
export function DecisionPanel({ id, available }: { id: string; available: Decision[] }) {
  const [picked, setPicked] = useState<Decision | null>(null);
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(async (prev, form) => {
    const result = await decide(id, prev, form);
    if (result.ok) setPicked(null);
    return result;
  }, {});

  if (!available.length)
    return (
      <p className="text-[14px] leading-[1.55] text-muted">
        Not submitted yet — decisions unlock once the founder submits. You can still score it and leave notes.
      </p>
    );

  return (
    <div>
      {!picked ? (
        <div className="grid grid-cols-2 gap-2">
          {available.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setPicked(d)}
              className={`h-11 rounded-full px-3 text-[13px] font-semibold transition-[background-color,filter,box-shadow] ${TONE[d]} ${
                available.length % 2 === 1 && d === available[0] ? "col-span-2" : ""
              }`}
            >
              {DECISIONS[d].label}
            </button>
          ))}
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="decision" value={picked} />
          <p className="text-[14px] font-semibold text-ink">
            {DECISIONS[picked].label}
            <span className="font-normal text-muted"> — message to the founder</span>
          </p>
          <label className="sr-only" htmlFor="decision-message">
            Message to the founder
          </label>
          <textarea
            id="decision-message"
            name="message"
            rows={5}
            autoFocus
            required={DECISIONS[picked].message === "required"}
            defaultValue={state.values?.message}
            placeholder={PROMPT[picked]}
            aria-invalid={state.errors?.message ? true : undefined}
            aria-describedby={state.errors?.message ? "decision-message-error" : undefined}
            className="field-input"
          />
          {state.errors?.message && (
            <p id="decision-message-error" className="-mt-1 text-[13px] text-danger">
              {state.errors.message}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="h-11 flex-1 rounded-full text-[13px] font-semibold text-muted ring-1 ring-line hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className={`h-11 flex-1 rounded-full text-[13px] font-semibold disabled:opacity-60 ${TONE[picked]}`}
            >
              {pending ? "Saving…" : `Confirm: ${DECISIONS[picked].label.toLowerCase()}`}
            </button>
          </div>
        </form>
      )}
      <Result state={state} />
    </div>
  );
}

export function AssignButton({ id, assignedToMe, assigned }: { id: string; assignedToMe: boolean; assigned: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (fn: typeof assignToMe) =>
    start(async () => {
      const r = await fn(id);
      setError(r.ok ? null : (r.message ?? "Couldn't update the assignment."));
    });

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(assignedToMe ? unassign : assignToMe)}
        className="h-9 shrink-0 rounded-full px-3.5 text-[13px] font-semibold text-ink ring-1 ring-line hover:ring-gold disabled:opacity-60"
      >
        {pending ? "…" : assignedToMe ? "Unassign" : assigned ? "Take over" : "Assign to me"}
      </button>
      {error && <FormBanner className="mt-3 w-full">{error}</FormBanner>}
    </>
  );
}

/* Each reviewer scores independently; saving replaces only your own card. */
export function ScorecardForm({ id, mine }: { id: string; mine: Scorecard | null }) {
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(saveScorecard.bind(null, id), {});
  const v = (name: string, saved: string | number | undefined) => state.values?.[name] ?? (saved === undefined ? "" : String(saved));

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* Remount on save so the radios pick up stored values */}
      <div key={state.savedAt ?? "initial"} className="flex flex-col gap-4">
        {SCORE_AREAS.map((area) => {
          const name = `score-${area.id}`;
          const current = v(name, mine?.scores[area.id]);
          return (
            <fieldset key={area.id}>
              <legend className="flex w-full items-baseline justify-between gap-2">
                <span className="text-[14px] font-semibold text-ink">{area.label}</span>
                <span className="text-[12px] text-muted">1 weak · 5 strong</span>
              </legend>
              <p className="mt-0.5 text-[12px] leading-snug text-muted">{area.hint}</p>
              <div className="mt-2 grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label
                    key={n}
                    className="flex h-10 cursor-pointer items-center justify-center rounded-lg text-[14px] font-semibold text-ink-soft ring-1 ring-line transition-colors hover:ring-gold has-checked:bg-ink has-checked:text-white has-checked:ring-ink has-focus-visible:outline-2 has-focus-visible:outline-gold"
                  >
                    <input type="radio" name={name} value={n} defaultChecked={current === String(n)} className="sr-only" />
                    {n}
                    <span className="sr-only"> out of 5</span>
                  </label>
                ))}
              </div>
              {state.errors?.[name] && <p className="mt-1 text-[13px] text-danger">{state.errors[name]}</p>}
            </fieldset>
          );
        })}

        <fieldset>
          <legend className="text-[14px] font-semibold text-ink">Recommendation</legend>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {RECOMMENDATIONS.map((r) => (
              <label
                key={r.id}
                className="flex h-10 cursor-pointer items-center justify-center rounded-lg text-[13px] font-semibold text-ink-soft ring-1 ring-line transition-colors hover:ring-gold has-checked:bg-gold has-checked:text-gold-ink has-checked:ring-gold has-focus-visible:outline-2 has-focus-visible:outline-gold"
              >
                <input
                  type="radio"
                  name="recommendation"
                  value={r.id}
                  defaultChecked={v("recommendation", mine?.recommendation) === r.id}
                  className="sr-only"
                />
                {r.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold text-ink">Summary</span>
          <textarea
            name="summary"
            rows={4}
            defaultValue={v("summary", mine?.summary)}
            placeholder="Strengths, risks, and what you'd want to learn in an interview."
            className="field-input"
          />
          {state.errors?.summary && <span className="text-[13px] text-danger">{state.errors.summary}</span>}
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-full bg-gold-btn text-[13px] font-bold tracking-[0.04em] text-gold-ink uppercase disabled:opacity-60"
      >
        {pending ? "Saving…" : mine ? "Update scorecard" : "Save scorecard"}
      </button>
      <Result state={state} />
    </form>
  );
}

export function NoteForm({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(addNote.bind(null, id), {});
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <label htmlFor="note-body" className="sr-only">
        Internal note
      </label>
      {/* Keyed on the last save so the box clears after posting */}
      <textarea
        key={state.savedAt ?? "initial"}
        id="note-body"
        name="body"
        rows={3}
        defaultValue={state.ok ? "" : state.values?.body}
        placeholder="Visible to the review team only."
        aria-invalid={state.errors?.body ? true : undefined}
        className="field-input"
      />
      {state.errors?.body && <p className="text-[13px] text-danger">{state.errors.body}</p>}
      <button
        type="submit"
        disabled={pending}
        className="h-10 self-end rounded-full bg-ink px-5 text-[13px] font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Posting…" : "Add note"}
      </button>
      {state.ok && <Result state={state} />}
    </form>
  );
}
