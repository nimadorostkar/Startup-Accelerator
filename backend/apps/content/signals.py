from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.core.signals import refresh_public_pages

from . import services
from .models import AgendaItem, Event, Post


@receiver([post_save, post_delete], sender=Event)
@receiver([post_save, post_delete], sender=AgendaItem)
def event_changed(sender, **kwargs):
    services.invalidate()
    refresh_public_pages("events")


@receiver([post_save, post_delete], sender=Post)
def post_changed(sender, **kwargs):
    services.invalidate()
    refresh_public_pages("newsletter")
