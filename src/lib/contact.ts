import "server-only";
import { randomUUID } from "node:crypto";
import { updateJsonFile } from "./json-file";

/* ══════════════════════════════════════════════════════════════════════
   STORAGE SWAP POINT — contact form messages.

   Saved to `.data/messages.json` for local development. Replace
   saveContactMessage with a database insert and/or an email to the team
   before launch; nothing here notifies anyone.
   ══════════════════════════════════════════════════════════════════════ */

export const CONTACT_TOPICS = [
  "Applying to the program",
  "Investing or partnerships",
  "Mentoring",
  "Press",
  "Something else",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  company: string;
  topic: ContactTopic;
  message: string;
  createdAt: string;
};

export function saveContactMessage(
  input: Omit<ContactMessage, "id" | "createdAt">,
): Promise<ContactMessage> {
  return updateJsonFile<ContactMessage[], ContactMessage>(
    "messages.json",
    [],
    (all) => {
      const saved = {
        ...input,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
      };
      return { next: [...all, saved], result: saved };
    },
  );
}
