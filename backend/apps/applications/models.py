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


def slugify(name: str) -> str:
    """Same rule as the website's slugify(): "Café Nova!" → "cafe-nova"."""
    text = unicodedata.normalize("NFKD", name.lower())
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text[:70].strip("-") or "startup"


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
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)
    submitted_at = models.DateTimeField(null=True, blank=True)

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
        profile = rules.with_defaults(self.profile, rules.blank_profile(""))
        renamed = rules.HEARD_FROM_RENAMED.get(profile.get("heardFrom", ""))
        if renamed:
            profile["heardFrom"] = renamed
        return profile

    @property
    def startup_data(self) -> dict:
        return rules.with_defaults(self.startup, rules.blank_startup())

    @property
    def team_data(self) -> dict:
        team = rules.with_defaults(
            self.team, {"members": [], "workedTogether": "", "whyUs": "", "hiringNeeds": ""}
        )
        team["members"] = [
            rules.with_defaults(m, rules.blank_member()) | {"id": m.get("id")} for m in team["members"]
        ]
        return team

    def progress(self) -> dict:
        return rules.progress(self.profile_data, self.startup_data, self.team_data)

    def sync_columns(self) -> None:
        startup, profile = self.startup_data, self.profile_data
        self.startup_name = (startup.get("name") or "").strip()[:60]
        self.stage = startup.get("stage") or ""
        self.industry = startup.get("industry") or ""
        self.tagline = (startup.get("tagline") or "")[:120]
        self.founder_name = (profile.get("fullName") or "").strip()[:80]

    def save(self, *args, **kwargs):
        self.sync_columns()
        if kwargs.get("update_fields") is not None:
            kwargs["update_fields"] = {
                *kwargs["update_fields"],
                "startup_name",
                "stage",
                "industry",
                "tagline",
                "founder_name",
            }
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
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="+")
    body = models.TextField()
    at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["at"]

    def __str__(self):
        return self.body[:60]
