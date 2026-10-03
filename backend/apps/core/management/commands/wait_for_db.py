"""Blocks until the database accepts connections (used by the container entrypoint)."""

import time

from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from django.db.utils import OperationalError


class Command(BaseCommand):
    help = "Wait for the database to be reachable."

    def add_arguments(self, parser):
        parser.add_argument("--timeout", type=int, default=60)

    def handle(self, *args, timeout=60, **options):
        deadline = time.monotonic() + timeout
        while True:
            try:
                connection.ensure_connection()
                self.stdout.write("Database is ready.")
                return
            except OperationalError:
                if time.monotonic() > deadline:
                    raise CommandError(f"Database not reachable after {timeout}s.") from None
                time.sleep(1)
