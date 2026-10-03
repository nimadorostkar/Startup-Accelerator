"""Transactional email: render now, deliver in the background once the
database transaction commits (so a rolled-back change never sends mail)."""

import base64
import logging
from functools import partial

from django.conf import settings
from django.db import transaction
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


def render(template: str, context: dict) -> tuple[str, str]:
    """Plain-text body from emails/<template>.txt, and the same text in the HTML layout."""
    ctx = {"site_url": settings.SITE_URL, **context}
    text = render_to_string(f"emails/{template}.txt", ctx).strip() + "\n"
    html = render_to_string("emails/layout.html", {**ctx, "body": text})
    return text, html


def queue_email(
    to: list[str] | str,
    subject: str,
    template: str,
    context: dict | None = None,
    *,
    reply_to: list[str] | None = None,
    attachments: list[tuple[str, str | bytes, str]] | None = None,
) -> None:
    recipients = [to] if isinstance(to, str) else [r for r in to if r]
    if not recipients:
        return
    text, html = render(template, context or {})
    payload = {
        "to": recipients,
        "subject": subject,
        "text": text,
        "html": html,
        "reply_to": reply_to or [],
        "attachments": [
            (name, base64.b64encode(data.encode() if isinstance(data, str) else data).decode(), mimetype)
            for name, data, mimetype in (attachments or [])
        ],
    }
    from .tasks import deliver_email

    # robust: a broker outage is logged, it doesn't fail the request that already committed.
    transaction.on_commit(partial(deliver_email.delay, payload), robust=True)


def queue_individually(
    recipients: list[str], subject: str, template: str, context: dict | None = None
) -> None:
    """One message per recipient, so reviewers never see each other's addresses."""
    for recipient in sorted(set(recipients)):
        queue_email(recipient, subject, template, context)
