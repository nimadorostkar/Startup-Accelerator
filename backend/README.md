# Fundup Club API

Django 5.2 LTS · Django REST Framework · PostgreSQL · Redis · Celery. Owns every account, application, event, article, subscriber and message, enforces every rule and sends every email. The website (the Next.js app one folder up) is its client.

How it fits together, the full API reference and the rules it enforces: [docs/backend-integration.md](../docs/backend-integration.md). Running it: [docs/deployment.md](../docs/deployment.md).

## Layout

```
config/            settings (all from environment variables), URLs, Celery app, test settings
apps/core/         error format, rate limits, client IP, request ids, JSON logs, health, email queue
apps/accounts/     users, sessions, password reset, email verification, Google sign-in
apps/applications/ rules.py · services.py · payloads.py · queue.py · export.py · notifications.py
apps/content/      events + registrations, newsletter issues + subscribers, contact messages
templates/emails/  one plain-text template per email, wrapped in layout.html
tests/             pytest, against a real PostgreSQL
```

Views are thin: they read the request and call `services` (applications, content) or `accounts/services.py`, which hold the rules. Every change to an application runs in `services._founder_change` or `services._review_change`: one transaction, with the row locked.

## Develop

The easiest way is the dev stack (Postgres, Redis, this API with auto-reload, a worker, Mailpit):

```bash
docker compose -f ../docker-compose.yml -f ../docker-compose.dev.yml up -d
docker compose -f ../docker-compose.yml -f ../docker-compose.dev.yml exec backend python manage.py <command>
```

Or run it on your machine against the dev stack's Postgres and Redis:

```bash
python3.12 -m venv .venv && . .venv/bin/activate
pip install -r requirements-dev.txt
export DJANGO_DEBUG=true DATABASE_URL=postgres://fundup:<POSTGRES_PASSWORD>@localhost:5433/fundup \
       REDIS_URL=redis://localhost:6380/1 CELERY_TASK_ALWAYS_EAGER=true
python manage.py migrate_safely
python manage.py runserver 8000
```

## Commands

| Command | What it does |
| --- | --- |
| `migrate_safely` | `migrate` under a Postgres advisory lock (what the container runs on start) |
| `seed_content [--if-empty] [--update]` | Loads the launch events and newsletter issues |
| `seed_dev_accounts` | Development only: `founder@example.com` and `reviewer@example.com` |
| `seed_demo [--reset]` | Development only: 23 sample applications across every status, for the review queue |
| `createsuperuser` | A back-office admin (also a reviewer) |
| `wait_for_db` | Blocks until Postgres answers (container start-up) |

Back office: `/backoffice/` (users and roles, applications, events, articles, subscribers, contact messages, sessions).

## Test and lint

```bash
. .venv/bin/activate
export DATABASE_URL=postgres://fundup:<POSTGRES_PASSWORD>@localhost:5433/fundup
pytest                 # creates a test database next to it; --create-db after model changes
ruff check . && ruff format --check .
```

Tests run emails and background jobs inline, and include concurrency tests that race requests on separate database connections.

## Dependencies

`requirements.in` lists what we use directly; `requirements.txt` pins every package (`pip install -r requirements.in && pip freeze > requirements.txt` to update); `requirements-dev.txt` adds pytest and ruff.
