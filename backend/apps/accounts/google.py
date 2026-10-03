"""Google sign-in, second half: the website receives Google's redirect, checks
`state` against its cookie, then hands the one-time `code` to this module,
which exchanges it for the user's verified identity using the client secret.
"""

import base64
import json
import logging
import time

import requests
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from apps.core.exceptions import ApiError, Invalid

from .models import AuthSession, User, UserToken

logger = logging.getLogger(__name__)

TOKEN_URL = "https://oauth2.googleapis.com/token"
ISSUERS = {"https://accounts.google.com", "accounts.google.com"}
FAILED = "Google sign-in didn't work this time. Please try again."


def redirect_uri() -> str:
    return f"{settings.SITE_URL}/api/auth/callback/google"


def _claims(id_token: str) -> dict:
    """The ID token's payload. It came straight from Google's token endpoint over
    TLS, so (per OpenID Connect Core §3.1.3.7) the signature check can be skipped;
    the audience, issuer and expiry are still checked."""
    try:
        payload = id_token.split(".")[1]
        return json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
    except (IndexError, ValueError):
        raise ApiError(FAILED, status_code=400) from None


def exchange_code(code: str) -> dict:
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise ApiError("Google sign-in isn't configured yet.", status_code=503)
    try:
        response = requests.post(
            TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri(),
                "grant_type": "authorization_code",
            },
            timeout=10,
        )
    except requests.RequestException:
        logger.exception("google: token endpoint unreachable")
        raise ApiError(FAILED, status_code=502) from None
    if response.status_code != 200:
        logger.warning("google: code exchange refused (%s)", response.status_code)
        raise ApiError(FAILED, status_code=400)
    claims = _claims(response.json().get("id_token", ""))
    if (
        claims.get("aud") != settings.GOOGLE_CLIENT_ID
        or claims.get("iss") not in ISSUERS
        or int(claims.get("exp", 0)) < time.time()
        or not claims.get("sub")
    ):
        raise ApiError(FAILED, status_code=400)
    if not claims.get("email") or not claims.get("email_verified"):
        raise ApiError("Your Google account needs a verified email address.", status_code=400)
    return claims


def sign_in(data: dict) -> User:
    code = data.get("code") if isinstance(data, dict) else None
    if not isinstance(code, str) or not code or len(code) > 2000:
        raise Invalid({"code": "Missing sign-in code."})
    claims = exchange_code(code)
    sub, email = claims["sub"], claims["email"].strip().lower()
    # One line, like every name (a stray line break would break the subjects of later emails).
    name = " ".join(str(claims.get("name") or email.split("@")[0]).split())[:80] or "Founder"

    with transaction.atomic():
        user = User.objects.select_for_update().filter(google_sub=sub).first()
        if user is None:
            # Google has verified this address, so it may join an existing account.
            user = User.objects.select_for_update().filter(email=email).first()
            if user is None:
                user = User.objects.create_user(
                    email,
                    name,
                    None,
                    google_sub=sub,
                    email_verified_at=timezone.now(),
                    terms_accepted_at=timezone.now(),
                )
            else:
                if not user.email_verified:
                    # Whoever set this account's password never proved they own the inbox:
                    # it may have been registered by someone else in advance, waiting for
                    # the real owner to arrive. Google has just proved ownership, so the
                    # old password, sessions and emailed links stop working.
                    user.set_unusable_password()
                    AuthSession.revoke_all(user)
                    UserToken.objects.filter(user=user, used_at__isnull=True).update(used_at=timezone.now())
                    user.email_verified_at = timezone.now()
                user.google_sub = sub
                user.save(update_fields=["google_sub", "email_verified_at", "password"])
        if not user.is_active:
            raise ApiError("This account has been deactivated.", status_code=403)
        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])
    return user
