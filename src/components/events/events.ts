/* Events: types and display helpers, safe to import anywhere. The events
   themselves come from the API (lib/events.ts) and are managed in the back
   office (/backoffice/ → Events). The launch set is loaded by
   `python manage.py seed_content`. Venues and joining links are only sent
   to registered guests, by email. */

export const EVENT_TYPES = [
  "Demo Day",
  "Workshop",
  "Office Hours",
  "Networking",
  "Info Session",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export type SummitEvent = {
  slug: string;
  title: string;
  type: EventType;
  format: "In person" | "Online";
  /** City for in-person events; "Online" otherwise. */
  city: string;
  /** Start and end with the local offset, e.g. 2026-10-22T17:00:00-07:00 */
  start: string;
  end: string;
  /** IANA zone the times are shown in. */
  tz: string;
  capacity: number;
  summary: string;
  about: string[];
  takeaways: string[];
  agenda: { time: string; item: string }[];
  audience: string;
};

export function isPast(e: SummitEvent, now = Date.now()) {
  return new Date(e.end).getTime() < now;
}

/** Date parts in the event's own time zone. */
export function eventDate(e: SummitEvent) {
  const d = new Date(e.start);
  const part = (o: Intl.DateTimeFormatOptions) =>
    d.toLocaleString("en-US", { ...o, timeZone: e.tz });
  const time = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: e.tz,
    });
  const zone = d
    .toLocaleString("en-US", { timeZone: e.tz, timeZoneName: "short" })
    .split(" ")
    .pop();
  return {
    day: part({ day: "numeric" }),
    month: part({ month: "short" }),
    weekday: part({ weekday: "short" }),
    long: part({
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    time: `${time(e.start)} – ${time(e.end)} ${zone}`,
    /** Start time only, e.g. "4:00 PM PDT" */
    start: `${time(e.start)} ${zone}`,
  };
}

/** Prefilled "add to Google Calendar" link. */
export function googleCalendarUrl(e: SummitEvent) {
  const stamp = (iso: string) =>
    new Date(iso)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${stamp(e.start)}/${stamp(e.end)}`,
    details: e.summary,
    location: e.format === "Online" ? "Online (link sent by email)" : e.city,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
