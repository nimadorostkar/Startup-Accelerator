import base64
import logging
import smtplib

import requests
from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)


@shared_task(
    autoretry_for=(smtplib.SMTPException, OSError),
    retry_backoff=30,
    retry_backoff_max=1800,
    max_retries=6,
)
def deliver_email(payload: dict) -> None:
    message = EmailMultiAlternatives(
        subject=payload["subject"],
        body=payload["text"],
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=payload["to"],
        reply_to=payload.get("reply_to") or None,
    )
    if payload.get("html"):
        message.attach_alternative(payload["html"], "text/html")
    for name, encoded, mimetype in payload.get("attachments", []):
        message.attach(name, base64.b64decode(encoded), mimetype)
    message.send()
    logger.info("email sent: %s → %d recipient(s)", payload["subject"], len(payload["to"]))


@shared_task(autoretry_for=(requests.RequestException,), retry_backoff=5, max_retries=3)
def revalidate_frontend(tags: list[str]) -> None:
    """Ask the website to drop its cached copies of public data (see src/app/api/revalidate)."""
    if not settings.FRONTEND_INTERNAL_URL or not settings.REVALIDATE_SECRET:
        return
    response = requests.post(
        f"{settings.FRONTEND_INTERNAL_URL}/api/revalidate",
        json={"tags": tags},
        headers={"Authorization": f"Bearer {settings.REVALIDATE_SECRET}"},
        timeout=5,
    )
    response.raise_for_status()
