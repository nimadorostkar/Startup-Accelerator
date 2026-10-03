"use client";

import { useId, useState, type ComponentProps } from "react";
import { EyeIcon, EyeOffIcon } from "../icons";

type Props = Omit<ComponentProps<"input">, "id" | "className"> & {
  label: string;
  name: string;
  error?: string;
  /** Sits opposite the label — used for "Forgot password?". */
  action?: React.ReactNode;
  /** The password reveal toggle's names, in the page's language. */
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
};

/* Labelled input with inline error text. `type="password"` gets a reveal
   toggle (at the end of the field: the left on right-to-left pages); the
   error is tied to the input with aria-describedby so screen readers announce
   it on focus. Email addresses are always written left to right, so an email
   field is too, kept against the label's side on right-to-left pages. */
export default function Field({
  label,
  name,
  error,
  action,
  showPasswordLabel = "Show password",
  hidePasswordLabel = "Hide password",
  type = "text",
  ...rest
}: Props) {
  const id = useId();
  const errorId = `${id}-error`;
  const isPassword = type === "password";
  const [revealed, setRevealed] = useState(false);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="font-display text-[13px] font-semibold text-ink"
        >
          {label}
        </label>
        {action}
      </div>

      <div className="relative mt-2">
        <input
          dir={type === "email" ? "ltr" : undefined}
          {...rest}
          id={id}
          name={name}
          type={isPassword && revealed ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`field-input ${isPassword ? "pe-12" : ""} ${type === "email" ? "rtl:text-right" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? hidePasswordLabel : showPasswordLabel}
            aria-pressed={revealed}
            className="absolute inset-y-0 end-0 flex w-12 items-center justify-center rounded-e-[12px] text-muted transition-colors duration-200 hover:text-ink"
          >
            {revealed ? (
              <EyeOffIcon className="h-[18px] w-[18px]" />
            ) : (
              <EyeIcon className="h-[18px] w-[18px]" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
