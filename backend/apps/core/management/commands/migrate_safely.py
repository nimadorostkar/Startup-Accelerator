"""`migrate` under a Postgres advisory lock, so several API containers starting
at once (e.g. a scaled-out deploy) apply migrations one at a time."""

from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import connection

LOCK_ID = 7_310_255_001  # any constant shared by every container


class Command(BaseCommand):
    help = "Apply database migrations, one container at a time."

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute("SELECT pg_advisory_lock(%s)", [LOCK_ID])
            try:
                call_command("migrate", interactive=False, verbosity=options.get("verbosity", 1))
            finally:
                cursor.execute("SELECT pg_advisory_unlock(%s)", [LOCK_ID])
