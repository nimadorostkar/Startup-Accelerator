/* Events: types and display helpers, safe to import anywhere. The events
   themselves come from the API (lib/events.ts) and are managed in the back
   office (/backoffice/ → Events). The launch set is loaded by
   `python manage.py seed_content`. Venues and joining links are only sent
   to registered guests, by email. */

import { LOCALE_INFO, type Locale } from "@/i18n/config";

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

/** The comma between a day and a time ("Oct 22, 5:00 PM"). */
const COMMA: Record<Locale, string> = { en: ", ", tr: ", ", fa: "، " };

/** Date parts in the event's own time zone, in the page's language (Persian
    gets the Persian calendar and digits). An event that ends on a later day
    (in that zone) shows both dates. */
export function eventDate(e: SummitEvent, locale: Locale = "en") {
  const timeZone = knownZone(e.tz);
  const intl = LOCALE_INFO[locale].intl;
  const start = new Date(e.start);
  const end = new Date(e.end);
  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(intl, { ...o, timeZone }).format(d);
  const time = (d: Date) => fmt(d, { hour: "numeric", minute: "2-digit" });
  const zone =
    new Intl.DateTimeFormat(intl, { timeZoneName: "short", timeZone })
      .formatToParts(start)
      .find((p) => p.type === "timeZoneName")?.value ?? "UTC";
  // Calendar-neutral, just to tell whether the dates differ.
  const ymd = (d: Date) =>
    d.toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", timeZone });
  const multiDay = ymd(start) !== ymd(end);
  const longDay = (d: Date, year = true) =>
    locale === "fa"
      ? // CLDR's Persian pattern puts the year first ("۱۴۰۵ مهر ۳۰, پنجشنبه"); people write "پنجشنبه ۳۰ مهر ۱۴۰۵".
        `${fmt(d, { weekday: "long" })} ${fmt(d, { day: "numeric", month: "long", ...(year && { year: "numeric" }) })}`
      : fmt(d, {
          weekday: "long",
          month: "long",
          day: "numeric",
          ...(year && { year: "numeric" }),
        });
  const shortDay = (d: Date) => fmt(d, { month: "short", day: "numeric" });
  const sameYear = fmt(start, { year: "numeric" }) === fmt(end, { year: "numeric" });
  const comma = COMMA[locale];
  const day = fmt(start, { day: "numeric" });
  const month = fmt(start, { month: "short" });
  const weekday = fmt(start, { weekday: "short" });
  return {
    day,
    month,
    weekday,
    /** Month and day, e.g. "Oct 22", "22 Eki", "۳۰ مهر". */
    monthDay: shortDay(start),
    /** Weekday, month and day, e.g. "Thu Oct 22". */
    dayLabel:
      locale === "en"
        ? `${weekday} ${month} ${day}`
        : fmt(start, { weekday: "long", month: "long", day: "numeric" }),
    long: multiDay
      ? `${longDay(start, !sameYear)} – ${longDay(end)}`
      : longDay(start),
    time: multiDay
      ? `${shortDay(start)}${comma}${time(start)} – ${shortDay(end)}${comma}${time(end)} ${zone}`
      : `${time(start)} – ${time(end)} ${zone}`,
    /** Start time only, e.g. "4:00 PM PDT" */
    start: `${time(start)} ${zone}`,
    /** The zone's short name, e.g. "PDT" ("UTC" for a zone we can't show). */
    zone,
  };
}

/** Prefilled "add to Google Calendar" link. `online` is the location shown
    for online events, in the page's language. */
export function googleCalendarUrl(e: SummitEvent, online = "Online (link sent by email)") {
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
    location: e.format === "Online" ? online : e.city,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
