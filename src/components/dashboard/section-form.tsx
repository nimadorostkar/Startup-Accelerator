"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import type { SaveState } from "@/app/dashboard/actions";
import { AlertIcon, CheckIcon } from "../icons";

type Action = (prev: SaveState, form: FormData) => Promise<SaveState>;

/**
 * Wraps a dashboard section form: saving, error echo, dirty tracking and the
 * sticky save bar. `children` receives `v(name, saved)` for default values and
 * `err(name)` for field errors.
 */
export default function SectionForm({
  action,
  editable,
  children,
}: {
  action: Action;
  editable: boolean;
  children: (tools: {
    v: (name: string, saved: string | number | null | undefined) => string;
    err: (name: string) => string | undefined;
  }) => ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [dirty, setDirty] = useState(false);

  // A new successful save means the stored data now matches the form.
  const [seenSave, setSeenSave] = useState(state.savedAt);
  if (state.savedAt !== seenSave) {
    setSeenSave(state.savedAt);
    setDirty(false);
  }

  // Warn before a reload or tab close throws away unsaved answers.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const v = (name: string, saved: string | number | null | undefined) =>
    state.values?.[name] ?? (saved === null || saved === undefined ? "" : String(saved));
  const err = (name: string) => state.errors?.[name];

  return (
    <form
      action={formAction}
      noValidate
      onInput={() => setDirty(true)}
      className="flex flex-col gap-5"
    >
      {/* Remount on each successful save so every field (and textarea
          counter) picks up the freshly stored values. */}
      <fieldset key={state.savedAt ?? "initial"} disabled={!editable} className="flex min-w-0 flex-col gap-5">
        {children({ v, err })}
      </fieldset>

      {editable && <SaveBar state={state} pending={pending} dirty={dirty} />}
    </form>
  );
}

function SaveBar({ state, pending, dirty }: { state: SaveState; pending: boolean; dirty: boolean }) {
  const failed = state.ok === false && !pending;
  const status = pending
    ? { tone: "text-muted", icon: null, text: "Saving…" }
    : failed
      ? { tone: "text-danger", icon: <AlertIcon className="h-4 w-4 shrink-0" />, text: state.message }
      : dirty
        ? { tone: "text-gold-deep", icon: <span className="h-2 w-2 shrink-0 rounded-full bg-gold" />, text: "Unsaved changes" }
        : state.ok
          ? { tone: "text-green", icon: <CheckIcon className="h-4 w-4 shrink-0" />, text: state.message }
          : { tone: "text-muted", icon: null, text: "Your answers save as a draft — submit when everything is ready." };

  return (
    <div className="sticky bottom-0 z-10 -mx-4 border-t border-line-soft bg-white/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border sm:px-5 sm:py-3 sm:shadow-[0_18px_40px_-24px_rgba(0,15,22,0.35)]">
      <div className="flex items-center justify-between gap-4">
        <p role="status" aria-live="polite" className={`flex min-w-0 items-center gap-2 text-[13px] leading-snug ${status.tone}`}>
          {status.icon}
          <span className="min-w-0">{status.text}</span>
        </p>
        <button
          type="submit"
          disabled={pending}
          className="flex h-11 shrink-0 items-center justify-center rounded-full bg-gold-btn px-6 font-display text-[12px] font-bold tracking-[0.06em] text-gold-ink uppercase shadow-[0_12px_28px_-14px_rgba(214,150,67,0.9)] transition-[filter,opacity] duration-200 hover:brightness-105 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
