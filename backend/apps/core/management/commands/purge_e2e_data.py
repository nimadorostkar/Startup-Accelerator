"""Development only: removes everything the end-to-end suite (e2e/) created.

    python manage.py purge_e2e_data

The suite gives every account and form entry an @e2e.fundup.example address,
so nothing else is touched.
"""

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.accounts.models import User
from apps.content.models import ContactMessage, EventRegistration, Subscriber

DOMAIN = "@e2e.fundup.example"


class Command(BaseCommand):
    help = "Remove the end-to-end suite's test data (development only)."

    def add_arguments(self, parser):
        parser.add_argument("--force", action="store_true", help="Run even with DEBUG off.")

    @transaction.atomic
    def handle(self, *args, force=False, **options):
        if not settings.DEBUG and not force:
            raise CommandError("purge_e2e_data only runs with DJANGO_DEBUG=true (or --force).")
        counts = {
            "accounts": User.objects.filter(email__endswith=DOMAIN).delete()[1].get("accounts.User", 0),
            "registrations": EventRegistration.objects.filter(email__endswith=DOMAIN).delete()[0],
            "subscribers": Subscriber.objects.filter(email__endswith=DOMAIN).delete()[0],
            "messages": ContactMessage.objects.filter(email__endswith=DOMAIN).delete()[0],
        }
        self.stdout.write(", ".join(f"{n} {what}" for what, n in counts.items()) + " removed.")
