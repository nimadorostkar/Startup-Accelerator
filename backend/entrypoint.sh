#!/bin/sh
# Container roles:  web (API) · worker (background jobs) · beat (scheduler) · or any manage.py command.
set -e

case "$1" in
  web)
    python manage.py wait_for_db --timeout 90
    if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
      # Only the web role migrates, under an advisory lock so parallel starts take turns.
      python manage.py migrate_safely
      if [ "${SEED_CONTENT:-0}" = "1" ]; then
        python manage.py seed_content --if-empty
      fi
    fi
    exec gunicorn config.wsgi:application -c gunicorn.conf.py
    ;;
  worker)
    python manage.py wait_for_db --timeout 90
    exec celery -A config worker --loglevel "${LOG_LEVEL:-INFO}" --concurrency "${CELERY_CONCURRENCY:-2}" \
      --max-tasks-per-child 200 --without-gossip --without-mingle
    ;;
  beat)
    python manage.py wait_for_db --timeout 90
    exec celery -A config beat --loglevel "${LOG_LEVEL:-INFO}" --schedule /tmp/celerybeat-schedule
    ;;
  *)
    exec python manage.py "$@"
    ;;
esac
