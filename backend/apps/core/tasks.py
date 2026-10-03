import base64
import logging
import smtplib
from email.mime.text import MIMEText

import requests
from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)


# A failed send is retried after 30 s, 1, 2, 4, 8 and 16 minutes: about 30 minutes in all.
# No jitter, which would pick a random wait below each of those and end it all in ~15 minutes.
@shared_task(
    autoretry_for=(smtplib.SMTPException, OSError),
    retry_backoff=30,
    retry_backoff_max=1800,
    retry_jitter=False,
    max_retries=6,
)
def deliver_email(payload: dict) -> None:
    message = EmailMultiAlternatives(
        subject=" ".join(payload["subject"].split()),  # also for messages queued by older code
        body=payload["text"],
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=payload["to"],
        reply_to=payload.get("reply_to") or None,
    )
    if payload.get("html"):
        message.attach_alternative(payload["html"], "text/html")
    for name, encoded, mimetype in payload.get("attachments", []):
        data = base64.b64decode(encoded)
        if mimetype.startswith("text/"):
            message.attach(_text_attachment(name, data, mimetype))
        else:
            message.attach(name, data, mimetype)
    message.send()
    logger.info("email sent: %s → %d recipient(s)", payload["subject"], len(payload["to"]))


def _text_attachment(name: str, data: bytes, mimetype: str) -> MIMEText:
    """A text attachment whose Content-Type keeps its parameters, e.g. a calendar invite's
    "text/calendar; method=PUBLISH; charset=utf-8" (Django's attach() would mangle them)."""
    base, _, params = mimetype.partition(";")
    subtype = base.strip().split("/", 1)[1]
    part = MIMEText(data.decode("utf-8"), subtype, "utf-8")
    for param in params.split(";"):
        key, _, value = param.strip().partition("=")
        if key and key.lower() != "charset":
            part.set_param(key, value.strip().strip('"'))
    part.add_header("Content-Disposition", "attachment", filename=name)
    return part


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
