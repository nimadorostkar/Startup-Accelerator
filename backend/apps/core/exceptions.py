"""One error shape for the whole API, matching what the frontend renders:

401 {"message"}                    not signed in
404 {"message"}                    not found — and not allowed (reviewer-only data)
409 {"message"}                    locked, or the status changed underneath you
422 {"message", "errors": {...}}   validation, keyed by the form field names
429 {"message", "retryAfter"}      too many attempts
"""

import logging
import math

from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from django.http import Http404
from rest_framework import exceptions, status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)

INVALID = "Some fields need another look — they're highlighted below."


class ApiError(exceptions.APIException):
    status_code = status.HTTP_400_BAD_REQUEST

    def __init__(self, message: str, *, errors: dict | None = None, status_code: int | None = None, **extra):
        super().__init__(message)
        self.message = message
        self.errors = errors or {}
        self.extra = extra
        if status_code:
            self.status_code = status_code


class Conflict(ApiError):
    status_code = status.HTTP_409_CONFLICT


class Invalid(ApiError):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY

    def __init__(self, errors: dict | None = None, message: str = INVALID, **extra):
        super().__init__(message, errors=errors, **extra)


class NotFound(ApiError):
    status_code = status.HTTP_404_NOT_FOUND

    def __init__(self, message: str = "Not found."):
        super().__init__(message)


def _first_messages(detail) -> dict:
    """DRF's {"field": ["msg", ...]} → {"field": "msg"}."""
    if not isinstance(detail, dict):
        return {}
    out = {}
    for field, value in detail.items():
        while isinstance(value, (list, tuple)) and value:
            value = value[0]
        if isinstance(value, dict):
            value = next(iter(_first_messages(value).values()), "")
        out[field] = str(value)
    return out


def _wait_text(seconds: float) -> str:
    minutes = math.ceil(seconds / 60)
    return (
        f"{math.ceil(seconds)} seconds" if seconds < 60 else f"{minutes} minute{'s' if minutes != 1 else ''}"
    )


def exception_handler(exc, context):
    if isinstance(exc, ApiError):
        body = {"message": exc.message, **({"errors": exc.errors} if exc.errors else {}), **exc.extra}
        response = Response(body, status=exc.status_code)
        if exc.status_code == status.HTTP_429_TOO_MANY_REQUESTS and "retryAfter" in exc.extra:
            response["Retry-After"] = str(exc.extra["retryAfter"])
        return response

    if isinstance(exc, Http404):
        exc = exceptions.NotFound()
    elif isinstance(exc, DjangoPermissionDenied):
        exc = exceptions.PermissionDenied()

    if isinstance(exc, exceptions.ValidationError):
        return Response(
            {"message": INVALID, "errors": _first_messages(exc.detail)},
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )
    if isinstance(exc, exceptions.ParseError):
        return Response({"message": "The request body isn't valid JSON."}, status=status.HTTP_400_BAD_REQUEST)
    if isinstance(exc, exceptions.Throttled):
        wait = exc.wait or 60
        response = Response(
            {
                "message": f"Too many attempts. Please wait {_wait_text(wait)} and try again.",
                "retryAfter": math.ceil(wait),
            },
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )
        response["Retry-After"] = str(math.ceil(wait))
        return response
    if isinstance(exc, (exceptions.NotAuthenticated, exceptions.AuthenticationFailed)):
        response = Response({"message": "Sign in to continue."}, status=status.HTTP_401_UNAUTHORIZED)
        response["WWW-Authenticate"] = 'Bearer realm="api"'
        return response
    if isinstance(exc, exceptions.NotFound):
        return Response({"message": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    response = drf_exception_handler(exc, context)
    if response is not None:
        detail = getattr(exc, "detail", None)
        message = str(detail) if isinstance(detail, str) else "The request couldn't be completed."
        response.data = {"message": message}
    return response
