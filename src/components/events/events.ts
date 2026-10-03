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
  /** Last edited (ISO datetime), for the sitemap. */
  updated?: string;
};

export function isPast(e: SummitEvent, now = Date.now()) {
  return new Date(e.end).getTime() < now;
}

/** The event's zone, or UTC when this runtime doesn't know it (Intl throws
    a RangeError for names like "Factory"), so a bad zone can't break a page. */
function knownZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

/** Date parts in the event's own time zone. An event that ends on a later
    day (in that zone) shows both dates. */
export function eventDate(e: SummitEvent) {
  const timeZone = knownZone(e.tz);
  const start = new Date(e.start);
  const end = new Date(e.end);
  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) =>
    d.toLocaleString("en-US", { ...o, timeZone });
  const time = (d: Date) => fmt(d, { hour: "numeric", minute: "2-digit" });
  const zone = fmt(start, { timeZoneName: "short" }).split(" ").pop();
  const ymd = (d: Date) =>
    fmt(d, { year: "numeric", month: "2-digit", day: "2-digit" });
  const multiDay = ymd(start) !== ymd(end);
  const longDay = (d: Date, year = true) =>
    fmt(d, {
      weekday: "long",
      month: "long",
      day: "numeric",
      ...(year && { year: "numeric" }),
    });
  const shortDay = (d: Date) => fmt(d, { month: "short", day: "numeric" });
  const sameYear = fmt(start, { year: "numeric" }) === fmt(end, { year: "numeric" });
  return {
    day: fmt(start, { day: "numeric" }),
    month: fmt(start, { month: "short" }),
    weekday: fmt(start, { weekday: "short" }),
    long: multiDay
      ? `${longDay(start, !sameYear)} – ${longDay(end)}`
      : longDay(start),
    time: multiDay
      ? `${shortDay(start)}, ${time(start)} – ${shortDay(end)}, ${time(end)} ${zone}`
      : `${time(start)} – ${time(end)} ${zone}`,
    /** Start time only, e.g. "4:00 PM PDT" */
    start: `${time(start)} ${zone}`,
    /** The zone's short name, e.g. "PDT" ("UTC" for a zone we can't show). */
    zone,
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
