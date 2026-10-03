# syntax=docker/dockerfile:1.7
# Fundup Club API: Django + Gunicorn (web), Celery (worker, beat). One image, three roles.

FROM python:3.12-slim-bookworm AS build
ENV PIP_NO_CACHE_DIR=1 PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /build
COPY requirements.txt .
RUN pip wheel --wheel-dir /wheels -r requirements.txt

FROM python:3.12-slim-bookworm AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DJANGO_SETTINGS_MODULE=config.settings \
    PORT=8000
RUN groupadd --system --gid 10001 app && useradd --system --uid 10001 --gid app --home /app app
WORKDIR /app
COPY --from=build /wheels /wheels
RUN pip install /wheels/* && rm -rf /wheels
COPY --chown=app:app . .
# Static files for the back office, served by WhiteNoise. The key is only needed to load settings.
RUN DJANGO_SECRET_KEY=collectstatic-only python manage.py collectstatic --noinput \
    && chmod +x entrypoint.sh
USER app
EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
    CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/api/v1/health', timeout=4).status == 200 else 1)"
ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]
CMD ["web"]
