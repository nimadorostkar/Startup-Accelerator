"use client";

import { useState, type ReactNode } from "react";

/* Dashboard form controls. Each input's id is `${prefix}-${name}`, so the
   review checklist can deep-link to it (/dashboard/startup#field-problem). */

type Common = {
  name: string;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  /** Change when several forms share field names on one page. */
  idPrefix?: string;
  className?: string;
};

function Shell({
  id,
  label,
  required,
  hint,
  error,
  aside,
  className = "",
  children,
}: Omit<Common, "name" | "idPrefix"> & { id: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-display text-[13px] font-semibold text-ink">
          {label}
          {required && (
            <span className="ml-1 text-gold-deep" title="Required to submit">
              *<span className="sr-only"> (required to submit)</span>
            </span>
          )}
        </label>
        {aside}
      </div>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] leading-[1.5] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function a11y(id: string, error?: string, hint?: ReactNode) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  } as const;
}

export function TextField({
  name,
  label,
  required,
  hint,
  error,
  idPrefix = "field",
  className,
  prefix,
  suffix,
  ...input
}: Common &
  Omit<React.ComponentProps<"input">, "name" | "id" | "className" | "prefix"> & {
    /** Fixed text inside the box, e.g. "$" or "%". */
    prefix?: string;
    suffix?: string;
  }) {
  const id = `${idPrefix}-${name}`;
  return (
    <Shell id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[15px] text-muted">
            {prefix}
          </span>
        )}
        <input
          {...input}
          {...a11y(id, error, hint)}
          name={name}
          className={`field-input ${prefix ? "pl-8" : ""} ${suffix ? "pr-10" : ""}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[15px] text-muted">
            {suffix}
          </span>
        )}
      </div>
    </Shell>
  );
}

/** Textarea with a live counter; `min` shows how far a required answer has to go. */
export function TextArea({
  name,
  label,
  required,
  hint,
  error,
  idPrefix = "field",
  className,
  defaultValue = "",
  min,
  max,
  rows = 4,
  placeholder,
}: Common & {
  defaultValue?: string;
  min?: number;
  max: number;
  rows?: number;
  placeholder?: string;
}) {
  const id = `${idPrefix}-${name}`;
  const [length, setLength] = useState(defaultValue.trim().length);
  const short = min !== undefined && length > 0 && length < min;

  return (
    <Shell
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
      aside={
        <span
          aria-hidden="true"
          className={`text-[12px] tabular-nums ${
            length > max ? "text-danger" : short ? "text-gold-deep" : "text-muted"
          }`}
        >
          {short ? `${min - length} more to go` : `${length} / ${max}`}
        </span>
      }
    >
      <textarea
        {...a11y(id, error, hint)}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={(e) => setLength(e.target.value.trim().length)}
        className="field-input"
      />
    </Shell>
  );
}

export function SelectField({
  name,
  label,
  required,
  hint,
  error,
  idPrefix = "field",
  className,
  options,
  defaultValue = "",
  placeholder = "Select…",
}: Common & {
  options: readonly (string | { id: string; label: string })[];
  defaultValue?: string;
  placeholder?: string;
}) {
  const id = `${idPrefix}-${name}`;
  return (
    <Shell id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <select {...a11y(id, error, hint)} name={name} defaultValue={defaultValue} className="field-input">
        <option value="">{placeholder}</option>
        {options.map((o) => {
          const { id: value, label: text } = typeof o === "string" ? { id: o, label: o } : o;
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </Shell>
  );
}

/** Radio group drawn as tappable cards — used for stage and commitment. */
export function ChoiceCards({
  name,
  label,
  required,
  hint,
  error,
  idPrefix = "field",
  className,
  options,
  defaultValue = "",
  columns = "sm:grid-cols-3",
}: Common & {
  options: readonly { id: string; label: string; hint?: string }[];
  defaultValue?: string;
  columns?: string;
}) {
  const id = `${idPrefix}-${name}`;
  return (
    <fieldset
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      className={`field-choice scroll-mt-24 rounded-xl ${className ?? ""}`}
    >
      <legend className="font-display text-[13px] font-semibold text-ink">
        {label}
        {required && (
          <span className="ml-1 text-gold-deep" title="Required to submit">
            *<span className="sr-only"> (required to submit)</span>
          </span>
        )}
      </legend>
      <div className={`mt-2 grid gap-2.5 ${columns}`}>
        {options.map((o, i) => (
          <label
            key={o.id}
            className="group relative flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white p-3.5 transition-[border-color,background-color] duration-200 hover:border-ink/25 has-checked:border-gold has-checked:bg-chip has-disabled:cursor-not-allowed has-disabled:bg-cream"
          >
            <input
              type="radio"
              name={name}
              value={o.id}
              defaultChecked={defaultValue === o.id}
              className="field-check mt-0.5 shrink-0"
            />
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                {o.hint && (
                  <span className="font-display text-[11px] font-bold text-gold-deep tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
                {o.label}
              </span>
              {o.hint && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </fieldset>
  );
}

/** A titled block inside a long form. */
export function FormSection({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="card scroll-mt-28 p-5 sm:p-7">
      <h2 className="font-display text-[18px] font-bold tracking-[-0.01em] text-ink">{title}</h2>
      {description && <p className="mt-1 text-[14px] leading-[1.55] text-muted">{description}</p>}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}
