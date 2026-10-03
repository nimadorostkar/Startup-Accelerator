"""Account operations. Views stay thin; the rules live here."""

import hashlib
import logging

from django.conf import settings
from django.core.cache import cache
from django.db import IntegrityError, transaction
from django.utils import timezone

from apps.core.emails import queue_email
from apps.core.exceptions import ApiError, Invalid
from apps.core.utils import iso
from apps.core.validation import Fields, check_email, check_name, check_new_password

from .models import AuthSession, User, UserToken

logger = logging.getLogger(__name__)

WRONG_CREDENTIALS = "That email and password don't match. Try again, or reset your password."
BAD_RESET_LINK = "This reset link is invalid or has expired. Request a new one below."
BAD_VERIFY_LINK = "This confirmation link is invalid or has expired. Sign in to get a new one."

# Failed sign-ins are counted per account. Only failures count, so nobody can lock
# a founder out by spamming requests, and a success clears the visitor's count.
LOGIN_PAIR_LIMIT, LOGIN_PAIR_WINDOW = 5, 15 * 60  # one visitor, one account
LOGIN_ACCOUNT_LIMIT, LOGIN_ACCOUNT_WINDOW = 50, 60 * 60  # one account, from anywhere
RESET_EMAILS_PER_HOUR = 3


def _counter_key(kind: str, *parts: str) -> str:
    return f"{kind}:" + hashlib.sha256("|".join(parts).encode()).hexdigest()


def _bump(key: str, window: int) -> int:
    if cache.add(key, 1, window):
        return 1
    try:
        return cache.incr(key)
    except ValueError:  # expired between the two calls
        cache.set(key, 1, window)
        return 1


def _throttling() -> bool:
    return getattr(settings, "API_THROTTLING", True)


def user_payload(user: User) -> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "isReviewer": user.is_reviewer,
        "emailVerified": user.email_verified,
        "hasPassword": user.has_usable_password(),
        "createdAt": iso(user.created_at),
    }


# ---------------------------------------------------------------- sign-up / sign-in


def register(data: dict) -> User:
    f = Fields(data)
    name, email, password = f.text("name"), f.text("email").lower(), f.text("password")
    f.error("name", check_name(name))
    f.error("email", check_email(email))
    f.error("password", check_new_password(password))
    if not f.flag("terms"):
        f.error("terms", "Please accept the terms to continue.")
    if f.errors:
        raise Invalid(f.errors)

    taken = Invalid({"email": "That email is already registered."})
    if User.objects.filter(email=email).exists():
        raise taken
    try:
        with transaction.atomic():
            user = User.objects.create_user(email, name, password, terms_accepted_at=timezone.now())
    except IntegrityError:  # two sign-ups for one address at the same moment
        raise taken from None
    send_verification(user)
    return user


def authenticate(data: dict, *, ip: str = "") -> tuple[User, bool]:
    f = Fields(data)
    email, password = f.text("email").lower(), f.text("password")
    f.error("email", check_email(email))
    if not password:
        f.error("password", "Enter your password.")
    if f.errors:
        raise Invalid(f.errors)

    pair, account = _counter_key("login-fail", email, ip), _counter_key("login-fail", email)
    if _throttling():
        if (cache.get(pair) or 0) >= LOGIN_PAIR_LIMIT:
            raise ApiError(
                "Too many failed sign-ins for this account. Please wait 15 minutes, or reset your password.",
                status_code=429,
                retryAfter=LOGIN_PAIR_WINDOW,
            )
        if (cache.get(account) or 0) >= LOGIN_ACCOUNT_LIMIT:
            raise ApiError(
                "Too many failed sign-ins for this account. Please wait an hour, or reset your password.",
                status_code=429,
                retryAfter=LOGIN_ACCOUNT_WINDOW,
            )

    user = User.objects.filter(email=email).first()
    if user is None:
        # Spend the same time hashing as a real check, so response times don't reveal accounts.
        User().set_password(password)
        ok = False
    else:
        ok = user.has_usable_password() and user.check_password(password) and user.is_active
    if not ok:
        _bump(pair, LOGIN_PAIR_WINDOW)
        _bump(account, LOGIN_ACCOUNT_WINDOW)
        raise ApiError(WRONG_CREDENTIALS, status_code=401)
    cache.delete(pair)
    user.last_login = timezone.now()
    user.save(update_fields=["last_login"])
    return user, f.flag("remember")


def clear_failed_logins(email: str) -> None:
    """After a password reset the account starts afresh (per-visitor counts expire on their own)."""
    cache.delete(_counter_key("login-fail", email))


# ---------------------------------------------------------------- email verification


def send_verification(user: User) -> None:
    if user.email_verified:
        return
    token = UserToken.issue(user, UserToken.Purpose.VERIFY_EMAIL)
    queue_email(
        user.email,
        "Confirm your email for Fundup Club",
        "verify_email",
        {
            "name": user.name.split(" ")[0],
            "action_url": f"{settings.SITE_URL}/verify-email?token={token}",
            "action_label": "Confirm my email",
        },
    )


@transaction.atomic
def verify_email(data: dict) -> User:
    token = data.get("token") if isinstance(data, dict) else None
    user = UserToken.redeem(token, UserToken.Purpose.VERIFY_EMAIL)
    if user is None:
        raise ApiError(BAD_VERIFY_LINK, status_code=400)
    if not user.email_verified:
        user.email_verified_at = timezone.now()
        user.save(update_fields=["email_verified_at"])
    return user


# ---------------------------------------------------------------- password reset


def request_password_reset(data: dict) -> None:
    """Validates the address, then does the lookup in the background so the
    response looks and takes the same whether or not an account exists."""
    f = Fields(data)
    email = f.text("email").lower()
    f.error("email", check_email(email))
    if f.errors:
        raise Invalid(f.errors)
    from .tasks import send_password_reset

    transaction.on_commit(lambda: send_password_reset.delay(email), robust=True)


def email_password_reset(email: str) -> None:
    user = User.objects.filter(email=email, is_active=True).first()
    if user is None:
        return
    # A few links an hour is plenty; past that the inbox already has a fresh one. Silently, so
    # nobody can block someone's reset by asking for it on their behalf, or flood their inbox.
    if _throttling() and _bump(_counter_key("reset-mail", email), 3600) > RESET_EMAILS_PER_HOUR:
        return
    token = UserToken.issue(user, UserToken.Purpose.PASSWORD_RESET)
    queue_email(
        user.email,
        "Reset your Fundup Club password",
        "password_reset",
        {
            "name": user.name.split(" ")[0],
            "action_url": f"{settings.SITE_URL}/reset-password?token={token}",
            "action_label": "Choose a new password",
        },
    )


@transaction.atomic
def reset_password(data: dict) -> User:
    f = Fields(data)
    password = f.text("password")
    f.error("password", check_new_password(password))
    if f.errors:
        raise Invalid(f.errors)
    user = UserToken.redeem(data.get("token"), UserToken.Purpose.PASSWORD_RESET)
    if user is None:
        raise ApiError(BAD_RESET_LINK, status_code=400)
    user.set_password(password)
    # Following the link proved they own the inbox.
    user.email_verified_at = user.email_verified_at or timezone.now()
    user.save(update_fields=["password", "email_verified_at"])
    AuthSession.revoke_all(user)  # a stolen session dies with the old password
    clear_failed_logins(user.email)
    password_changed_notice(user)
    return user


def change_password(user: User, session: AuthSession | None, data: dict) -> None:
    f = Fields(data)
    current, new = f.text("currentPassword"), f.text("newPassword")
    if user.has_usable_password() and not user.check_password(current):
        f.error("currentPassword", "That's not your current password.")
    f.error("newPassword", check_new_password(new))
    if f.errors:
        raise Invalid(f.errors)
    user.set_password(new)
    user.save(update_fields=["password"])
    AuthSession.revoke_all(user, keep=session)
    password_changed_notice(user)


def password_changed_notice(user: User) -> None:
    queue_email(
        user.email,
        "Your Fundup Club password was changed",
        "password_changed",
        {"name": user.name.split(" ")[0], "action_url": f"{settings.SITE_URL}/forgot-password"},
    )


def update_profile(user: User, data: dict) -> User:
    f = Fields(data)
    if f.has("name"):
        name = f.text("name")
        f.error("name", check_name(name))
        if f.errors:
            raise Invalid(f.errors)
        user.name = name
        user.save(update_fields=["name"])
    return user
