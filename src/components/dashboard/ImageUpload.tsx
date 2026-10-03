"use client";

import { useRef, useState, useTransition } from "react";
import { removeImage, uploadImage, type SaveState } from "@/app/dashboard/actions";
import SignInAgain from "../auth/SignInAgain";
import Monogram, { FounderDot } from "../startups/Monogram";

/* The startup's logo (on Startup details) or the founder's photo (on Your
   profile). Picking a file uploads it straight away: it isn't part of the
   section's form, so it never waits for "Save" and a refused save can't lose it.
   The API checks, resizes and re-encodes the image; the checks here only save a
   wasted upload. Both images are public once the application is submitted. */

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/webp"];

const COPY = {
  logo: {
    title: "Logo",
    hint: "Shown on your public startup page and in the directory. Square works best.",
    add: "Upload logo",
    change: "Change logo",
  },
  photo: {
    title: "Your photo",
    hint: "A clear picture of your face, shown next to your name on your public startup page.",
    add: "Upload photo",
    change: "Change photo",
  },
} as const;

export default function ImageUpload({
  kind,
  current,
  name,
  editable,
}: {
  kind: "logo" | "photo";
  /** Address of the stored image, or "". */
  current: string;
  /** The startup's or founder's name, for the initials shown until there is an image. */
  name: string;
  editable: boolean;
}) {
  const copy = COPY[kind];
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<SaveState>({});
  const [pending, start] = useTransition();

  function upload(file: File | undefined) {
    if (!file) return;
    if (!TYPES.includes(file.type)) return setState({ ok: false, message: "Use a PNG, JPEG or WebP image." });
    if (file.size > MAX_BYTES) return setState({ ok: false, message: "Keep the image under 5 MB." });
    const form = new FormData();
    form.set("file", file);
    start(async () => setState(await uploadImage(kind, form)));
  }

  return (
    <section aria-labelledby={`${kind}-title`} className="card mb-5 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
      {kind === "logo" ? (
        <Monogram name={name || "?"} logo={current} className="h-20 w-20 rounded-[20px] text-[26px]" />
      ) : (
        <FounderDot name={name || "?"} photo={current} className="h-20 w-20 text-[24px]" />
      )}
      <div className="min-w-0 flex-1">
        <h2 id={`${kind}-title`} className="font-display text-[16px] font-bold text-ink">
          {copy.title} <span className="text-[13px] font-medium text-muted">(optional)</span>
        </h2>
        <p className="mt-1 text-[13px] leading-[1.5] text-muted">{copy.hint} PNG, JPEG or WebP, up to 5 MB.</p>
        <p
          role={state.ok === false ? "alert" : "status"}
          className={`mt-1.5 min-h-[20px] text-[13px] font-medium ${state.ok === false ? "text-danger" : "text-green-deep"}`}
        >
          {pending ? <span className="text-muted">Uploading…</span> : (state.errors?.file ?? state.message)}
          {!pending && <SignInAgain href={state.signInHref} />}
        </p>
      </div>
      {editable && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <input
            ref={input}
            type="file"
            accept={TYPES.join(",")}
            hidden // the button below is the control; this only holds the file picker
            disabled={pending}
            onChange={(e) => {
              upload(e.target.files?.[0]);
              e.target.value = ""; // so picking the same file again uploads it again
            }}
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => input.current?.click()}
            className="h-10 rounded-full bg-ink px-5 font-display text-[12px] font-bold tracking-[0.06em] text-white uppercase transition-[filter] hover:brightness-125 disabled:opacity-60"
          >
            {current ? copy.change : copy.add}
          </button>
          {current && (
            <button
              type="button"
              disabled={pending}
              onClick={() => start(async () => setState(await removeImage(kind)))}
              className="h-10 rounded-full border border-line bg-white px-4 text-[13px] font-semibold text-ink-soft transition-colors hover:border-danger hover:text-danger disabled:opacity-60"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </section>
  );
}
