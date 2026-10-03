import logging

from django.core.cache import cache
from django.db import connection
from django.http import JsonResponse
from django.views.defaults import server_error as html_server_error
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view, authentication_classes, permission_classes, throttle_classes
from rest_framework.response import Response

logger = logging.getLogger(__name__)


@extend_schema(exclude=True)
@api_view(["GET"])
@authentication_classes([])
@permission_classes([])
@throttle_classes([])
def health(request):
    """Liveness: the process is up and serving."""
    return Response({"status": "ok"})


@extend_schema(exclude=True)
@api_view(["GET"])
@authentication_classes([])
@permission_classes([])
@throttle_classes([])
def ready(request):
    """Readiness: the database and the cache answer."""
    checks = {}
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        checks["database"] = "ok"
    except Exception:  # noqa: BLE001 — any failure means "not ready"
        logger.exception("readiness: database check failed")
        checks["database"] = "error"
    try:
        cache.set("readiness-probe", "1", 5)
        checks["cache"] = "ok" if cache.get("readiness-probe") == "1" else "error"
    except Exception:  # noqa: BLE001
        logger.exception("readiness: cache check failed")
        checks["cache"] = "error"
    healthy = all(v == "ok" for v in checks.values())
    return Response({"status": "ok" if healthy else "error", **checks}, status=200 if healthy else 503)


def server_error(request, *args, **kwargs):
    """JSON for API clients, Django's page for the back office."""
    if request.path.startswith("/api/"):
        return JsonResponse({"message": "Something went wrong on our side. Please try again."}, status=500)
    return html_server_error(request, *args, **kwargs)
