from datetime import timedelta

from celery import shared_task
from django.conf import settings

from apps.core.emails import queue_individually
from apps.core.utils import now

from .models import Application
from .notifications import reviewer_emails

# The email lists the longest-waiting applications; the subject counts them all.
DIGEST_LIST_LIMIT = 50


@shared_task
def send_overdue_digest() -> int:
    """Daily: tell reviewers which applications have waited past the review promise."""
    cutoff = now() - timedelta(days=settings.REVIEW_SLA_DAYS)
    waiting = Application.objects.filter(status="submitted", submitted_at__lte=cutoff)
    total = waiting.count()
    if not total:
        return 0
    overdue = list(
        waiting.order_by("submitted_at").values("user_id", "startup_name", "founder_name", "submitted_at")[
            :DIGEST_LIST_LIMIT
        ]
    )
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
        f"{total} application{'s' if total != 1 else ''} waiting {settings.REVIEW_SLA_DAYS}+ days",
        "review_digest",
        {
            "items": items,
            "more": total - len(items),
            # Explicit links in the HTML version (the layout never turns text into links).
            "links": [{"label": item["startup"], "url": item["url"]} for item in items],
            "sla_days": settings.REVIEW_SLA_DAYS,
            "action_url": f"{settings.SITE_URL}/admin?status=submitted&sort=waiting",
            "action_label": "Open the review queue",
        },
    )
    return total
