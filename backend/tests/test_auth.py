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
    existing = make_user("lena@example.com")
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

    for bad in ({**claims, "aud": "someone-else"}, {**claims, "email_verified": False}, {**claims, "exp": 1}):
        with mock.patch("apps.accounts.google.requests.post", return_value=google_response(bad)):
            assert APIClient().post("/api/v1/auth/google", {"code": "abc"}, format="json").status_code == 400


def test_google_sign_in_reports_missing_configuration():
    response = APIClient().post("/api/v1/auth/google", {"code": "abc"}, format="json")
    assert response.status_code == 503


# ---------------------------------------------------------------- rate limits


@override_settings(API_THROTTLING=True)
def test_login_is_rate_limited_per_address():
    client = APIClient()
    for _ in range(10):
        client.post("/api/v1/auth/login", {"email": "a@example.com", "password": "x"}, format="json")
    response = client.post("/api/v1/auth/login", {"email": "a@example.com", "password": "x"}, format="json")
    assert response.status_code == 429
    assert response.json()["message"].startswith("Too many attempts")
    assert int(response["Retry-After"]) > 0


def test_reviewer_payload_flags():
    reviewer = make_reviewer()
    data = client_for(reviewer).get("/api/v1/me").json()["user"]
    assert data["isReviewer"] is True and data["role"] == "reviewer"
