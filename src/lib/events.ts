import "server-only";
import { updateJsonFile } from "./json-file";

/* ══════════════════════════════════════════════════════════════════════
   STORAGE SWAP POINT — event registrations.

   Saved to `.data/registrations.json` for local development. Replace
   addRegistration with a database insert (plus a confirmation email and
   calendar invite) before launch; nothing is emailed yet.
   ══════════════════════════════════════════════════════════════════════ */

export type Registration = {
  event: string;
  name: string;
  email: string;
  company: string;
  createdAt: string;
};

/** Returns false when this email is already registered for the event. */
export function addRegistration(input: Omit<Registration, "createdAt">) {
  const email = input.email.toLowerCase();
  return updateJsonFile<Registration[], boolean>(
    "registrations.json",
    [],
    (all) =>
      all.some((r) => r.event === input.event && r.email === email)
        ? { next: all, result: false }
        : {
            next: [
              ...all,
              { ...input, email, createdAt: new Date().toISOString() },
            ],
            result: true,
          },
  );
}
