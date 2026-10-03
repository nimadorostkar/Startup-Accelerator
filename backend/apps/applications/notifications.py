"""Emails about applications (docs/backend-integration.md → Notifications)."""

from django.conf import settings

from apps.accounts.models import User
from apps.core.emails import queue_email, queue_individually

from .models import Application

DECISION_EMAILS = {
    "start_review": (
        "Your Fundup Club application is being reviewed",
        "Good news: the review team has started on {startup}. They're validating the idea and "
        "looking at the market, and they'll be in touch through your dashboard.",
    ),
    "request_changes": (
        "The Fundup Club review team needs a bit more",
        "The review team read {startup} and needs a bit more detail before they can decide. "
        "Update your application and submit it again from your dashboard.",
    ),
    "accept": (
        "You're in: welcome to the Fundup Club cohort",
        "Congratulations! {startup} has been accepted into the cohort. Watch your inbox for "
        "onboarding details over the next few days.",
    ),
    "decline": (
        "An update on your Fundup Club application",
        "Thank you for applying with {startup}. This cohort wasn't the right fit, but you're welcome "
        "to apply again next cycle, and we'd love to see how far you've come.",
    ),
    "reopen": (
        "Your Fundup Club application is back in review",
        "The review team has reopened the review of {startup}. We'll be in touch through your dashboard.",
    ),
}


def reviewer_emails() -> list[str]:
    return list(
        User.objects.filter(
            role=User.Role.REVIEWER, is_active=True, email_verified_at__isnull=False
        ).values_list("email", flat=True)
    )


def _first_name(app: Application) -> str:
    name = app.profile_data["fullName"] or app.user.name
    return name.split(" ")[0] if name else "there"


def _startup(app: Application) -> str:
    return app.startup_name or "your startup"


def application_submitted(app: Application, *, resubmitted: bool) -> None:
    queue_email(
        app.user.email,
        "We have your updated application" if resubmitted else "We have your Fundup Club application",
        "application_submitted",
        {
            "name": _first_name(app),
            "startup": _startup(app),
            "resubmitted": resubmitted,
            "sla_days": settings.REVIEW_SLA_DAYS,
            "action_url": f"{settings.SITE_URL}/dashboard/review",
            "action_label": "View your application",
        },
    )
    queue_individually(
        reviewer_emails(),
        f"{'Resubmitted' if resubmitted else 'New application'}: {app.startup_name or 'Unnamed startup'}",
        "review_new",
        {
            "startup": app.startup_name or "Unnamed startup",
            "tagline": app.tagline,
            "founder": app.founder_name,
            "resubmitted": resubmitted,
            "action_url": f"{settings.SITE_URL}/admin/applications/{app.user_id}",
            "action_label": "Open in the review panel",
        },
    )


def decision_made(app: Application, decision: str, message: str) -> None:
    subject, intro = DECISION_EMAILS[decision]
    queue_email(
        app.user.email,
        subject,
        "decision",
        {
            "name": _first_name(app),
            "intro": intro.format(startup=_startup(app)),
            "message": message,
            "action_url": f"{settings.SITE_URL}/dashboard",
            "action_label": "Open your dashboard",
        },
        # Founders reply to decisions; the sender is usually a no-reply address.
        reply_to=settings.SUPPORT_EMAILS[:1] or None,
    )
