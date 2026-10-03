"""Development only: removes everything the end-to-end suite (e2e/) created.

    python manage.py purge_e2e_data [--rate-limits]

The suite gives every account and form entry an @e2e.fundup.example address,
so nothing else is touched. `--rate-limits` also resets every rate-limit
counter: in development every visitor of the website shares one address, so
whatever ran in the last hour (another test run, someone clicking around)
would otherwise leave the suite's sign-ups refused.
"""

from django.conf import settings
from django.core.cache import cache
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.accounts.models import User
from apps.content.models import ContactMessage, EventRegistration, Subscriber

DOMAIN = "@e2e.fundup.example"


class Command(BaseCommand):
    help = "Remove the end-to-end suite's test data (development only)."

    def add_arguments(self, parser):
        parser.add_argument("--force", action="store_true", help="Run even with DEBUG off.")
        parser.add_argument("--rate-limits", action="store_true", help="Also reset every rate-limit counter.")

    @transaction.atomic
    def handle(self, *args, force=False, rate_limits=False, **options):
        if not settings.DEBUG and not force:
            raise CommandError("purge_e2e_data only runs with DJANGO_DEBUG=true (or --force).")
        counts = {
            "accounts": User.objects.filter(email__endswith=DOMAIN).delete()[1].get("accounts.User", 0),
            "registrations": EventRegistration.objects.filter(email__endswith=DOMAIN).delete()[0],
            "subscribers": Subscriber.objects.filter(email__endswith=DOMAIN).delete()[0],
            "messages": ContactMessage.objects.filter(email__endswith=DOMAIN).delete()[0],
        }
        if rate_limits:
            counts["rate-limit counters"] = self.reset_rate_limits()
        self.stdout.write(", ".join(f"{n} {what}" for what, n in counts.items()) + " removed.")

    @staticmethod
    def reset_rate_limits() -> int:
        """Per-address limits (apps/core/throttles.py) and per-account ones (accounts/services.py)."""
        client = getattr(getattr(cache, "_cache", None), "get_client", None)
        if client is None:  # not Redis (tests): nothing shared to reset
            return 0
        redis = client(write=True)
        keys = [
            key
            for pattern in ("throttle_*", "login-fail:*", "reset-mail:*")
            for key in redis.scan_iter(cache.make_key(pattern))
        ]
        return redis.delete(*keys) if keys else 0
