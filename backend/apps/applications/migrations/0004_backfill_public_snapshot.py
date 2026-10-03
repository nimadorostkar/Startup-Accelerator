"""Fills the columns added in 0003 for existing applications:

- public_snapshot: the answers as they are now, for every application the public
  directory shows (the submitted version isn't stored anywhere else, so for one
  whose changes are requested this is its current draft).
- first_submitted_at: the earliest "submitted" timeline entry, else submitted_at.
- slug_source: the current startup name, for every application with an address,
  so a resubmission keeps the address it has (including one fixed in the back office).
"""

from django.db import migrations
from django.db.models import Min

PUBLIC_VISIBLE = ["accepted", "in_review", "changes_requested", "submitted", "declined"]


def forwards(apps, schema_editor):
    Application = apps.get_model("applications", "Application")
    ApplicationEvent = apps.get_model("applications", "ApplicationEvent")
    first_events = dict(
        ApplicationEvent.objects.filter(kind="submitted")
        .values_list("application_id")
        .annotate(first=Min("at"))
        .values_list("application_id", "first")
    )
    for app in Application.objects.all().iterator(chunk_size=200):
        fields = []
        if app.status in PUBLIC_VISIBLE and not app.public_snapshot:
            app.public_snapshot = {"profile": app.profile, "startup": app.startup, "team": app.team}
            fields.append("public_snapshot")
        if app.first_submitted_at is None:
            first = first_events.get(app.pk) or app.submitted_at
            if first is not None:
                app.first_submitted_at = first
                fields.append("first_submitted_at")
        if app.slug and not app.slug_source:
            app.slug_source = app.startup_name
            fields.append("slug_source")
        if fields:
            app.save(update_fields=fields)


class Migration(migrations.Migration):
    dependencies = [("applications", "0003_public_snapshot_first_submitted_slug_source")]

    operations = [migrations.RunPython(forwards, migrations.RunPython.noop)]
