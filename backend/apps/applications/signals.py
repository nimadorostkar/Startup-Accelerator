from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from . import directory, images, rules
from .models import Application, Scorecard

# Columns the public directory never shows. Saving only these (plus the synced
# copies, which can't change unless an answer section is saved too) leaves it as it is.
REVIEW_ONLY = {"assignee", "team_score", "updated_at"} | Application.SYNCED_COLUMNS


@receiver(post_save, sender=Application)
def application_saved(sender, instance: Application, update_fields=None, **kwargs):
    # Drafts aren't public, so saving one changes nothing in the directory.
    # (Withdrawing — public to draft — invalidates in services.withdraw.)
    if update_fields is not None and set(update_fields) <= REVIEW_ONLY:
        return  # an assignment, a scorecard or a note: nothing public changed
    if instance.status in rules.PUBLIC_VISIBLE:
        directory.invalidate()


@receiver(post_delete, sender=Application)
def application_deleted(sender, instance: Application, **kwargs):
    directory.invalidate()
    images.discard(instance.logo.name)
    images.discard(instance.photo.name)


@receiver(post_delete, sender=Scorecard)
def scorecard_deleted(sender, instance: Scorecard, **kwargs):
    # A scorecard goes when its reviewer's account is deleted (or in the back
    # office): keep the queue's stored team score, and its "Top score" sort, true.
    from .services import team_average

    Application.objects.filter(pk=instance.application_id).update(
        team_score=team_average(instance.application_id)
    )
