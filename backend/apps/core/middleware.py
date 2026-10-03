import contextvars
import logging
import re
import uuid

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
