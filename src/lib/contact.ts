import "server-only";
import { api } from "./api";

/* ══════════════════════════════════════════════════════════════════════
   CONTACT FORM — messages are stored by the API (backend/apps/content),
   which emails them to the support team (SUPPORT_EMAILS) with the sender
   as reply-to. They're also listed in the back office (/backoffice/).
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
  name: string;
  email: string;
  company: string;
  topic: ContactTopic;
  message: string;
};

export type SendResult = { ok: true } | { ok: false; message?: string; errors?: Record<string, string> };

export async function saveContactMessage(input: ContactMessage): Promise<SendResult> {
  const result = await api("/contact", { method: "POST", body: input });
  return result.ok ? { ok: true } : { ok: false, message: result.error.message, errors: result.error.errors };
}
