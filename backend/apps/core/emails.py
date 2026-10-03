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
    text = render_to_string(f"emails/{template}.txt", ctx).strip()
    # The HTML shows the same text, escaped and never turned into links: names and messages
    # people typed must not become clickable in the team's inbox. The links that matter are
    # the layout's button (action_url) and its listed `links`.
    html = render_to_string("emails/layout.html", {**ctx, "body": text})
    return text + "\n", html


def one_line(subject: str) -> str:
    """A header can't hold a line break (Django refuses to send it), so subjects built from
    what people typed are flattened to one line."""
    return " ".join(str(subject).split())


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
    _queue(_payload(recipients, subject, text, html, reply_to, attachments))


def queue_individually(
    recipients: list[str],
    subject: str,
    template: str,
    context: dict | None = None,
    *,
    reply_to: list[str] | None = None,
) -> None:
    """One message per recipient, so reviewers never see each other's addresses."""
    recipients = sorted({r for r in recipients if r})
    if not recipients:
        return
    text, html = render(template, context or {})
    for recipient in recipients:
        _queue(_payload([recipient], subject, text, html, reply_to, None))


def _payload(recipients, subject, text, html, reply_to, attachments) -> dict:
    return {
        "to": recipients,
        "subject": one_line(subject),
        "text": text,
        "html": html,
        "reply_to": reply_to or [],
        "attachments": [
            (name, base64.b64encode(data.encode() if isinstance(data, str) else data).decode(), mimetype)
            for name, data, mimetype in (attachments or [])
        ],
    }


def _queue(payload: dict) -> None:
    from .tasks import deliver_email

    # robust: a broker outage is logged, it doesn't fail the request that already committed.
    transaction.on_commit(partial(deliver_email.delay, payload), robust=True)
