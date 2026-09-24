"use client";

import { useId, useState, type ComponentProps } from "react";
import { EyeIcon, EyeOffIcon } from "../icons";

type Props = Omit<ComponentProps<"input">, "id" | "className"> & {
  label: string;
  name: string;
  error?: string;
  /** Sits opposite the label — used for "Forgot password?". */
  action?: React.ReactNode;
};

/* Labelled input with inline error text. `type="password"` gets a reveal
   toggle; the error is tied to the input with aria-describedby so screen
   readers announce it on focus. */
export default function Field({
  label,
  name,
  error,
  action,
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
          {...rest}
          id={id}
          name={name}
          type={isPassword && revealed ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`field-input ${isPassword ? "pr-12" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-[12px] text-muted transition-colors duration-200 hover:text-ink"
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
