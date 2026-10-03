"""Settings for the test suite: real Postgres (row locks matter), no Redis, eager jobs."""

import os

os.environ.setdefault("DJANGO_SECRET_KEY", "test-only-secret-key")
os.environ.setdefault("SITE_URL", "http://testserver.local")
os.environ.pop("REDIS_URL", None)
os.environ.pop("SENTRY_DSN", None)
os.environ.pop("EMAIL_HOST", None)

from .settings import *  # noqa: E402,F403

CELERY_TASK_ALWAYS_EAGER = True
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]  # fast, tests only
FRONTEND_INTERNAL_URL = ""
ALLOWED_HOSTS = ["*"]
CSRF_TRUSTED_ORIGINS = ["http://testserver.local"]
# Throttles are tested on their own; everything else runs unthrottled.
REST_FRAMEWORK = {**REST_FRAMEWORK, "DEFAULT_THROTTLE_CLASSES": []}  # noqa: F405
STORAGES = {  # noqa: F405
    **STORAGES,  # noqa: F405
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
}
API_THROTTLING = False
