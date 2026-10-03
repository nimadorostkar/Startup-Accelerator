from datetime import timedelta

from celery import shared_task
from django.db.models import Q
from django.utils import timezone

from .models import AuthSession, UserToken


@shared_task
def send_password_reset(email: str) -> None:
    from .services import email_password_reset

    email_password_reset(email)


@shared_task
def purge_expired() -> dict:
    """Daily: forget sessions and email tokens that can no longer be used."""
    cutoff = timezone.now() - timedelta(days=30)
    sessions, _ = AuthSession.objects.filter(Q(expires_at__lt=cutoff) | Q(revoked_at__lt=cutoff)).delete()
    tokens, _ = UserToken.objects.filter(expires_at__lt=timezone.now() - timedelta(days=7)).delete()
    return {"sessions": sessions, "tokens": tokens}
