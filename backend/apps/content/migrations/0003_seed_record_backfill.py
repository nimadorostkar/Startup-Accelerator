"""Marks the launch content as already loaded on databases that have had any.

entrypoint.sh runs `seed_content --if-empty` on every start; from now on it loads
only when no "content" SeedRecord exists. A database that has events or posts, or
had them (staff deleted every placeholder: the id sequences have moved), gets the
record, so the placeholders don't come back.
"""

from django.db import migrations


def _sequence_used(schema_editor, table: str) -> bool:
    if schema_editor.connection.vendor != "postgresql":
        return False
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("SELECT pg_get_serial_sequence(%s, 'id')", [table])
        sequence = cursor.fetchone()[0]
        if not sequence:
            return False
        cursor.execute(f"SELECT is_called FROM {sequence}")  # noqa: S608 — a name from Postgres itself
        return bool(cursor.fetchone()[0])


def forwards(apps, schema_editor):
    Event = apps.get_model("content", "Event")
    Post = apps.get_model("content", "Post")
    SeedRecord = apps.get_model("content", "SeedRecord")
    had_content = (
        Event.objects.exists()
        or Post.objects.exists()
        or _sequence_used(schema_editor, Event._meta.db_table)
        or _sequence_used(schema_editor, Post._meta.db_table)
    )
    if had_content:
        SeedRecord.objects.get_or_create(name="content")


class Migration(migrations.Migration):
    dependencies = [("content", "0002_seed_record_capacity_min")]

    operations = [migrations.RunPython(forwards, migrations.RunPython.noop)]
