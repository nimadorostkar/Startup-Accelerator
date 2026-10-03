from datetime import timedelta

from celery import shared_task
from django.conf import settings

from apps.core.emails import queue_individually
from apps.core.utils import now

from .models import Application
from .notifications import reviewer_emails


@shared_task
def send_overdue_digest() -> int:
    """Daily: tell reviewers which applications have waited past the review promise."""
    cutoff = now() - timedelta(days=settings.REVIEW_SLA_DAYS)
    overdue = list(
        Application.objects.filter(status="submitted", submitted_at__lte=cutoff)
        .order_by("submitted_at")
        .values("user_id", "startup_name", "founder_name", "submitted_at")[:50]
    )
    if not overdue:
        return 0
    at = now()
    items = [
        {
            "startup": row["startup_name"] or "Unnamed startup",
            "founder": row["founder_name"],
            "days": (at - row["submitted_at"]).days,
            "url": f"{settings.SITE_URL}/admin/applications/{row['user_id']}",
        }
        for row in overdue
    ]
    queue_individually(
        reviewer_emails(),
        f"{len(items)} application{'s' if len(items) != 1 else ''} waiting {settings.REVIEW_SLA_DAYS}+ days",
        "review_digest",
        {
            "items": items,
            "sla_days": settings.REVIEW_SLA_DAYS,
            "action_url": f"{settings.SITE_URL}/admin?status=submitted&sort=waiting",
            "action_label": "Open the review queue",
        },
    )
    return len(items)
