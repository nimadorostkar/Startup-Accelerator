import copy
import re
import unicodedata
import uuid

from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone

from . import rules


class Status(models.TextChoices):
    DRAFT = "draft", "Draft"
    SUBMITTED = "submitted", "Submitted"
    IN_REVIEW = "in_review", "In review"
    CHANGES_REQUESTED = "changes_requested", "Changes requested"
    ACCEPTED = "accepted", "Accepted"
    DECLINED = "declined", "Not selected"


# Latin letters NFKD doesn't split into a base letter and an accent.
ASCII_LETTERS = str.maketrans(
    {"ß": "ss", "æ": "ae", "œ": "oe", "ø": "o", "ł": "l", "đ": "d", "ð": "d", "þ": "th", "ı": "i"}
)


def slugify(name: str, key=None) -> str:
    """Same rule as the website's slugify(): "Café Nova!" → "cafe-nova", "Straße" → "strasse".

    A name with nothing left in ASCII ("Ёлка", "東京") becomes "startup-" plus the
    first 8 hex digits of `key` (the application's id), or plain "startup" without one.
    """
    text = unicodedata.normalize("NFKD", (name or "").lower().translate(ASCII_LETTERS))
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    text = text[:70].strip("-")
    if text:
        return text
    if key is None:
        return "startup"
    return f"startup-{str(key).replace('-', '').lower()[:8]}"


def _profile(section: dict | None) -> dict:
    profile = rules.with_defaults(section, rules.blank_profile(""))
    renamed = rules.HEARD_FROM_RENAMED.get(profile.get("heardFrom", ""))
    if renamed:
        profile["heardFrom"] = renamed
    return profile


def _startup(section: dict | None) -> dict:
    return rules.with_defaults(section, rules.blank_startup())


def _team(section: dict | None) -> dict:
    team = rules.with_defaults(section, {"members": [], "workedTogether": "", "whyUs": "", "hiringNeeds": ""})
    team["members"] = [
        rules.with_defaults(m, rules.blank_member()) | {"id": m.get("id")} for m in team["members"]
    ]
    return team


class Application(models.Model):
    """One founder's application, keyed by their user id.

    The profile, startup and team answers are JSON: they are always read and
    written as whole sections and the questions change over time. The few
    values the review queue filters and sorts on are copied into columns on
    every save (startup_name, stage, industry, founder_*, team_score).
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True, related_name="application"
    )
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.DRAFT)
    profile = models.JSONField(default=dict)
    startup = models.JSONField(default=dict)
    team = models.JSONField(default=dict)
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_applications",
    )
    # Public directory address (/startups/<slug>), fixed when the application is first submitted.
    slug = models.SlugField(max_length=80, unique=True, null=True, blank=True)
    # The startup name the slug was made for: a resubmission makes a new slug only if the
    # name changed since, so an address fixed in the back office stays.
    slug_source = models.CharField(max_length=60, blank=True, default="")
    # The answers as last submitted ({"profile", "startup", "team"}): what the public
    # directory shows, so a founder's edits while changes are requested stay private
    # until they resubmit. Refreshed on every save outside the editable statuses.
    public_snapshot = models.JSONField(default=dict, blank=True)
    # The startup's logo and the applicant's photo, shown in the public directory.
    # Always WebP files made by images.process(), never the upload as it arrived.
    logo = models.FileField(upload_to="startups", blank=True, default="", max_length=120)
    photo = models.FileField(upload_to="founders", blank=True, default="", max_length=120)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)
    # The latest submission: the review queue's waiting time.
    submitted_at = models.DateTimeField(null=True, blank=True)
    # The first submission, never reset: the public "Applied" date and directory order.
    first_submitted_at = models.DateTimeField(null=True, blank=True)

    # Copies for the review queue (filters, search and sorting in SQL).
    startup_name = models.CharField(max_length=60, blank=True, default="")
    stage = models.CharField(max_length=16, blank=True, default="")
    industry = models.CharField(max_length=40, blank=True, default="")
    founder_name = models.CharField(max_length=80, blank=True, default="")
    tagline = models.CharField(max_length=120, blank=True, default="")
    team_score = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["status", "submitted_at"], name="applications_queue"),
            models.Index(fields=["status", "updated_at"], name="applications_recent"),
            models.Index(fields=["assignee", "status"], name="applications_assignee"),
        ]
        constraints = [
            models.CheckConstraint(condition=Q(status__in=rules.STATUSES), name="applications_status_valid"),
        ]

    def __str__(self):
        return self.startup_name or f"Unnamed startup ({self.founder_name or self.user_id})"

    @property
    def editable(self) -> bool:
        return self.status in rules.EDITABLE

    @property
    def profile_data(self) -> dict:
        return _profile(self.profile)

    @property
    def startup_data(self) -> dict:
        return _startup(self.startup)

    @property
    def team_data(self) -> dict:
        return _team(self.team)

    def public_sections(self) -> tuple[dict, dict, dict]:
        """(profile, startup, team) as last submitted, for the public directory."""
        snapshot = self.public_snapshot or {}
        if not snapshot:  # never submitted since snapshots began: the answers as they are
            return self.profile_data, self.startup_data, self.team_data
        return (
            _profile(snapshot.get("profile")),
            _startup(snapshot.get("startup")),
            _team(snapshot.get("team")),
        )

    def take_public_snapshot(self) -> None:
        sections = {"profile": self.profile, "startup": self.startup, "team": self.team}
        self.public_snapshot = copy.deepcopy(sections)

    def progress(self) -> dict:
        return rules.progress(self.profile_data, self.startup_data, self.team_data)

    def sync_columns(self) -> None:
        startup, profile = self.startup_data, self.profile_data
        self.startup_name = (startup.get("name") or "").strip()[:60]
        self.stage = startup.get("stage") or ""
        self.industry = startup.get("industry") or ""
        self.tagline = (startup.get("tagline") or "")[:120]
        self.founder_name = (profile.get("fullName") or "").strip()[:80]

    # Copies of answers kept in columns (see sync_columns); always saved with the rest.
    SYNCED_COLUMNS = frozenset({"startup_name", "stage", "industry", "tagline", "founder_name"})

    def save(self, *args, **kwargs):
        self.sync_columns()
        extra = set(self.SYNCED_COLUMNS)
        update_fields = kwargs.get("update_fields")
        sections_saved = update_fields is None or bool({"profile", "startup", "team"} & set(update_fields))
        # Outside draft and "changes requested" the founder can't edit, so the answers as
        # saved are the submitted ones. In those two statuses the snapshot keeps the last
        # submission (decision A: the public sees it until the founder resubmits).
        if self.status not in rules.EDITABLE and sections_saved:
            self.take_public_snapshot()
            extra.add("public_snapshot")
        if self.submitted_at is not None and self.first_submitted_at is None:
            self.first_submitted_at = self.submitted_at
            extra.add("first_submitted_at")
        if update_fields is not None:
            kwargs["update_fields"] = {*update_fields, *extra}
        super().save(*args, **kwargs)


class ApplicationEvent(models.Model):
    """The activity timeline founders see. `actor` is for audit only and never shown to founders."""

    class By(models.TextChoices):
        FOUNDER = "founder", "Founder"
        SUPPORT = "support", "Review team"

    class Kind(models.TextChoices):
        CREATED = "created", "Created"
        SUBMITTED = "submitted", "Submitted"
        WITHDRAWN = "withdrawn", "Withdrawn"
        STATUS = "status", "Status change"
        NOTE = "note", "Note"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="events")
    at = models.DateTimeField(default=timezone.now)
    by = models.CharField(max_length=16, choices=By.choices)
    kind = models.CharField(max_length=16, choices=Kind.choices)
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True, default="")
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )

    class Meta:
        ordering = ["at"]
        indexes = [models.Index(fields=["application", "at"], name="application_events_by_app")]

    def __str__(self):
        return self.title


class Scorecard(models.Model):
    """One reviewer's assessment; each reviewer keeps exactly one per application."""

    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="scorecards")
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="scorecards"
    )
    problem = models.PositiveSmallIntegerField(null=True, blank=True)
    solution = models.PositiveSmallIntegerField(null=True, blank=True)
    market = models.PositiveSmallIntegerField(null=True, blank=True)
    team = models.PositiveSmallIntegerField(null=True, blank=True)
    traction = models.PositiveSmallIntegerField(null=True, blank=True)
    recommendation = models.CharField(
        max_length=16, blank=True, default="", choices=[(r, r.title()) for r in rules.RECOMMENDATIONS]
    )
    summary = models.TextField(blank=True, default="")
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["updated_at"]
        constraints = [
            models.UniqueConstraint(fields=["application", "reviewer"], name="one_scorecard_per_reviewer"),
            *[
                models.CheckConstraint(
                    condition=Q(**{f"{area}__isnull": True}) | Q(**{f"{area}__gte": 1, f"{area}__lte": 5}),
                    name=f"scorecard_{area}_1_to_5",
                )
                for area in rules.SCORE_AREAS
            ],
        ]

    def __str__(self):
        return f"Scorecard by {self.reviewer_id}"

    def scores(self) -> dict:
        return {area: getattr(self, area) for area in rules.SCORE_AREAS if getattr(self, area) is not None}

    def average(self) -> float | None:
        values = list(self.scores().values())
        return sum(values) / len(values) if values else None


class InternalNote(models.Model):
    """Reviewers only."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="notes")
    # Kept when the reviewer's account is deleted (shown as "Former reviewer").
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    body = models.TextField()
    at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["at"]

    def __str__(self):
        return self.body[:60]
