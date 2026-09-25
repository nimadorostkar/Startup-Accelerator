import "server-only";
import { updateJsonFile } from "./json-file";

/* ══════════════════════════════════════════════════════════════════════
   STORAGE SWAP POINT — newsletter subscribers.

   Saved to `.data/subscribers.json` for local development. Replace
   addSubscriber with your email provider's "add contact" call (or a
   database insert) before launch; nothing is emailed yet.
   ══════════════════════════════════════════════════════════════════════ */

export type Subscriber = { email: string; source: string; createdAt: string };

/** Returns false when the address is already on the list. */
export function addSubscriber(email: string, source: string) {
  const key = email.toLowerCase();
  return updateJsonFile<Subscriber[], boolean>("subscribers.json", [], (all) =>
    all.some((s) => s.email === key)
      ? { next: all, result: false }
      : {
          next: [
            ...all,
            { email: key, source, createdAt: new Date().toISOString() },
          ],
          result: true,
        },
  );
}
