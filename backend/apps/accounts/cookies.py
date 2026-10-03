from django.conf import settings

from .models import AuthSession


def set_session_cookie(response, token: str, session: AuthSession) -> None:
    """Remembered sessions get a lasting cookie; the rest end when the browser closes."""
    max_age = int(settings.AUTH_SESSION_REMEMBER_TTL.total_seconds()) if session.remember else None
    response.set_cookie(
        settings.AUTH_COOKIE_NAME,
        token,
        max_age=max_age,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite="Lax",
        path="/",
    )
    response["Cache-Control"] = "no-store"


def clear_session_cookie(response) -> None:
    response.delete_cookie(settings.AUTH_COOKIE_NAME, path="/", samesite="Lax")
