"""Events, the newsletter and the contact form.

Each public form has the same hidden `website` field as the website's
forms: people never see it, most bots fill it in. When it's filled in we
answer as if it worked and store nothing.
"""

import logging
from zoneinfo import ZoneInfo

from django.conf import settings
from django.core import signing
from django.core.cache import cache
from django.db import IntegrityError, transaction
from django.db.models import Prefetch

from apps.core.emails import queue_email
from apps.core.exceptions import ApiError, Conflict, Invalid, NotFound
from apps.core.utils import now
from apps.core.validation import Fields, check_email, check_name, max_length, text_length

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
        found = payloads.event(event) if event else {}
        cache.set(key, found, TTL)
    return found or None


def _joining_details(event: Event) -> str:
    if event.format == "Online":
        return event.online_url or "We'll email the joining link before the event."
    return event.venue or f"{event.city}. We'll email the exact venue before the event."


def _event_email_context(event: Event, name: str) -> dict:
    tz = ZoneInfo(event.tz)
    start, end = event.start.astimezone(tz), event.end.astimezone(tz)
    return {
        "name": name.split(" ")[0],
        "title": event.title,
        "when": f"{start:%A, %B} {start.day}, {start.year} · {start:%-I:%M %p} – {end:%-I:%M %p} {start:%Z}",
        "where": _joining_details(event),
        "online": event.format == "Online",
        "action_url": f"{settings.SITE_URL}/events/{event.slug}",
        "action_label": "Event details",
    }


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
    f.error("company", max_length(company, 120))
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

        context = _event_email_context(event, name)
        invite = ics.invite(
            event,
            uid=f"{event.slug}-{registration.pk}",
            location=context["where"] if event.format == "In person" else "Online",
            description=f"{event.summary}\n\n{context['action_url']}",
        )
        queue_email(
            email,
            f"You're registered: {event.title}",
            "event_registration",
            context,
            attachments=[("invite.ics", invite, "text/calendar")],
        )
    return True, {"existing": False, "name": name, "email": email}


def send_reminders() -> int:
    """Day-before reminders, once per guest, for guests who signed up more than a day ahead."""
    from datetime import timedelta

    at = now()
    due = (
        EventRegistration.objects.select_related("event")
        .filter(
            reminded_at__isnull=True,
            event__is_published=True,
            event__start__gt=at,
            event__start__lte=at + timedelta(hours=24),
        )
        .order_by("event__start")[:500]
    )
    sent = 0
    for registration in due:
        event = registration.event
        if event.start - registration.created_at < timedelta(hours=24):
            continue  # their confirmation was recent enough
        with transaction.atomic():
            updated = EventRegistration.objects.filter(pk=registration.pk, reminded_at__isnull=True).update(
                reminded_at=at
            )
            if updated:
                queue_email(
                    registration.email,
                    f"Tomorrow: {event.title}",
                    "event_reminder",
                    _event_email_context(event, registration.name),
                )
                sent += 1
    return sent


# ---------------------------------------------------------------- newsletter


def list_posts() -> list[dict]:
    key = f"content:{_version()}:posts"
    posts = cache.get(key)
    if posts is None:
        posts = [payloads.post(p) for p in Post.objects.filter(is_published=True)]
        cache.set(key, posts, TTL)
    return posts


def find_post(slug: str) -> dict | None:
    if not isinstance(slug, str) or len(slug) > 120:
        return None
    key = f"content:{_version()}:post:{slug}"
    found = cache.get(key)
    if found is None:
        post = Post.objects.filter(is_published=True, slug=slug).first()
        found = payloads.post(post, body=True) if post else {}
        cache.set(key, found, TTL)
    return found or None


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
    f.error("company", max_length(company, 120))
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

    team = settings.SUPPORT_EMAILS or reviewer_emails()
    queue_email(
        team,
        f"[Contact] {topic} — {name}",
        "contact_message",
        {
            "name": name,
            "email": email,
            "company": company,
            "topic": topic,
            "message": message,
            "action_url": f"{settings.SITE_URL}/backoffice/content/contactmessage/{saved.pk}/change/",
            "action_label": "Open in the back office",
        },
        reply_to=[email],
    )
    return {"name": name, "email": email}
