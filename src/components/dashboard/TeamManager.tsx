"use client";

import { useActionState, useState, useTransition } from "react";
import { removeMember, saveMember, type SaveState } from "@/app/dashboard/actions";
import { COMMITMENTS, type TeamMember } from "@/lib/application/types";
import { PlusMark } from "../icons";
import FormBanner from "../auth/FormBanner";
import { ChoiceCards, TextField } from "./fields";
import { initials } from "./initials";

export default function TeamManager({
  members,
  editable,
}: {
  members: TeamMember[];
  editable: boolean;
}) {
  // Which card is open for editing: a member id, "new", or nothing.
  const [open, setOpen] = useState<string | null>(null);
  const equity = members.reduce((n, m) => n + (m.equity ?? 0), 0);

  return (
    <section className="card p-5 sm:p-7" aria-labelledby="members-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="members-title" className="font-display text-[18px] font-bold tracking-[-0.01em] text-ink">
            Team members
            <span className="ml-1 text-gold-deep" title="Required to submit">
              *<span className="sr-only"> (at least one founder is required to submit)</span>
            </span>
          </h2>
          <p className="mt-1 text-[14px] leading-[1.55] text-muted">
            Everyone building the company — founders first. Include yourself.
          </p>
        </div>
        <EquityMeter total={equity} />
      </div>

      <ul id="field-members" className="mt-6 flex flex-col gap-3">
        {members.map((m) => (
          <li key={m.id}>
            {open === m.id ? (
              <MemberForm member={m} onDone={() => setOpen(null)} />
            ) : (
              <MemberCard
                member={m}
                editable={editable}
                onEdit={() => setOpen(m.id)}
                canRemove={members.length > 1}
              />
            )}
          </li>
        ))}
        {members.length === 0 && (
          <li className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[14px] text-muted">
            No one on the team yet.
          </li>
        )}
      </ul>

      {editable &&
        (open === "new" ? (
          <div className="mt-3">
            <MemberForm member={null} onDone={() => setOpen(null)} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen("new")}
            className="mt-3 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-dashed border-gold/60 text-[14px] font-semibold text-gold-deep transition-colors duration-200 hover:border-gold hover:bg-chip"
          >
            <PlusMark className="h-3.5 w-3.5" />
            Add team member
          </button>
        ))}
    </section>
  );
}

function EquityMeter({ total }: { total: number }) {
  const pct = Math.min(total, 100);
  return (
    <div className="w-full sm:w-56">
      <div className="flex justify-between text-[12px]">
        <span className="font-semibold text-ink-soft">Equity allocated</span>
        <span className={`tabular-nums ${total > 100 ? "text-danger" : "text-muted"}`}>{total}%</span>
      </div>
      <div
        role="meter"
        aria-label="Equity allocated across the team"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line-soft"
      >
        <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MemberCard({
  member: m,
  editable,
  onEdit,
  canRemove,
}: {
  member: TeamMember;
  editable: boolean;
  onEdit: () => void;
  canRemove: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [removing, startRemove] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const commitment = COMMITMENTS.find((c) => c.id === m.commitment)?.label;

  return (
    <div className={`rounded-xl border border-line-soft bg-white p-4 transition-opacity ${removing ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-chip font-display text-[13px] font-bold text-gold-deep ring-1 ring-chip-line"
        >
          {initials(m.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold text-ink">{m.name}</span>
            {m.isFounder && <span className="chip">Founder</span>}
          </p>
          <p className="mt-0.5 text-[14px] text-ink-soft">{m.role || <span className="text-muted italic">Role not set</span>}</p>
          <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
            {m.equity !== null && <span>{m.equity}% equity</span>}
            {commitment && <span>{commitment}</span>}
            {m.email && <span className="truncate">{m.email}</span>}
            {m.linkedin && (
              <a href={m.linkedin} target="_blank" rel="noreferrer" className="font-semibold text-gold-deep hover:underline">
                LinkedIn
              </a>
            )}
          </p>
        </div>
      </div>

      {editable && (
        <div className="mt-3 flex items-center justify-end gap-2 border-t border-line-soft pt-3">
          {confirming ? (
            <>
              <span className="mr-auto text-[13px] text-ink-soft">Remove {m.name.split(" ")[0]}?</span>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="h-9 rounded-full px-4 text-[13px] font-semibold text-muted hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={removing}
                onClick={() =>
                  startRemove(async () => {
                    const r = await removeMember(m.id);
                    if (!r.ok) setError(r.message ?? "Couldn't remove this member.");
                  })
                }
                className="h-9 rounded-full bg-danger px-4 text-[13px] font-semibold text-white disabled:opacity-60"
              >
                {removing ? "Removing…" : "Remove"}
              </button>
            </>
          ) : (
            <>
              {canRemove && (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="h-9 rounded-full px-4 text-[13px] font-semibold text-muted transition-colors hover:text-danger"
                >
                  Remove
                </button>
              )}
              <button
                type="button"
                onClick={onEdit}
                className="h-9 rounded-full border border-line px-4 text-[13px] font-semibold text-ink transition-colors hover:border-gold"
              >
                Edit
              </button>
            </>
          )}
        </div>
      )}
      {error && <FormBanner className="mt-3">{error}</FormBanner>}
    </div>
  );
}

function MemberForm({ member, onDone }: { member: TeamMember | null; onDone: () => void }) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(async (prev, form) => {
    const result = await saveMember(member?.id ?? null, prev, form);
    if (result.ok) onDone();
    return result;
  }, {});
  const prefix = `member-${member?.id ?? "new"}`;
  const v = (name: string, saved: string | number | null | undefined) =>
    state.values?.[name] ?? (saved === null || saved === undefined ? "" : String(saved));
  const err = (name: string) => state.errors?.[name];

  return (
    <form
      action={formAction}
      noValidate
      aria-label={member ? `Edit ${member.name}` : "Add team member"}
      className="rounded-xl border border-gold/50 bg-cream/60 p-4 sm:p-5"
    >
      <p className="font-display text-[15px] font-bold text-ink">{member ? `Edit ${member.name}` : "New team member"}</p>
      {state.message && !state.ok && !state.errors && <FormBanner className="mt-3">{state.message}</FormBanner>}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <TextField idPrefix={prefix} name="name" label="Name" autoFocus defaultValue={v("name", member?.name)} error={err("name")} />
        <TextField idPrefix={prefix} name="role" label="Role" placeholder="CTO & co-founder" defaultValue={v("role", member?.role)} error={err("role")} />
        <TextField idPrefix={prefix} name="email" label="Email" type="email" inputMode="email" defaultValue={v("email", member?.email)} error={err("email")} />
        <TextField idPrefix={prefix} name="linkedin" label="LinkedIn" inputMode="url" defaultValue={v("linkedin", member?.linkedin)} error={err("linkedin")} />
        <TextField
          idPrefix={prefix}
          name="equity"
          label="Equity"
          inputMode="decimal"
          suffix="%"
          defaultValue={v("equity", member?.equity)}
          error={err("equity")}
        />
        <ChoiceCards
          idPrefix={prefix}
          name="commitment"
          label="Commitment"
          options={COMMITMENTS}
          columns="grid-cols-2"
          defaultValue={v("commitment", member?.commitment)}
          error={err("commitment")}
        />
        <label className="flex items-center gap-3 text-[14px] text-ink-soft sm:col-span-2">
          <input
            type="checkbox"
            name="isFounder"
            defaultChecked={state.values ? state.values.isFounder === "on" : (member?.isFounder ?? false)}
            className="field-check"
          />
          This person is a co-founder
        </label>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onDone}
          className="h-11 rounded-full px-5 text-[13px] font-semibold text-muted hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-full bg-gold-btn px-6 font-display text-[12px] font-bold tracking-[0.06em] text-gold-ink uppercase disabled:opacity-60"
        >
          {pending ? "Saving…" : member ? "Save member" : "Add member"}
        </button>
      </div>
    </form>
  );
}
