import "server-only";
import { cache } from "react";
import { isPast, type SummitEvent } from "@/components/events/events";
import { api, BUILDING } from "./api";

/* ══════════════════════════════════════════════════════════════════════
   EVENTS — read from the API (backend/apps/content), managed in the back
   office. Cached for a minute and tagged "events"; an edit in the back
   office refreshes them straight away.

   Registrations are stored by the API, which also emails the guest a
   confirmation with the joining details and a calendar invite, and a
   reminder the day before. It refuses unknown, ended and full events.
   ══════════════════════════════════════════════════════════════════════ */

/** Every published event: upcoming soonest first, then past ones, most recent first. */
export const listEvents = cache(async (): Promise<SummitEvent[]> => {
  if (BUILDING) return [];
  const result = await api<{ events: SummitEvent[] }>("/events", { tags: ["events"] });
  if (!result.ok) throw new Error(`Couldn't load events (${result.status}).`);
  return result.data.events;
});

export async function upcomingEvents(now = Date.now()) {
  return (await listEvents())
    .filter((e) => !isPast(e, now))
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));
}

export async function pastEvents(now = Date.now()) {
  return (await listEvents())
    .filter((e) => isPast(e, now))
    .sort((a, b) => +new Date(b.start) - +new Date(a.start));
}

export const findEvent = cache(async (slug: string): Promise<SummitEvent | null> => {
  if (BUILDING) return null;
  const result = await api<{ event: SummitEvent }>(`/events/${encodeURIComponent(slug)}`, { tags: ["events"] });
  if (result.status === 404) return null;
  if (!result.ok) throw new Error(`Couldn't load the event (${result.status}).`);
  return result.data.event;
});

/** The next Demo Day, for the hero and /demo-day; undefined when none is scheduled. */
export async function nextDemoDay(): Promise<SummitEvent | undefined> {
  return (await upcomingEvents()).find((e) => e.type === "Demo Day");
}

export type RegistrationResult =
  | { ok: true; existing: boolean }
  | { ok: false; message?: string; errors?: Record<string, string> };

/** Registers a guest; `existing` when that email already signed up for the event. */
export async function addRegistration(input: {
  event: string;
  name: string;
  email: string;
  company: string;
}): Promise<RegistrationResult> {
  const { event, ...body } = input;
  const result = await api<{ existing: boolean }>(`/events/${encodeURIComponent(event)}/registrations`, {
    method: "POST",
    body,
  });
  if (result.ok) return { ok: true, existing: result.data.existing };
  return { ok: false, message: result.error.message, errors: result.error.errors };
}
