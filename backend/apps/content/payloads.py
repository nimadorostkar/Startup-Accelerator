"""JSON shapes for the website: SummitEvent (src/components/events/events.ts)
and Post (src/components/newsletter/posts.ts)."""

from zoneinfo import ZoneInfo

from apps.core.utils import iso

from .models import Event, Post, split_lines, split_paragraphs


def local_iso(value, tz: str) -> str:
    """2026-10-22T16:00:00-07:00 — the time with the event's own offset."""
    return value.astimezone(ZoneInfo(tz)).isoformat(timespec="seconds")


def event(e: Event) -> dict:
    return {
        "slug": e.slug,
        "title": e.title,
        "type": e.type,
        "format": e.format,
        "city": e.city if e.format == "In person" else "Online",
        "start": local_iso(e.start, e.tz),
        "end": local_iso(e.end, e.tz),
        "tz": e.tz,
        "capacity": e.capacity,
        "summary": e.summary,
        "about": split_paragraphs(e.about),
        "takeaways": split_lines(e.takeaways),
        "agenda": [{"time": a.time, "item": a.item} for a in e.agenda.all()],
        "audience": e.audience,
        # Last edit, for the sitemap's <lastmod>.
        "updated": iso(e.updated_at),
    }


def post(p: Post, *, body: bool = False) -> dict:
    out = {
        "slug": p.slug,
        "issue": p.issue,
        "title": p.title,
        "excerpt": p.excerpt,
        "category": p.category,
        "author": p.author,
        "date": p.published_on.isoformat(),
        "minutes": p.read_minutes(),
        # Last edit, for the sitemap's <lastmod>.
        "updated": iso(p.updated_at),
    }
    if body:
        out["body"] = p.blocks()
    return out
