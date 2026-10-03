import contextvars
import logging
import re
import uuid

from django.conf import settings
from django.core.cache import cache
from django.http import HttpResponse

from .net import client_ip

_request_id: contextvars.ContextVar[str] = contextvars.ContextVar("request_id", default="-")
_VALID = re.compile(r"^[A-Za-z0-9._-]{8,64}$")


class RequestIdMiddleware:
    """Tags every log line and response with a request id.

    Reuses the X-Request-ID sent by the proxy or the frontend, so one id
    follows a request through Caddy, Next.js and Django.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        incoming = request.headers.get("X-Request-ID", "")
        request_id = incoming if _VALID.match(incoming) else uuid.uuid4().hex
        request.request_id = request_id
        # Not reset afterwards: Django logs the response ("Not Found: …") after the
        # middleware chain returns, and that line should carry the id too. The next
        # request on this thread sets its own.
        _request_id.set(request_id)
        response = self.get_response(request)
        response["X-Request-ID"] = request_id
        return response


class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = _request_id.get()
        return True


class BackofficeLoginThrottleMiddleware:
    """At most 10 failed back-office sign-ins per address per 15 minutes.

    The Django admin's login has no limit of its own, and its superusers are also
    reviewers. A failed attempt re-renders the form (200); success redirects (302)
    and clears the count.
    """

    LIMIT = 10
    WINDOW = 15 * 60

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method != "POST" or request.path != f"/{settings.ADMIN_URL}login/":
            return self.get_response(request)

        key = f"backoffice-login:{client_ip(request)}"
        throttled = getattr(settings, "API_THROTTLING", True)
        if throttled and (cache.get(key) or 0) >= self.LIMIT:
            response = HttpResponse(
                "Too many failed sign-in attempts. Please wait 15 minutes and try again.",
                status=429,
                content_type="text/plain; charset=utf-8",
            )
            response["Retry-After"] = str(self.WINDOW)
            return response
        response = self.get_response(request)
        if response.status_code == 302:
            cache.delete(key)
        elif throttled and not cache.add(key, 1, self.WINDOW):
            try:
                cache.incr(key)
            except ValueError:
                cache.set(key, 1, self.WINDOW)
        return response
