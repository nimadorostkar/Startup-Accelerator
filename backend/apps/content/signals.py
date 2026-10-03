from functools import partial

from django.db import transaction
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone

from apps.core.signals import refresh_public_pages

from . import services
from .models import AgendaItem, Event, Post


@receiver([post_save, post_delete], sender=Event)
@receiver([post_save, post_delete], sender=AgendaItem)
def event_changed(sender, instance, raw=False, **kwargs):
    if sender is AgendaItem and not raw:
        # The agenda is part of the event's page: its `updated` (the sitemap's
        # lastmod) moves too. A queryset update, so no signal loops back here.
        Event.objects.filter(pk=instance.event_id).update(updated_at=timezone.now())
    services.invalidate()
    refresh_public_pages("events")


@receiver([post_save, post_delete], sender=Post)
def post_changed(sender, **kwargs):
    services.invalidate()
    refresh_public_pages("newsletter")


def _joining_detail(fmt: str, online_url: str, venue: str) -> str:
    """What the confirmation email promised to send later: the link online, the venue in person."""
    return online_url if fmt == "Online" else venue


@receiver(pre_save, sender=Event)
def remember_joining_details(sender, instance, raw=False, **kwargs):
    """Notes whether the event had its joining link/venue before this save (see below)."""
    if raw or instance.pk is None:
        instance._had_joining_detail = None
        return
    before = Event.objects.filter(pk=instance.pk).values("format", "online_url", "venue").first()
    instance._had_joining_detail = bool(
        before and _joining_detail(before["format"], before["online_url"], before["venue"])
    )


@receiver(post_save, sender=Event)
def send_joining_details_once_set(sender, instance, created=False, raw=False, **kwargs):
    """Guests who registered while the joining link (online) or venue (in person) was still blank
    were told "we'll email it before the event": email it once it's filled in."""
    had = getattr(instance, "_had_joining_detail", None)
    instance._had_joining_detail = None  # a second save of the same instance doesn't send again
    if raw or created or had is not False:
        return
    if not _joining_detail(instance.format, instance.online_url, instance.venue):
        return
    transaction.on_commit(partial(services.send_joining_details, instance.pk), robust=True)
