import re
from datetime import timedelta
from unittest import mock

import pytest
from django.core import mail
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import AuthSession, User, UserToken, hash_token

from .conftest import ORIGIN, client_for, make_reviewer, make_user

pytestmark = pytest.mark.django_db

REGISTER = {"name": "Maya Rosen", "email": "Maya@Example.com", "password": "ledgerly-2026", "terms": True}


def link_token(message) -> str:
    return re.search(r"token=([A-Za-z0-9_\-]+)", message.body).group(1)


# ---------------------------------------------------------------- register


def test_register_creates_account_signs_in_and_sends_verification():
    client = APIClient()
    response = client.post("/api/v1/auth/register", REGISTER, format="json")

    assert response.status_code == 201
    user = response.json()["user"]
    assert user["email"] == "maya@example.com"  # stored lower-cased
    assert user["role"] == "founder" and user["emailVerified"] is False

    cookie = response.cookies["vcs_session"]
    assert cookie["httponly"] and cookie["samesite"] == "Lax" and cookie["path"] == "/"
    assert not cookie["max-age"]  # no "remember me" on sign-up: ends with the browser
    assert AuthSession.objects.get(token_hash=hash_token(cookie.value)).user.email == "maya@example.com"
    assert User.objects.get(email="maya@example.com").terms_accepted_at is not None

    assert len(mail.outbox) == 1 and "/verify-email?token=" in mail.outbox[0].body


@pytest.mark.parametrize(
    ("body", "field", "message"),
    [
        ({**REGISTER, "name": "M"}, "name", "That name looks too short."),
        ({**REGISTER, "email": "not-an-email"}, "email", "That doesn't look like a valid email address."),
        ({**REGISTER, "password": "short1"}, "password", "Use at least 8 characters."),
        ({**REGISTER, "password": "onlyletters"}, "password", "Include at least one number."),
        (
            {**REGISTER, "password": "password1"},
            "password",
            "That password is too common. Choose one that's harder to guess.",
        ),
        ({**REGISTER, "terms": False}, "terms", "Please accept the terms to continue."),
    ],
)
def test_register_validation_matches_the_form(body, field, message):
    response = APIClient().post("/api/v1/auth/register", body, format="json")
    assert response.status_code == 422
    assert response.json()["errors"][field] == message


def test_register_rejects_a_taken_email_in_any_case():
    make_user("maya@example.com")
    response = APIClient().post("/api/v1/auth/register", REGISTER, format="json")
    assert response.status_code == 422
    assert response.json()["errors"] == {"email": "That email is already registered."}


# ---------------------------------------------------------------- login / logout


def test_login_with_remember_sets_a_lasting_cookie():
    make_user("maya@example.com", password="ledgerly-2026")
    response = APIClient().post(
        "/api/v1/auth/login",
        {"email": "MAYA@example.com", "password": "ledgerly-2026", "remember": True},
        format="json",
    )
    assert response.status_code == 200
    assert int(response.cookies["vcs_session"]["max-age"]) == 30 * 24 * 3600
    session = AuthSession.objects.get()
    assert session.remember and session.expires_at > timezone.now() + timedelta(days=29)


def test_login_to_a_google_only_account_still_spends_time_hashing(monkeypatch):
    # Otherwise a quick 401 would reveal "this account exists and signs in with Google".
    user = make_user("maya@example.com")
    user.set_unusable_password()
    user.save()
    hashed = []
    original = User.set_password
    monkeypatch.setattr(User, "set_password", lambda self, raw: hashed.append(raw) or original(self, raw))
    response = APIClient().post(
        "/api/v1/auth/login", {"email": "maya@example.com", "password": "guess-1234"}, format="json"
    )
    assert response.status_code == 401 and hashed == ["guess-1234"]


def test_login_gives_one_generic_message_for_wrong_password_and_unknown_email():
    make_user("maya@example.com", password="ledgerly-2026")
    wrong = APIClient().post(
        "/api/v1/auth/login", {"email": "maya@example.com", "password": "nope"}, format="json"
    )
    unknown = APIClient().post(
        "/api/v1/auth/login", {"email": "who@example.com", "password": "nope"}, format="json"
    )
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json() == unknown.json()
    assert "don't match" in wrong.json()["message"]


def test_logout_revokes_the_session_server_side():
    user = make_user()
    client = client_for(user)
    assert client.get("/api/v1/me").status_code == 200
    assert client.post("/api/v1/auth/logout").status_code == 204
    assert AuthSession.objects.get().revoked_at is not None
    assert client.get("/api/v1/me").status_code == 401  # a copied token stops working too


def test_me_requires_a_session():
    response = APIClient().get("/api/v1/me")
    assert response.status_code == 401
    assert response.json() == {"message": "Sign in to continue."}


def test_expired_and_deactivated_sessions_are_refused():
    user = make_user()
    client = client_for(user)
    AuthSession.objects.update(expires_at=timezone.now() - timedelta(seconds=1))
    assert client.get("/api/v1/me").status_code == 401

    client = client_for(user)
    User.objects.filter(pk=user.pk).update(is_active=False)
    assert client.get("/api/v1/me").status_code == 401


# ---------------------------------------------------------------- cookie auth and cross-site requests


def cookie_client(user) -> APIClient:
    _, token = AuthSession.start(user, remember=False, ip=None, user_agent="")
    client = APIClient()
    client.cookies["vcs_session"] = token
    return client


def test_cookie_session_reads_work_without_an_origin():
    client = cookie_client(make_user())
    assert client.get("/api/v1/me").status_code == 200


def test_cookie_session_writes_must_come_from_the_site():
    client = cookie_client(make_user())
    body = {"fullName": "Maya"}
    assert client.patch("/api/v1/me/application/profile", body, format="json").status_code == 403
    assert (
        client.patch(
            "/api/v1/me/application/profile", body, format="json", HTTP_ORIGIN="https://evil.example"
        ).status_code
        == 403
    )
    ok = client.patch("/api/v1/me/application/profile", body, format="json", HTTP_ORIGIN=ORIGIN)
    assert ok.status_code == 200


def test_a_stale_cookie_counts_as_signed_out_on_public_pages():
    client = APIClient()
    client.cookies["vcs_session"] = "not-a-real-token"
    assert client.get("/api/v1/events").status_code == 200
    assert client.get("/api/v1/me").status_code == 401


# ---------------------------------------------------------------- password reset


def test_password_reset_answers_the_same_for_known_and_unknown_emails():
    make_user("maya@example.com")
    known = APIClient().post("/api/v1/auth/password-reset", {"email": "maya@example.com"}, format="json")
    unknown = APIClient().post("/api/v1/auth/password-reset", {"email": "nobody@example.com"}, format="json")
    assert known.status_code == unknown.status_code == 202
    assert known.content == unknown.content
    assert len(mail.outbox) == 1 and mail.outbox[0].to == ["maya@example.com"]


def test_reset_link_sets_a_new_password_once_and_ends_other_sessions():
    user = make_user("maya@example.com", password="old-password-1")
    other_device = client_for(user)
    APIClient().post("/api/v1/auth/password-reset", {"email": "maya@example.com"}, format="json")
    token = link_token(mail.outbox[0])

    weak = APIClient().post(
        "/api/v1/auth/password-reset/confirm", {"token": token, "password": "short"}, format="json"
    )
    assert weak.status_code == 422

    response = APIClient().post(
        "/api/v1/auth/password-reset/confirm", {"token": token, "password": "brand-new-pass-2"}, format="json"
    )
    assert response.status_code == 200 and "vcs_session" in response.cookies
    user.refresh_from_db()
    assert user.check_password("brand-new-pass-2") and user.email_verified
    assert other_device.get("/api/v1/me").status_code == 401
    assert any("was just changed" in m.body for m in mail.outbox)

    again = APIClient().post(
        "/api/v1/auth/password-reset/confirm", {"token": token, "password": "another-pass-3"}, format="json"
    )
    assert again.status_code == 400  # single use


def test_reset_link_expires():
    user = make_user()
    token = UserToken.issue(user, UserToken.Purpose.PASSWORD_RESET)
    UserToken.objects.update(expires_at=timezone.now() - timedelta(seconds=1))
    response = APIClient().post(
        "/api/v1/auth/password-reset/confirm", {"token": token, "password": "brand-new-pass-2"}, format="json"
    )
    assert response.status_code == 400


# ---------------------------------------------------------------- email verification and reviewer access


def test_verifying_email_unlocks_the_reviewer_role():
    user = make_user("alex@example.com", role=User.Role.REVIEWER)
    client = client_for(user)
    assert client.get("/api/v1/admin/applications").status_code == 404  # unverified reviewer: no panel

    client.post("/api/v1/auth/verify-email/resend")
    token = link_token(mail.outbox[-1])
    response = APIClient().post("/api/v1/auth/verify-email", {"token": token}, format="json")
    assert response.status_code == 200 and response.json()["user"]["isReviewer"] is True
    assert client.get("/api/v1/admin/applications").status_code == 200


def test_change_password_keeps_this_session_and_ends_the_rest():
    user = make_user(password="old-password-1")
    this, other = client_for(user), client_for(user)
    wrong = this.post(
        "/api/v1/me/password", {"currentPassword": "nope", "newPassword": "new-pass-word-2"}, format="json"
    )
    assert wrong.status_code == 422
    ok = this.post(
        "/api/v1/me/password",
        {"currentPassword": "old-password-1", "newPassword": "new-pass-word-2"},
        format="json",
    )
    assert ok.status_code == 204
    assert this.get("/api/v1/me").status_code == 200
    assert other.get("/api/v1/me").status_code == 401


# ---------------------------------------------------------------- Google sign-in


def google_response(claims: dict):
    import base64
    import json

    payload = base64.urlsafe_b64encode(json.dumps(claims).encode()).decode().rstrip("=")
    return mock.Mock(status_code=200, json=lambda: {"id_token": f"header.{payload}.signature"})


GOOGLE = {"GOOGLE_CLIENT_ID": "client-123", "GOOGLE_CLIENT_SECRET": "secret"}


@override_settings(**GOOGLE)
def test_google_sign_in_creates_a_verified_account():
    claims = {
        "aud": "client-123",
        "iss": "https://accounts.google.com",
        "exp": 9_999_999_999,
        "sub": "google-1",
        "email": "Lena@Example.com",
        "email_verified": True,
        "name": "Lena Ortiz",
    }
    with mock.patch("apps.accounts.google.requests.post", return_value=google_response(claims)) as post:
        response = APIClient().post("/api/v1/auth/google", {"code": "abc"}, format="json")
    assert response.status_code == 200
    assert post.call_args.kwargs["data"]["redirect_uri"].endswith("/api/auth/callback/google")
    user = User.objects.get(google_sub="google-1")
    assert user.email == "lena@example.com" and user.email_verified and not user.has_usable_password()


@override_settings(**GOOGLE)
def test_google_sign_in_joins_an_existing_account_and_refuses_bad_tokens():
    existing = make_user("lena@example.com", email_verified_at=timezone.now(), password="lena-own-pass-1")
    claims = {
        "aud": "client-123",
        "iss": "accounts.google.com",
        "exp": 9_999_999_999,
        "sub": "google-2",
        "email": "lena@example.com",
        "email_verified": True,
    }
    with mock.patch("apps.accounts.google.requests.post", return_value=google_response(claims)):
        assert APIClient().post("/api/v1/auth/google", {"code": "abc"}, format="json").status_code == 200
    existing.refresh_from_db()
    assert existing.google_sub == "google-2" and existing.email_verified
    assert existing.check_password("lena-own-pass-1")  # a confirmed owner keeps their password

    for bad in ({**claims, "aud": "someone-else"}, {**claims, "email_verified": False}, {**claims, "exp": 1}):
        with mock.patch("apps.accounts.google.requests.post", return_value=google_response(bad)):
            assert APIClient().post("/api/v1/auth/google", {"code": "abc"}, format="json").status_code == 400


@override_settings(**GOOGLE)
def test_google_sign_in_takes_back_an_account_someone_else_registered_first():
    """Pre-registration attack: someone signs up with the victim's address and a password
    of their choosing (never confirming it), waiting for the victim to arrive via Google."""
    squatter = make_user("victim@example.com", "Not The Owner", password="squatters-pass-1")
    squatter_session = client_for(squatter)
    UserToken.issue(squatter, UserToken.Purpose.PASSWORD_RESET)
    claims = {
        "aud": "client-123",
        "iss": "https://accounts.google.com",
        "exp": 9_999_999_999,
        "sub": "google-victim",
        "email": "victim@example.com",
        "email_verified": True,
    }
    with mock.patch("apps.accounts.google.requests.post", return_value=google_response(claims)):
        assert APIClient().post("/api/v1/auth/google", {"code": "abc"}, format="json").status_code == 200

    account = User.objects.get(email="victim@example.com")
    assert account.email_verified and account.google_sub == "google-victim"
    assert not account.has_usable_password()  # the squatter's password no longer works
    assert squatter_session.get("/api/v1/me").status_code == 401  # nor their session
    assert not UserToken.objects.filter(user=account, used_at__isnull=True).exists()  # nor their links
    login = APIClient().post(
        "/api/v1/auth/login", {"email": "victim@example.com", "password": "squatters-pass-1"}, format="json"
    )
    assert login.status_code == 401


def test_google_sign_in_reports_missing_configuration():
    response = APIClient().post("/api/v1/auth/google", {"code": "abc"}, format="json")
    assert response.status_code == 503


# ---------------------------------------------------------------- rate limits


@override_settings(API_THROTTLING=True)
def visitor(ip: str) -> APIClient:
    """A client whose requests arrive through the proxy, on behalf of a visitor at `ip`."""
    client = APIClient()
    client.credentials(HTTP_X_FORWARDED_FOR=ip)
    return client


@override_settings(API_THROTTLING=True)
def test_login_is_rate_limited_per_address():
    client = visitor("203.0.113.7")
    for n in range(10):
        client.post("/api/v1/auth/login", {"email": f"a{n}@example.com", "password": "x"}, format="json")
    response = client.post("/api/v1/auth/login", {"email": "b@example.com", "password": "x"}, format="json")
    assert response.status_code == 429
    assert response.json()["message"].startswith("Too many attempts")
    assert int(response["Retry-After"]) > 0
    # Another visitor isn't affected.
    other = visitor("203.0.113.8").post(
        "/api/v1/auth/login", {"email": "b@example.com", "password": "x"}, format="json"
    )
    assert other.status_code == 401


@override_settings(API_THROTTLING=True)
def test_the_websites_own_cache_fills_are_never_rate_limited():
    """Server-to-server reads from the private network without a visitor address."""
    client = APIClient()  # REMOTE_ADDR 127.0.0.1, no X-Forwarded-For
    for _ in range(320):  # past the anonymous limit of 300 a minute
        assert client.get("/api/v1/options").status_code == 200


@override_settings(API_THROTTLING=True)
def test_failed_sign_ins_lock_the_attacker_out_not_the_owner():
    make_user("maya@example.com", password="mayas-own-pass-1")
    body = {"email": "maya@example.com", "password": "guess"}
    attacker = [visitor("198.51.100.1")]
    for _ in range(5):  # five failures on one account from one address
        attacker[0].post("/api/v1/auth/login", body, format="json")
    blocked = attacker[0].post("/api/v1/auth/login", {**body, "password": "mayas-own-pass-1"}, format="json")
    assert blocked.status_code == 429 and "Too many failed sign-ins" in blocked.json()["message"]
    assert int(blocked["Retry-After"]) == 900

    # The owner, from their own address, still gets in, and that clears their own count.
    owner = visitor("203.0.113.50")
    ok = owner.post("/api/v1/auth/login", {**body, "password": "mayas-own-pass-1"}, format="json")
    assert ok.status_code == 200


@override_settings(API_THROTTLING=True)
def test_a_flood_of_failures_from_many_addresses_locks_the_account_for_an_hour():
    make_user("maya@example.com", password="mayas-own-pass-1")
    for n in range(50):
        visitor(f"198.51.100.{n}").post(
            "/api/v1/auth/login", {"email": "maya@example.com", "password": "guess"}, format="json"
        )
    response = visitor("203.0.113.50").post(
        "/api/v1/auth/login", {"email": "maya@example.com", "password": "mayas-own-pass-1"}, format="json"
    )
    assert response.status_code == 429 and "wait an hour" in response.json()["message"]


@override_settings(API_THROTTLING=True)
def test_password_reset_emails_are_capped_per_inbox_without_blocking_the_owner():
    make_user("maya@example.com")
    for n in range(6):  # from six different addresses
        response = visitor(f"198.51.100.{n}").post(
            "/api/v1/auth/password-reset", {"email": "maya@example.com"}, format="json"
        )
        assert response.status_code == 202
    assert len(mail.outbox) == 3


@override_settings(API_THROTTLING=True)
def test_back_office_sign_in_is_rate_limited(client):
    from django.core.cache import cache

    make_user("admin@example.com", "Admin", password="right-pass-123", is_staff=True, is_superuser=True)
    for _ in range(10):
        response = client.post(
            "/backoffice/login/",
            {"username": "admin@example.com", "password": "wrong"},
            REMOTE_ADDR="203.0.113.9",
        )
        assert response.status_code == 200  # the form again, with an error
    blocked = client.post(
        "/backoffice/login/",
        {"username": "admin@example.com", "password": "right-pass-123"},
        REMOTE_ADDR="203.0.113.9",
    )
    assert blocked.status_code == 429
    cache.clear()
    ok = client.post(
        "/backoffice/login/",
        {"username": "admin@example.com", "password": "right-pass-123"},
        REMOTE_ADDR="203.0.113.9",
    )
    assert ok.status_code == 302


def test_reviewer_payload_flags():
    reviewer = make_reviewer()
    data = client_for(reviewer).get("/api/v1/me").json()["user"]
    assert data["isReviewer"] is True and data["role"] == "reviewer"
