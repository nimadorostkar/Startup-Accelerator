import pytest
from django.core.cache import cache
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import AuthSession, User

ORIGIN = "http://testserver.local"

COMPLETE_PROFILE = {
    "fullName": "Maya Rosen",
    "title": "CEO & co-founder",
    "country": "United Kingdom",
    "city": "London",
    "linkedin": "linkedin.com/in/maya-rosen",
    "commitment": "full-time",
    "experienceYears": "6",
    "phone": "+44 20 7946 0000",
    "heardFrom": "Search",
    "bio": "Former agency finance lead who closed the books for 40 agencies and hated every month of it.",
}

COMPLETE_STARTUP = {
    "name": "Ledgerly",
    "tagline": "Month-end close for agencies, done in a day",
    "website": "ledgerly.example",
    "industry": "Fintech",
    "businessModel": "Subscription (B2B)",
    "country": "United Kingdom",
    "foundedOn": "2024-03",
    "incorporated": "yes",
    "stage": "traction",
    "problem": "Creative agencies spend six to nine days closing each month because hours and expenses live in four tools.",
    "solution": "Ledgerly connects time tracking, billing and banking and closes the month automatically, with a review step.",
    "targetCustomer": "Agencies with 10–200 staff",
    "marketSize": "40k agencies in the UK and US",
    "competitors": "Spreadsheets, Xero add-ons",
    "advantage": "We were agency finance leads; our templates encode years of closes.",
    "activeUsers": "1,400",
    "payingCustomers": "140",
    "monthlyRevenue": "21000",
    "growthRate": "12.5",
    "keyMetric": "Close time down from 7 days to 1",
    "raisedToDate": "250000",
    "seeking": "1,200,000",
    "useOfFunds": "Hiring two engineers",
    "deckUrl": "docsend.example/ledgerly",
    "demoUrl": "",
    "videoUrl": "",
}

COMPLETE_TEAM = {
    "workedTogether": "1–3 years",
    "whyUs": "We ran finance at agencies for a decade and built the internal tool that became Ledgerly.",
    "hiringNeeds": "A senior backend engineer",
}


@pytest.fixture(autouse=True)
def _run_on_commit_now(monkeypatch):
    """Tests run inside a transaction that never commits, so on-commit work
    (queued emails, cache refreshes) would never happen. Run it straight away."""

    def run_now(func, using=None, robust=False):
        func()

    monkeypatch.setattr("django.db.transaction.on_commit", run_now)


@pytest.fixture(autouse=True)
def _clear_cache():
    cache.clear()
    yield
    cache.clear()


def make_user(email="founder@example.com", name="Maya Rosen", password="sup3r-Secret", **extra) -> User:
    return User.objects.create_user(email, name, password, **extra)


def make_reviewer(email="reviewer@example.com", name="Alex Rivera") -> User:
    return make_user(email, name, role=User.Role.REVIEWER, email_verified_at=timezone.now())


def client_for(user: User | None = None) -> APIClient:
    client = APIClient()
    if user is not None:
        _, token = AuthSession.start(user, remember=False, ip="127.0.0.1", user_agent="tests")
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        client.token = token
    return client


def fill_application(client: APIClient) -> None:
    assert client.patch("/api/v1/me/application/profile", COMPLETE_PROFILE, format="json").status_code == 200
    assert client.patch("/api/v1/me/application/startup", COMPLETE_STARTUP, format="json").status_code == 200
    assert client.patch("/api/v1/me/application/team", COMPLETE_TEAM, format="json").status_code == 200
    members = client.get("/api/v1/me/application").json()["application"]["team"]["members"]
    member_id = members[0]["id"]
    body = {**members[0], "role": "CEO", "equity": 60, "isFounder": True}
    assert (
        client.patch(f"/api/v1/me/application/team/members/{member_id}", body, format="json").status_code
        == 200
    )


def submit(client: APIClient):
    return client.post("/api/v1/me/application/submit", {"confirm": True}, format="json")


@pytest.fixture
def founder(db):
    return make_user()


@pytest.fixture
def reviewer(db):
    return make_reviewer()


@pytest.fixture
def founder_client(founder):
    return client_for(founder)


@pytest.fixture
def reviewer_client(reviewer):
    return client_for(reviewer)


@pytest.fixture
def submitted(founder, founder_client):
    """A founder with a complete, submitted application."""
    fill_application(founder_client)
    assert submit(founder_client).status_code == 200
    return founder
