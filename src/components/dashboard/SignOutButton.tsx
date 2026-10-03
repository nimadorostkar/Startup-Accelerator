"use client";

import { useFormStatus } from "react-dom";
import { LogOutIcon } from "./icons";

/* The submit button inside a sign-out <form action={signOut}>: disabled with
   "Signing out…" while the session is ended, so a second press does nothing. */
export default function SignOutButton({ className, withLabel = false }: { className: string; withLabel?: boolean }) {
  const { pending } = useFormStatus();
  const label = pending ? "Signing out…" : "Sign out";
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={withLabel ? undefined : label}
      title={withLabel ? undefined : label}
      className={`${className} disabled:opacity-60`}
    >
      <LogOutIcon className="h-[18px] w-[18px]" />
      {withLabel && label}
    </button>
  );
}
