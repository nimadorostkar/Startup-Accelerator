"""The public startup directory: every submitted application, never drafts.

The list is cached (it's read on the landing page and /startups) and the
cache is dropped whenever a public application changes.
"""

from django.core.cache import cache
from django.db.models import F

from apps.core.signals import refresh_public_pages

from . import payloads, rules

VERSION_KEY = "directory:version"
TTL = 300


def _version() -> int:
    return cache.get_or_set(VERSION_KEY, 1, None)


def invalidate() -> None:
    try:
        cache.incr(VERSION_KEY)
    except ValueError:
        cache.set(VERSION_KEY, 2, None)
    refresh_public_pages("startups")


def public_queryset():
    return (
        payloads.founder_queryset()
        .filter(status__in=rules.PUBLIC_VISIBLE, slug__isnull=False)
        .exclude(startup_name="")
        .order_by(F("submitted_at").desc(nulls_last=True), "created_at")
    )


def list_cards() -> list[dict]:
    key = f"directory:{_version()}:cards"
    cards = cache.get(key)
    if cards is None:
        cards = [payloads.public_card(app) for app in public_queryset()]
        cache.set(key, cards, TTL)
    return cards


def find(slug: str) -> dict | None:
    if not isinstance(slug, str) or len(slug) > 80:
        return None
    key = f"directory:{_version()}:startup:{slug}"
    found = cache.get(key)
    if found is None:
        app = public_queryset().filter(slug=slug).first()
        found = payloads.public_startup(app) if app else {}
        cache.set(key, found, TTL)
    return found or None
