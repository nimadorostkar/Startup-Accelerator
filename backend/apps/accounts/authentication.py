from datetime import timedelta
from urllib.parse import urlsplit

from django.conf import settings
from django.utils import timezone
from rest_framework import exceptions
from rest_framework.authentication import BaseAuthentication

from .models import AuthSession, hash_token

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}
TOUCH_EVERY = timedelta(minutes=5)


def _origin_of(url: str) -> str:
    parts = urlsplit(url)
    return f"{parts.scheme}://{parts.netloc}" if parts.scheme and parts.netloc else ""


class SessionTokenAuthentication(BaseAuthentication):
    """Signs a request in from the site's session token.

    The token comes either from the `vcs_session` cookie (browsers on the
    site) or an `Authorization: Bearer <token>` header (the website's server,
    mobile apps). Cookie-authenticated requests that change data must come
    from the site itself (Origin/Referer check), which is what stops other
    sites riding on a visitor's cookie. Bearer requests can't be forged that
    way, because browsers never attach that header on their own.
    """

    def authenticate(self, request):
        token, via_cookie = self._read_token(request)
        if not token:
            return None
        session = (
            AuthSession.objects.select_related("user").filter(token_hash=hash_token(token)).first()
            if len(token) <= 200
            else None
        )
        if session is None or not session.is_valid:
            if via_cookie:
                return None  # a stale cookie just means "signed out"
            raise exceptions.AuthenticationFailed("Your session has ended. Sign in again.")
        if via_cookie and request.method not in SAFE_METHODS:
            self._check_origin(request)
        now = timezone.now()
        if now - session.last_used_at > TOUCH_EVERY:
            AuthSession.objects.filter(pk=session.pk).update(last_used_at=now)
        return session.user, session

    def authenticate_header(self, request):
        return 'Bearer realm="api"'

    @staticmethod
    def _read_token(request) -> tuple[str | None, bool]:
        header = request.META.get("HTTP_AUTHORIZATION", "")
        if header.startswith("Bearer "):
            return header[7:].strip() or None, False
        cookie = request.COOKIES.get(settings.AUTH_COOKIE_NAME)
        return (cookie or None), True

    @staticmethod
    def _check_origin(request) -> None:
        origin = request.META.get("HTTP_ORIGIN") or _origin_of(request.META.get("HTTP_REFERER", ""))
        own = f"{request.scheme}://{request.get_host()}"
        if not origin or (origin not in settings.CSRF_TRUSTED_ORIGINS and origin != own):
            raise exceptions.PermissionDenied("This request didn't come from the Fundup Club website.")
