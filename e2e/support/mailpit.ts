import { expect } from "@playwright/test";
import { MAILPIT } from "./env";

/* Reads the emails the stack sent, from Mailpit's API. Every test uses its own
   addresses, so filtering by recipient never picks up another test's mail. */

export type Email = {
  id: string;
  subject: string;
  to: string[];
  replyTo: string[];
  text: string;
  html: string;
  attachments: { fileName: string; contentType: string }[];
};

type Summary = { ID: string; Subject: string; To: { Address: string }[] };

async function search(to: string): Promise<Summary[]> {
  const response = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}&limit=50`);
  if (!response.ok) throw new Error(`Mailpit search failed (${response.status})`);
  return ((await response.json()) as { messages: Summary[] }).messages;
}

async function read(id: string): Promise<Email> {
  const m = await (await fetch(`${MAILPIT}/api/v1/message/${id}`)).json();
  return {
    id,
    subject: m.Subject,
    to: (m.To ?? []).map((a: { Address: string }) => a.Address),
    replyTo: (m.ReplyTo ?? []).map((a: { Address: string }) => a.Address),
    text: m.Text,
    html: m.HTML,
    attachments: (m.Attachments ?? []).map((a: { FileName: string; ContentType: string }) => ({
      fileName: a.FileName,
      contentType: a.ContentType,
    })),
  };
}

/** Every email to this address whose subject contains `subject`, newest first. */
export async function emailsTo(to: string, subject = ""): Promise<Email[]> {
  const found = (await search(to)).filter((m) => m.Subject.includes(subject));
  return Promise.all(found.map((m) => read(m.ID)));
}

/** Waits (the worker sends in the background) for an email to this address. */
export async function waitForEmail(to: string, subject = "", timeout = 20_000): Promise<Email> {
  let found: Email[] = [];
  await expect
    .poll(
      async () => {
        found = await emailsTo(to, subject);
        return found.length;
      },
      { timeout, message: `an email to ${to} with "${subject}" in the subject` },
    )
    .toBeGreaterThan(0);
  return found[0];
}

/** The first link in the email's text that starts with `prefix` (e.g. a site path). */
export function linkIn(email: Email, contains: string): string {
  const link = email.text.match(/https?:\/\/\S+/g)?.find((url) => url.includes(contains));
  if (!link) throw new Error(`No link containing "${contains}" in "${email.subject}"`);
  return link;
}
