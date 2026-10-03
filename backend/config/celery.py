"""Background jobs: emails, the daily review digest, event reminders, clean-up."""

import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("fundup")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
