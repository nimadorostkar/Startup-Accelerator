"""Events, the newsletter and the contact form.

Each public form has the same hidden `website` field as the website's
forms: people never see it, most bots fill it in. When it's filled in we
answer as if it worked and store nothing.
"""

import logging
from datetime import timedelta
from zoneinfo import ZoneInfo

from django.conf import settings
from django.core import signing
from django.core.cache import cache
from django.db import IntegrityError, transaction
from django.db.models import F, Prefetch
from django.utils import timezone

from apps.core.emails import queue_email, queue_individually
from apps.core.exceptions import ApiError, Conflict, Invalid, NotFound
from apps.core.utils import now
from apps.core.validation import (
    Fields,
    check_email,
    check_name,
    check_single_line,
    max_length,
    text_length,
)

from . import ics, payloads
from .models import CONTACT_TOPICS, AgendaItem, ContactMessage, Event, EventRegistration, Post, Subscriber

logger = logging.getLogger(__name__)

VERSION_KEY = "content:version"
TTL = 300
UNSUBSCRIBE_SALT = "newsletter-unsubscribe"


def _version() -> int:
    return cache.get_or_set(VERSION_KEY, 1, None)


def _bump() -> None:
    try:
        cache.incr(VERSION_KEY)
    except ValueError:
        cache.set(VERSION_KEY, 2, None)


def invalidate() -> None:
    # After the commit: a read in between would otherwise cache the old data under the new version.
    transaction.on_commit(_bump, robust=True)


def _is_bot(f: Fields) -> bool:
    return bool(f.text("website"))


# ---------------------------------------------------------------- events


def _published_events():
    return Event.objects.filter(is_published=True).prefetch_related(
        Prefetch("agenda", queryset=AgendaItem.objects.order_by("order", "id"))
    )


def list_events(when: str = "all") -> list[dict]:
    key = f"content:{_version()}:events"
    rows = cache.get(key)
    if rows is None:
        rows = [(e.start.timestamp(), e.end.timestamp(), payloads.event(e)) for e in _published_events()]
        cache.set(key, rows, TTL)
    at = now().timestamp()
    # An event moves from upcoming to past once its end time passes.
    upcoming = sorted((r for r in rows if r[1] >= at), key=lambda r: r[0])
    past = sorted((r for r in rows if r[1] < at), key=lambda r: -r[0])
    chosen = {"upcoming": upcoming, "past": past}.get(when, upcoming + past)
    return [r[2] for r in chosen]


def find_event(slug: str) -> dict | None:
    if not isinstance(slug, str) or len(slug) > 100:
        return None
    key = f"content:{_version()}:event:{slug}"
    found = cache.get(key)
    if found is None:
        event = _published_events().filter(slug=slug).first()
        if event is None:
            return None  # misses aren't cached: made-up addresses would fill the cache
        found = payloads.event(event)
        cache.set(key, found, TTL)
    return found


def _joining_details(event: Event) -> str:
    if event.format == "Online":
        return event.online_url or "We'll email the joining link before the event."
    return event.venue or f"{event.city}. We'll email the exact venue before the event."


# Guests who sign up at least this long before the start get a reminder (see send_reminders).
REMINDER_LEAD = timedelta(hours=24)


def _zone_label(moment) -> str:
    """ "PST", "BST"; zones without a common abbreviation (tzdata prints "-03") get "UTC−03:00"."""
    name = moment.tzname() or ""
    if name and name[0] not in "+-":
        return name
    minutes = int(moment.utcoffset().total_seconds() // 60)
    if not minutes:
        return "UTC"
    sign, minutes = ("+" if minutes > 0 else "\u2212"), abs(minutes)
    return f"UTC{sign}{minutes // 60:02d}:{minutes % 60:02d}"


def _day(moment) -> str:
    return f"{moment:%A, %B} {moment.day}, {moment.year}"


def _time(moment) -> str:
    return f"{moment:%-I:%M %p}"


def event_when(event: Event) -> str:
    """ "Tuesday, December 1, 2026 · 9:00 AM – 10:00 AM PST", in the event's own time zone,
    naming the end date too when the event runs past midnight."""
    tz = ZoneInfo(event.tz)
    start, end = event.start.astimezone(tz), event.end.astimezone(tz)
    start_zone, end_zone = _zone_label(start), _zone_label(end)
    if start.date() == end.date():
        if start_zone == end_zone:
            return f"{_day(start)} · {_time(start)} – {_time(end)} {start_zone}"
        return f"{_day(start)} · {_time(start)} {start_zone} – {_time(end)} {end_zone}"
    if start_zone == end_zone:
        return f"{_day(start)}, {_time(start)} – {_day(end)}, {_time(end)} {start_zone}"
    return f"{_day(start)}, {_time(start)} {start_zone} – {_day(end)}, {_time(end)} {end_zone}"


def _event_email_context(event: Event, name: str) -> dict:
    url = f"{settings.SITE_URL}/events/{event.slug}"
    context = {
        "name": name.split(" ")[0],
        "title": event.title,
        "when": event_when(event),
        "where": _joining_details(event),
        "online": event.format == "Online",
        "action_url": url,
        "action_label": "Event details",
    }
    if event.format == "Online" and event.online_url:
        # Explicit links in the HTML version (the layout never turns text into links).
        context["links"] = [{"label": "Join the event online", "url": event.online_url}]
    return context


def register_for_event(slug: str, data: dict, *, ip: str | None = None) -> tuple[bool, dict]:
    """Returns (created, payload). Refuses unknown, ended and full events."""
    f = Fields(data)
    event = Event.objects.filter(slug=slug, is_published=True).first() if isinstance(slug, str) else None
    if event is None:
        raise NotFound("We couldn't find that event.")
    if event.is_past:
        raise Conflict("Registration for this event has closed.")

    name, email, company = f.text("name"), f.text("email").lower(), f.text("company")
    if _is_bot(f):
        return True, {"existing": False, "name": name, "email": email}
    f.error("name", check_name(name))
    f.error("email", check_email(email))
    f.error("company", check_single_line(company) or max_length(company, 120))
    if f.errors:
        raise Invalid(f.errors)

    with transaction.atomic():
        # One registration at a time per event, so the last seat can't be sold twice.
        locked = Event.objects.select_for_update().get(pk=event.pk)
        if EventRegistration.objects.filter(event=event, email=email).exists():
            return False, {"existing": True, "name": name, "email": email}
        if EventRegistration.objects.filter(event=event).count() >= locked.capacity:
            raise Conflict("This event is full. Follow the newsletter to hear about the next one.")
        try:
            with transaction.atomic():
                registration = EventRegistration.objects.create(
                    event=event, name=name, email=email, company=company, ip=ip or None
                )
        except IntegrityError:
            return False, {"existing": True, "name": name, "email": email}

        context = {
            **_event_email_context(event, name),
            # Only promised to guests the reminder job will actually remind.
            "reminder": event.start - registration.created_at >= REMINDER_LEAD,
        }
        queue_email(
            email,
            f"You're registered: {event.title}",
            "event_registration",
            context,
            attachments=[("invite.ics", _invite(event, registration), ICS_MIMETYPE)],
        )
    return True, {"existing": False, "name": name, "email": email}


ICS_MIMETYPE = "text/calendar; method=PUBLISH; charset=utf-8"


def _invite(event: Event, registration: EventRegistration) -> str:
    online = event.format == "Online"
    page = f"{settings.SITE_URL}/events/{event.slug}"
    description = event.summary
    if online and event.online_url:
        description += f"\n\nJoin online: {event.online_url}"
    elif not online and event.venue:
        description += f"\n\nWhere: {event.venue}"
    description += f"\n\nEvent details: {page}"
    return ics.invite(
        event,
        uid=f"{event.slug}-{registration.pk}",
        # Never the "We'll email…" sentence: the venue, else the city (or "Online").
        location="Online" if online else (event.venue or event.city),
        description=description,
    )


def send_joining_details(event_id: int) -> int:
    """The joining link (online) or venue (in person) that the confirmation promised, to every
    guest, once it's set on an upcoming published event. Called after the change commits."""
    event = Event.objects.filter(pk=event_id, is_published=True).first()
    if event is None or event.is_past or not (event.online_url if event.format == "Online" else event.venue):
        return 0
    sent = 0
    for registration in event.registrations.order_by("created_at"):
        queue_email(
            registration.email,
            f"{'Joining link' if event.format == 'Online' else 'Venue'}: {event.title}",
            "event_joining_details",
            _event_email_context(event, registration.name),
        )
        sent += 1
    return sent


def send_reminders() -> int:
    """Day-before reminders, once per guest, for guests who signed up more than a day ahead."""
    at = now()
    due = (
        EventRegistration.objects.select_related("event")
        .filter(
            reminded_at__isnull=True,
            event__is_published=True,
            event__start__gt=at,
            event__start__lte=at + REMINDER_LEAD,
            # Guests who signed up within a day of the start just had their
            # confirmation. Filtered here, not in the loop, so they can't fill
            # the batch and crowd out guests of later events.
            created_at__lte=F("event__start") - REMINDER_LEAD,
        )
        .order_by("event__start")[:500]
    )
    sent = 0
    for registration in due:
        event = registration.event
        with transaction.atomic():
            updated = EventRegistration.objects.filter(pk=registration.pk, reminded_at__isnull=True).update(
                reminded_at=at
            )
            if updated:
                day = _relative_day(event, at)
                queue_email(
                    registration.email,
                    f"{day[0].upper()}{day[1:]}: {event.title}",
                    "event_reminder",
                    {**_event_email_context(event, registration.name), "day": day},
                )
                sent += 1
    return sent


def _relative_day(event: Event, at) -> str:
    """ "today" or "tomorrow", as a guest in the event's time zone would say it at `at`."""
    tz = ZoneInfo(event.tz)
    start, today = event.start.astimezone(tz).date(), at.astimezone(tz).date()
    if start == today:
        return "today"
    if start == today + timedelta(days=1):
        return "tomorrow"
    return f"coming up on {_day(event.start.astimezone(tz))}"


# ---------------------------------------------------------------- newsletter


# An issue dated in the future is scheduled: it appears on its date (in the server's time
# zone). The cache holds every published issue with its date and the date is checked on each
# read, so a scheduled issue shows up the moment its day starts, whatever is cached.


def _today() -> str:
    return timezone.localdate(now()).isoformat()


def list_posts() -> list[dict]:
    key = f"content:{_version()}:posts"
    posts = cache.get(key)
    if posts is None:
        posts = [payloads.post(p) for p in Post.objects.filter(is_published=True)]
        cache.set(key, posts, TTL)
    today = _today()
    return [p for p in posts if p["date"] <= today]


def find_post(slug: str) -> dict | None:
    if not isinstance(slug, str) or len(slug) > 120:
        return None
    key = f"content:{_version()}:post:{slug}"
    found = cache.get(key)
    if found is None:
        post = Post.objects.filter(is_published=True, slug=slug).first()
        if post is None:
            return None  # misses aren't cached: made-up addresses would fill the cache
        found = payloads.post(post, body=True)
        cache.set(key, found, TTL)
    return found if found["date"] <= _today() else None


def unsubscribe_url(subscriber: Subscriber) -> str:
    """A signed link naming the subscriber by id, so the address itself never appears in a URL."""
    token = signing.dumps(subscriber.pk, salt=UNSUBSCRIBE_SALT)
    return f"{settings.SITE_URL}/newsletter/unsubscribe?token={token}"


def subscribe(data: dict, *, ip: str | None = None) -> str:
    """ "new" on first sign-up (or coming back), "existing" if already on the list."""
    f = Fields(data)
    email = f.text("email").lower()
    if _is_bot(f):
        return "new"
    f.error("email", check_email(email))
    if f.errors:
        raise Invalid(f.errors, message=f.errors["email"])
    source = (f.text("source") or "newsletter")[:80]

    with transaction.atomic():
        current = Subscriber.objects.select_for_update().filter(email=email).first()
        if current and current.unsubscribed_at is None:
            return "existing"
        if current:
            current.unsubscribed_at = None
            current.source = source
            current.save(update_fields=["unsubscribed_at", "source"])
        else:
            try:
                with transaction.atomic():
                    current = Subscriber.objects.create(email=email, source=source, ip=ip or None)
            except IntegrityError:
                return "existing"
        queue_email(
            email,
            "Welcome to The Founder Brief",
            "newsletter_welcome",
            {
                "unsubscribe_url": unsubscribe_url(current),
                "action_url": f"{settings.SITE_URL}/newsletter",
                "action_label": "Read the latest issue",
            },
        )
    return "new"


def unsubscribe(data: dict) -> str:
    token = data.get("token") if isinstance(data, dict) else None
    try:
        subscriber_id = signing.loads(token if isinstance(token, str) else "", salt=UNSUBSCRIBE_SALT)
        subscriber = Subscriber.objects.get(pk=subscriber_id)
    except (signing.BadSignature, Subscriber.DoesNotExist, TypeError, ValueError):
        raise ApiError(
            "This unsubscribe link isn't valid. Use the link in your latest email.", status_code=400
        ) from None
    if subscriber.unsubscribed_at is None:
        subscriber.unsubscribed_at = now()
        subscriber.save(update_fields=["unsubscribed_at"])
    return subscriber.email


# ---------------------------------------------------------------- contact


def send_contact_message(data: dict, *, ip: str | None = None, user_agent: str = "") -> dict:
    f = Fields(data)
    name, email, company = f.text("name"), f.text("email"), f.text("company")
    topic, message = f.text("topic"), f.text("message")
    if _is_bot(f):
        return {"name": name, "email": email}
    f.error("name", check_name(name))
    f.error("email", check_email(email))
    f.error("company", check_single_line(company) or max_length(company, 120))
    if topic not in CONTACT_TOPICS:
        f.error("topic", "Choose what this is about.")
    if not message:
        f.error("message", "Write a short message.")
    elif text_length(message) < 10:
        f.error("message", "Tell us a little more (at least 10 characters).")
    else:
        f.error("message", max_length(message, 2000))
    if f.errors:
        raise Invalid(f.errors)

    saved = ContactMessage.objects.create(
        name=name,
        email=email,
        company=company,
        topic=topic,
        message=message,
        ip=ip or None,
        user_agent=user_agent,
    )
    from apps.applications.notifications import reviewer_emails

    subject = f"[Contact] {topic} — {name}"
    context = {
        "name": name,
        "email": email,
        "company": company,
        "topic": topic,
        "message": message,
        "action_url": f"{settings.SITE_URL}/backoffice/content/contactmessage/{saved.pk}/change/",
        "action_label": "Open in the back office",
    }
    if settings.SUPPORT_EMAILS:
        queue_email(settings.SUPPORT_EMAILS, subject, "contact_message", context, reply_to=[email])
    else:
        # No support inbox: each reviewer gets their own copy, so nobody sees the others' addresses.
        queue_individually(reviewer_emails(), subject, "contact_message", context, reply_to=[email])
    return {"name": name, "email": email}
