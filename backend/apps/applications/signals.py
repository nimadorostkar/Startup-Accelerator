from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from . import directory, rules
from .models import Application


@receiver(post_save, sender=Application)
def application_saved(sender, instance: Application, **kwargs):
    # Drafts aren't public, so saving one changes nothing in the directory.
    # (Withdrawing — public to draft — invalidates in services.withdraw.)
    if instance.status in rules.PUBLIC_VISIBLE:
        directory.invalidate()


@receiver(post_delete, sender=Application)
def application_deleted(sender, instance: Application, **kwargs):
    directory.invalidate()
