import re
import zoneinfo

from django.core.exceptions import ValidationError
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


def validate_timezone(value: str) -> None:
    if value not in zoneinfo.available_timezones():
        raise ValidationError(f"{value!r} isn't a time zone name, e.g. America/Los_Angeles or Europe/London.")


def split_paragraphs(text: str) -> list[str]:
    return [" ".join(p.split()) for p in re.split(r"\n\s*\n", text or "") if p.strip()]


def split_lines(text: str) -> list[str]:
    return [line.strip().lstrip("-•* ").strip() for line in (text or "").splitlines() if line.strip()]


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
    capacity = models.PositiveIntegerField(default=100)
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
            "Paragraphs separated by a blank line. A line starting with '## ' is a heading; "
            "lines starting with '- ' make a list; lines starting with '> ' make a quote, "
            "and a last line '> — Name' credits it."
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
        out = []
        for chunk in re.split(r"\n\s*\n", self.body or ""):
            lines = [line.rstrip() for line in chunk.strip().splitlines() if line.strip()]
            if not lines:
                continue
            if lines[0].startswith("## "):
                out.append({"type": "h2", "text": lines[0][3:].strip()})
                rest = " ".join(line.strip() for line in lines[1:])
                if rest:
                    out.append({"type": "p", "text": rest})
            elif all(line.lstrip().startswith(("- ", "* ")) for line in lines):
                out.append({"type": "list", "items": [line.lstrip()[2:].strip() for line in lines]})
            elif all(line.lstrip().startswith(">") for line in lines):
                quoted = [line.lstrip()[1:].strip() for line in lines]
                cite = None
                if len(quoted) > 1 and re.match(r"^(—|--|-)\s*", quoted[-1]):
                    cite = re.sub(r"^(—|--|-)\s*", "", quoted.pop())
                block = {"type": "quote", "text": " ".join(quoted)}
                if cite:
                    block["cite"] = cite
                out.append(block)
            else:
                out.append({"type": "p", "text": " ".join(line.strip() for line in lines)})
        return out


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
