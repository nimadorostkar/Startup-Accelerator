"""Settings for the Fundup Club API.

Every deployment-specific value is read from the environment; the full list,
with defaults and what each one is for, is in ../.env.example. Nothing here
needs editing between development and production.
"""

import os
from datetime import timedelta
from pathlib import Path
from urllib.parse import parse_qsl, unquote, urlsplit

from celery.schedules import crontab
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent


# ---------------------------------------------------------------- env helpers


def env(name: str, default: str | None = None) -> str | None:
    value = os.environ.get(name)
    return default if value is None or value == "" else value


def env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None or value == "":
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_int(name: str, default: int) -> int:
    value = os.environ.get(name)
    return int(value) if value not in (None, "") else default


def env_float(name: str, default: float) -> float:
    value = os.environ.get(name)
    return float(value) if value not in (None, "") else default


def env_list(name: str, default: str = "") -> list[str]:
    return [v.strip() for v in (os.environ.get(name) or default).split(",") if v.strip()]


def database_from_url(url: str) -> dict:
    """postgres://user:password@host:5432/name?sslmode=require → Django DATABASES entry."""
    parts = urlsplit(url)
    if parts.scheme not in {"postgres", "postgresql"}:
        raise ImproperlyConfigured("DATABASE_URL must be a postgres:// URL.")
    return {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": unquote(parts.path.lstrip("/")),
        "USER": unquote(parts.username or ""),
        "PASSWORD": unquote(parts.password or ""),
        "HOST": parts.hostname or "localhost",
        "PORT": str(parts.port or 5432),
        "OPTIONS": dict(parse_qsl(parts.query)),
        # Keep connections open between requests; re-check them before reuse.
        "CONN_MAX_AGE": env_int("DATABASE_CONN_MAX_AGE", 60),
        "CONN_HEALTH_CHECKS": True,
    }


# ---------------------------------------------------------------- core

DEBUG = env_bool("DJANGO_DEBUG", False)

SECRET_KEY = env("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    if not DEBUG:
        raise ImproperlyConfigured("Set DJANGO_SECRET_KEY (any long random string).")
    SECRET_KEY = "insecure-development-key-do-not-use-in-production"

# Public origin of the website (the Next.js app). Used for links in emails,
# the trusted-origin check on cookie-authenticated requests and Google sign-in.
SITE_URL = (env("SITE_URL", "http://localhost:3000") or "").rstrip("/")

# Host names the API answers to: the site's own (from SITE_URL), the names used
# inside the Docker network ("backend") and by health checks, plus any extras.
ALLOWED_HOSTS = sorted(
    {
        urlsplit(SITE_URL).hostname or "localhost",
        "localhost",
        "127.0.0.1",
        "backend",
        *env_list("DJANGO_ALLOWED_HOSTS"),
    }
)
CSRF_TRUSTED_ORIGINS = sorted({SITE_URL, *env_list("CSRF_TRUSTED_ORIGINS")})

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "drf_spectacular",
    "apps.core",
    "apps.accounts",
    "apps.applications",
    "apps.content",
]

MIDDLEWARE = [
    "apps.core.middleware.RequestIdMiddleware",
    "apps.core.middleware.BackofficeLoginThrottleMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ---------------------------------------------------------------- database

DATABASES = {
    "default": database_from_url(env("DATABASE_URL", "postgres://fundup:fundup@localhost:5432/fundup") or "")
}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------------------------------------------------------- cache

REDIS_URL = env("REDIS_URL")
if REDIS_URL:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": REDIS_URL,
            "KEY_PREFIX": "fundup",
            "TIMEOUT": 300,
        }
    }
else:
    CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}

# ---------------------------------------------------------------- accounts

AUTH_USER_MODEL = "accounts.User"

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
    "django.contrib.auth.hashers.ScryptPasswordHasher",
]

# Used by the back office (createsuperuser, admin password changes). The API
# applies the site's own password rules on top: see apps/accounts/validation.py.
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# The site's sign-in cookie. The frontend reads and writes the same name.
AUTH_COOKIE_NAME = "vcs_session"
AUTH_COOKIE_SECURE = env_bool("COOKIE_SECURE", not DEBUG)
AUTH_SESSION_TTL = timedelta(hours=env_int("AUTH_SESSION_TTL_HOURS", 24))
AUTH_SESSION_REMEMBER_TTL = timedelta(days=env_int("AUTH_SESSION_REMEMBER_DAYS", 30))
PASSWORD_RESET_TTL = timedelta(minutes=30)
EMAIL_VERIFICATION_TTL = timedelta(days=3)

GOOGLE_CLIENT_ID = env("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = env("GOOGLE_CLIENT_SECRET", "")

# The Django admin (back office) keeps its own session and CSRF cookies,
# scoped to its path so they never mix with the site's sign-in cookie.
ADMIN_URL = "backoffice/"
SESSION_COOKIE_NAME = "fundup_backoffice_session"
SESSION_COOKIE_PATH = f"/{ADMIN_URL}"
SESSION_COOKIE_SECURE = AUTH_COOKIE_SECURE
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_NAME = "fundup_backoffice_csrftoken"
CSRF_COOKIE_PATH = f"/{ADMIN_URL}"
CSRF_COOKIE_SECURE = AUTH_COOKIE_SECURE
CSRF_COOKIE_HTTPONLY = True

# ---------------------------------------------------------------- API

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["apps.accounts.authentication.SessionTokenAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["apps.core.parsers.ObjectJSONParser"],
    "EXCEPTION_HANDLER": "apps.core.exceptions.exception_handler",
    "DEFAULT_SCHEMA_CLASS": "apps.core.schema.AutoSchema",
    "DEFAULT_THROTTLE_CLASSES": [
        "apps.core.throttles.AnonRateThrottle",
        "apps.core.throttles.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": env("THROTTLE_ANON", "300/min"),
        "user": env("THROTTLE_USER", "600/min"),
        "login": "10/min",
        "register": "10/hour",
        "password_reset": "5/hour",
        "password_reset_confirm": "20/hour",
        "verify_email": "20/hour",
        "google": "30/hour",
        "contact": "10/hour",
        "subscribe": "20/hour",
        "event_register": "30/hour",
    },
    "UNAUTHENTICATED_USER": "django.contrib.auth.models.AnonymousUser",
}
if DEBUG:
    REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"].append("rest_framework.renderers.BrowsableAPIRenderer")

# Shown at /api/v1/docs/ when DEBUG is on or API_DOCS_PUBLIC=true.
API_DOCS_PUBLIC = env_bool("API_DOCS_PUBLIC", DEBUG)
SPECTACULAR_SETTINGS = {
    "TITLE": "Fundup Club API",
    "DESCRIPTION": "Accounts, founder applications, the review panel, the public startup directory, "
    "events, the newsletter and the contact form.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
}

# Requests from these networks may say who the real client is (X-Forwarded-For):
# the reverse proxy and the frontend's server, inside the Docker network.
TRUSTED_PROXY_NETWORKS = env_list(
    "TRUSTED_PROXY_NETWORKS", "127.0.0.0/8,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,::1/128"
)

# ---------------------------------------------------------------- email

DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", "Fundup Club <no-reply@localhost>")
SERVER_EMAIL = DEFAULT_FROM_EMAIL
# Contact-form messages go here; if empty, to every reviewer instead.
SUPPORT_EMAILS = env_list("SUPPORT_EMAILS")

EMAIL_HOST = env("EMAIL_HOST", "")
if EMAIL_HOST:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_PORT = env_int("EMAIL_PORT", 587)
    EMAIL_HOST_USER = env("EMAIL_HOST_USER", "")
    EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", "")
    EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", EMAIL_PORT == 587)
    EMAIL_USE_SSL = env_bool("EMAIL_USE_SSL", EMAIL_PORT == 465)
    EMAIL_TIMEOUT = 15
else:
    # No mail server configured: print emails to the log instead of sending.
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# ---------------------------------------------------------------- background jobs

CELERY_BROKER_URL = env("CELERY_BROKER_URL", REDIS_URL or "redis://localhost:6379/0")
CELERY_TASK_ALWAYS_EAGER = env_bool("CELERY_TASK_ALWAYS_EAGER", False)
CELERY_TASK_EAGER_PROPAGATES = True
CELERY_TASK_IGNORE_RESULT = True
CELERY_TASK_ACKS_LATE = True
CELERY_WORKER_PREFETCH_MULTIPLIER = 1
CELERY_TASK_TIME_LIMIT = 120
CELERY_TASK_SOFT_TIME_LIMIT = 90
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_TIMEZONE = "UTC"
CELERY_BEAT_SCHEDULE = {
    "overdue-review-digest": {
        "task": "apps.applications.tasks.send_overdue_digest",
        "schedule": crontab(hour=8, minute=0),
    },
    "event-reminders": {
        "task": "apps.content.tasks.send_event_reminders",
        "schedule": crontab(minute=15),
    },
    "purge-expired-sessions": {
        "task": "apps.accounts.tasks.purge_expired",
        "schedule": crontab(hour=3, minute=30),
    },
}

# ---------------------------------------------------------------- frontend cache

# The API tells the frontend to refresh its cached pages when public data
# changes (events, articles, the startup directory). Both are optional.
FRONTEND_INTERNAL_URL = (env("FRONTEND_INTERNAL_URL", "") or "").rstrip("/")
REVALIDATE_SECRET = env("REVALIDATE_SECRET", "")

# ---------------------------------------------------------------- static files

STATIC_URL = f"/{ADMIN_URL}static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"
        if not DEBUG
        else "django.contrib.staticfiles.storage.StaticFilesStorage"
    },
}

# ---------------------------------------------------------------- uploads

# Startup logos and founder photos (apps/applications/images.py). In production
# this is the `media` volume, which Caddy serves directly at MEDIA_URL; the API
# serves it too (apps/core/views.media), which is what local development uses.
MEDIA_ROOT = Path(env("MEDIA_ROOT", str(BASE_DIR / "media")))
MEDIA_URL = "/api/v1/media/"
# The file itself is capped in images.py; DATA_UPLOAD_MAX_MEMORY_SIZE (below,
# 1 MB) only counts a request's other data, never an uploaded file.

# ---------------------------------------------------------------- i18n

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = False
USE_TZ = True

# ---------------------------------------------------------------- security

# TLS ends at the reverse proxy, which says so in X-Forwarded-Proto.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
X_FRAME_OPTIONS = "DENY"
DATA_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024  # 1 MB: no endpoint needs more
# Caddy redirects to HTTPS and sends HSTS for the whole site (deploy/Caddyfile).
# The API also answers plain HTTP inside the Docker network, from the website's server.
SILENCED_SYSTEM_CHECKS = ["security.W004", "security.W008"]

# ---------------------------------------------------------------- logging

LOG_LEVEL = env("LOG_LEVEL", "INFO")
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {"request_id": {"()": "apps.core.middleware.RequestIdFilter"}},
    "formatters": {
        "json": {"()": "apps.core.logging.JsonFormatter"},
        "plain": {"format": "%(asctime)s %(levelname)s %(name)s [%(request_id)s] %(message)s"},
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "plain" if DEBUG else "json",
            "filters": ["request_id"],
        }
    },
    "root": {"handlers": ["console"], "level": LOG_LEVEL},
    "loggers": {
        "django.db.backends": {"level": "WARNING"},
        "django.security.DisallowedHost": {"level": "ERROR"},
    },
}

# ---------------------------------------------------------------- error tracking

SENTRY_DSN = env("SENTRY_DSN")
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.celery import CeleryIntegration
    from sentry_sdk.integrations.django import DjangoIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration(), CeleryIntegration()],
        environment=env("SENTRY_ENVIRONMENT", "production"),
        traces_sample_rate=env_float("SENTRY_TRACES_SAMPLE_RATE", 0.0),
        send_default_pii=False,
    )

# ---------------------------------------------------------------- program rules

# Founders are told reviews start within 5 working days.
REVIEW_SLA_DAYS = 5
