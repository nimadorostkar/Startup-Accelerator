import re
import zoneinfo
from functools import cache

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q
from django.db.models.functions import Lower
from django.utils import timezone

EVENT_TYPES = ["Demo Day", "Workshop", "Office Hours", "Networking", "Info Session"]
EVENT_FORMATS = ["In person", "Online"]
CATEGORIES = ["Fundraising", "Building", "AI", "Founder Stories", "Program News"]
CONTACT_TOPICS = [
    "Applying to the program",
    "Investing or partnerships",
    "Mentoring",
    "Press",
    "Something else",
]


# Region/City names only (plus UTC). zoneinfo also lists names such as "Factory",
# "localtime", "posixrules", "posix/…", "right/…" and "Etc/…", which the website's
# Intl.DateTimeFormat rejects (a RangeError that takes the events pages down).
TIMEZONE_NAME = re.compile(
    r"^(Africa|America|Antarctica|Arctic|Asia|Atlantic|Australia|Europe|Indian|Pacific)"
    r"/[A-Za-z0-9_+\-]+(/[A-Za-z0-9_+\-]+)?$"
)


@cache
def timezone_names() -> tuple[str, ...]:
    """Every time zone an event may use, sorted: UTC first, then Region/City names."""
    return ("UTC", *sorted(name for name in zoneinfo.available_timezones() if TIMEZONE_NAME.match(name)))


def validate_timezone(value: str) -> None:
    if value not in timezone_names():
        raise ValidationError(f"{value!r} isn't a time zone name, e.g. America/Los_Angeles or Europe/London.")


def split_paragraphs(text: str) -> list[str]:
    return [" ".join(p.split()) for p in re.split(r"\n\s*\n", text or "") if p.strip()]


# A list marker: "- " or "* " (with the space, so "-50% fees" keeps its minus), or "•".
BULLET = re.compile(r"^(?:[-*]\s+|•\s*)")


def split_lines(text: str) -> list[str]:
    """One item per line, without a leading list marker."""
    lines = (BULLET.sub("", line.strip()).strip() for line in (text or "").splitlines())
    return [line for line in lines if line]


HEADING = re.compile(r"^#{2,3}\s+(.*)$")
UNORDERED_ITEM = re.compile(r"^[-*]\s+(.*)$")
ORDERED_ITEM = re.compile(r"^\d{1,3}[.)]\s+(.*)$")
QUOTE_LINE = re.compile(r"^>\s?(.*)$")
# A quote's last line credits it only when it starts with a dash and a space ("— Name",
# "-- Name", "- Name"), so a quoted "-10% churn" stays part of the quote.
CITE = re.compile(r"^(?:—|–|--|-\s)\s*(.+)$")


def body_blocks(body: str) -> list[dict]:
    """A newsletter body as the article page's blocks: p, h2, list, quote.

    Read line by line, so a list or quote straight under a heading or a
    paragraph line (no blank line between) still becomes a list or quote.
    "## " and "### " both make a heading (the website has one heading style);
    "1. " lines make a list marked "ordered".
    """
    out: list[dict] = []
    for chunk in re.split(r"\n\s*\n", body or ""):
        current: dict | None = None  # the block the next line may continue
        for raw in chunk.splitlines():
            if not raw.strip():
                continue
            line = raw.strip()
            heading = HEADING.match(line)
            unordered = UNORDERED_ITEM.match(line)
            ordered = None if unordered else ORDERED_ITEM.match(line)
            quote = QUOTE_LINE.match(line)
            if heading:
                current = None
                if heading.group(1).strip():
                    out.append({"type": "h2", "text": heading.group(1).strip()})
            elif unordered or ordered:
                item = (unordered or ordered).group(1).strip()
                is_ordered = bool(ordered)
                if not (
                    current and current["type"] == "list" and current.get("ordered", False) == is_ordered
                ):
                    current = {"type": "list", "items": []}
                    if is_ordered:
                        current["ordered"] = True
                    out.append(current)
                current["items"].append(item)
            elif quote:
                if not (current and current["type"] == "quote"):
                    current = {"type": "quote", "lines": []}
                    out.append(current)
                if quote.group(1).strip():
                    current["lines"].append(quote.group(1).strip())
            elif current and current["type"] == "list" and raw[:1].isspace() and current["items"]:
                current["items"][-1] += " " + line  # an indented line continues the item above
            elif current and current["type"] == "p":
                current["text"] += " " + line
            else:
                current = {"type": "p", "text": line}
                out.append(current)
    blocks = []
    for block in out:
        if block["type"] == "quote":
            lines = block.pop("lines")
            cite = CITE.match(lines[-1]) if len(lines) > 1 else None
            if cite:
                lines = lines[:-1]
            if not lines:
                continue
            block["text"] = " ".join(lines)
            if cite:
                block["cite"] = cite.group(1).strip()
        elif block["type"] == "p":
            block["text"] = " ".join(block["text"].split())
        blocks.append(block)
    return blocks


class Event(models.Model):
    slug = models.SlugField(max_length=100, unique=True)
    title = models.CharField(max_length=160)
    type = models.CharField(max_length=20, choices=[(t, t) for t in EVENT_TYPES])
    format = models.CharField(max_length=20, choices=[(f, f) for f in EVENT_FORMATS], default="In person")
    city = models.CharField(max_length=80, help_text='City for in-person events; "Online" otherwise.')
    start = models.DateTimeField()
    end = models.DateTimeField()
    tz = models.CharField(
        "time zone",
        max_length=64,
        default="America/Los_Angeles",
        validators=[validate_timezone],
        help_text="Times are shown in this zone, e.g. America/Los_Angeles, Europe/London.",
    )
    capacity = models.PositiveIntegerField(default=100, validators=[MinValueValidator(1)])
    summary = models.TextField(max_length=400)
    about = models.TextField(help_text="Paragraphs, separated by a blank line.")
    takeaways = models.TextField("what you'll get", blank=True, help_text="One per line.")
    audience = models.CharField("who it's for", max_length=300, blank=True)
    # Private: only sent to registered guests, in the confirmation and reminder emails.
    venue = models.TextField(
        blank=True, help_text="Address for in-person events. Only sent to registered guests."
    )
    online_url = models.URLField(
        "joining link", blank=True, max_length=500, help_text="Online events. Only sent to registered guests."
    )
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start"]
        indexes = [models.Index(fields=["is_published", "end"])]
        constraints = [
            models.CheckConstraint(condition=Q(end__gt=models.F("start")), name="event_ends_after_start")
        ]

    def __str__(self):
        return self.title

    def clean(self):
        if self.start and self.end and self.end <= self.start:
            raise ValidationError({"end": "The event has to end after it starts."})

    @property
    def is_past(self) -> bool:
        return self.end < timezone.now()


class AgendaItem(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="agenda")
    time = models.CharField(max_length=20, help_text="As shown, e.g. 4:00 PM")
    item = models.CharField(max_length=200)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.time} {self.item}"


class EventRegistration(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="registrations")
    name = models.CharField(max_length=80)
    email = models.EmailField(max_length=254)
    company = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    reminded_at = models.DateTimeField(null=True, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [models.UniqueConstraint(fields=["event", "email"], name="one_registration_per_email")]

    def __str__(self):
        return f"{self.name} <{self.email}>"

    def save(self, *args, **kwargs):
        self.email = self.email.strip().lower()
        super().save(*args, **kwargs)


class Post(models.Model):
    """A newsletter issue ("The Founder Brief")."""

    slug = models.SlugField(max_length=120, unique=True)
    issue = models.PositiveIntegerField(unique=True)
    title = models.CharField(max_length=200)
    excerpt = models.TextField(max_length=400)
    category = models.CharField(max_length=20, choices=[(c, c) for c in CATEGORIES])
    author = models.CharField(max_length=120, default="Fundup Club Program Team")
    published_on = models.DateField(default=timezone.localdate)
    minutes = models.PositiveSmallIntegerField(
        "read time (minutes)", default=0, blank=True, help_text="Leave at 0 to estimate from the text."
    )
    body = models.TextField(
        help_text=(
            "Paragraphs separated by a blank line. A line starting with '## ' (or '### ') is a "
            "heading; lines starting with '- ' (or '1. ') make a list; lines starting with '> ' "
            "make a quote, and a last line '> — Name' credits it."
        )
    )
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_on", "-issue"]

    def __str__(self):
        return f"#{self.issue} {self.title}"

    def read_minutes(self) -> int:
        if self.minutes:
            return self.minutes
        return max(1, round(len(self.body.split()) / 220))

    def blocks(self) -> list[dict]:
        """The body as the article page's blocks: p, h2, list, quote."""
        return body_blocks(self.body)

    def save(self, *args, **kwargs):
        if self.minutes is None:  # the read-time box cleared in the back office
            self.minutes = 0
        super().save(*args, **kwargs)


class Subscriber(models.Model):
    email = models.EmailField(max_length=254)
    source = models.CharField(max_length=80, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [models.UniqueConstraint(Lower("email"), name="subscriber_email_ci_unique")]

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        self.email = self.email.strip().lower()
        super().save(*args, **kwargs)


class ContactMessage(models.Model):
    name = models.CharField(max_length=80)
    email = models.EmailField(max_length=254)
    company = models.CharField(max_length=120, blank=True)
    topic = models.CharField(max_length=40, choices=[(t, t) for t in CONTACT_TOPICS])
    message = models.TextField(max_length=2000)
    created_at = models.DateTimeField(default=timezone.now)
    handled_at = models.DateTimeField(null=True, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.topic} — {self.name}"


class SeedRecord(models.Model):
    """One row per one-off data load that has run on this database (e.g. "content"), so a
    start-up script that loads launch content does it once, never again after staff delete it."""

    name = models.CharField(max_length=40, unique=True)
    at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name} ({self.at:%Y-%m-%d})"
