"""Development only: sign-ins to try the site with.

    python manage.py seed_dev_accounts

    founder@example.com   / fundup-dev-2026   a founder (the dashboard)
    reviewer@example.com  / fundup-dev-2026   a verified reviewer (the review panel at /admin)
    admin@example.com     / fundup-dev-2026   a back-office superuser (/backoffice/), also a reviewer

Refuses to run unless DJANGO_DEBUG is on, so these can never exist in production.
"""

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from apps.accounts.models import User

PASSWORD = "fundup-dev-2026"
ACCOUNTS = [
    ("founder@example.com", "Maya Rosen", User.Role.FOUNDER, False),
    ("reviewer@example.com", "Alex Rivera", User.Role.REVIEWER, False),
    ("admin@example.com", "Back Office Admin", User.Role.REVIEWER, True),
]


class Command(BaseCommand):
    help = "Create a test founder, reviewer and back-office admin (development only)."

    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError("seed_dev_accounts only runs with DJANGO_DEBUG=true.")
        for email, name, role, superuser in ACCOUNTS:
            user, created = User.objects.get_or_create(
                email=email, defaults={"name": name, "role": role, "email_verified_at": timezone.now()}
            )
            user.role = role
            user.is_staff = user.is_superuser = superuser
            user.email_verified_at = user.email_verified_at or timezone.now()
            user.set_password(PASSWORD)
            user.save()
            self.stdout.write(f"{'Created' if created else 'Updated'} {role}: {email}")
