import pytest
from rest_framework.test import APIClient

from apps.applications.models import Application

from .conftest import client_for, fill_application, make_user, submit

pytestmark = pytest.mark.django_db

PRIVATE_MARKERS = [
    "founder@example.com",  # emails
    "+44 20 7946 0000",  # phone
    "21000",  # monthly revenue
    "1200000",  # seeking
    "250000",  # raised
    "Hiring two engineers",  # use of funds
    "docsend.example",  # deck
    '"equity"',
    "Search",  # how they heard of us
]


def test_drafts_never_appear(founder_client):
    fill_application(founder_client)
    data = APIClient().get("/api/v1/startups").json()
    assert data == {"startups": [], "count": 0}


def test_submitted_startups_are_listed_without_private_fields(submitted):
    data = APIClient().get("/api/v1/startups").json()
    [card] = data["startups"]
    assert card["slug"] == "ledgerly" and card["status"] == "applied" and card["stageLabel"] == "Traction"
    assert card["founders"] == ["Maya Rosen"] and card["users"] == 1400 and card["customers"] == 140

    detail = APIClient().get("/api/v1/startups/ledgerly")
    assert detail.status_code == 200
    raw = detail.content.decode()
    for marker in PRIVATE_MARKERS:
        assert marker not in raw, marker
    startup = detail.json()["startup"]
    assert startup["applicant"]["name"] == "Maya Rosen"
    assert startup["timeline"][0]["title"] == "Application submitted for review"
    assert "body" not in startup["timeline"][0]


def test_review_messages_stay_private_on_the_public_page(submitted, reviewer_client):
    reviewer_client.post(
        f"/api/v1/admin/applications/{submitted.pk}/decisions",
        {"decision": "request_changes", "message": "PRIVATE-MESSAGE for the founder only, please."},
        format="json",
    )
    raw = APIClient().get("/api/v1/startups/ledgerly").content.decode()
    assert "PRIVATE-MESSAGE" not in raw
    assert APIClient().get("/api/v1/startups").json()["startups"][0]["status"] == "review"


def test_public_status_mapping(submitted):
    for status, public in [("accepted", "cohort"), ("in_review", "review"), ("declined", "passed")]:
        Application.objects.update(status=status)
        Application.objects.get().save()  # signals refresh the cached list
        assert APIClient().get("/api/v1/startups").json()["startups"][0]["status"] == public


def test_same_name_gets_a_numbered_address_and_withdrawing_hides_it(submitted):
    other = make_user("other@example.com", "Other Founder")
    client = client_for(other)
    fill_application(client)
    assert submit(client).status_code == 200
    assert Application.objects.get(pk=other.pk).slug == "ledgerly-2"
    assert APIClient().get("/api/v1/startups").json()["count"] == 2

    client.post("/api/v1/me/application/withdraw")
    assert APIClient().get("/api/v1/startups").json()["count"] == 1
    assert APIClient().get("/api/v1/startups/ledgerly-2").status_code == 404


def test_renaming_and_resubmitting_moves_the_address(submitted, founder_client):
    founder_client.post("/api/v1/me/application/withdraw")
    founder_client.patch("/api/v1/me/application/startup", {"name": "Closewise"}, format="json")
    submit(founder_client)
    assert Application.objects.get().slug == "closewise"
    assert APIClient().get("/api/v1/startups/closewise").status_code == 200


def test_unknown_slug_is_404():
    assert APIClient().get("/api/v1/startups/nope").status_code == 404


def test_options_lists():
    data = APIClient().get("/api/v1/options").json()
    assert data["stages"][0] == {
        "id": "idea",
        "label": "Discover",
        "hint": "Exploring a problem, no product yet",
    }
    assert len(data["industries"]) == 12 and len(data["businessModels"]) == 8
    assert {d["id"] for d in data["decisions"]} == {
        "start_review",
        "request_changes",
        "accept",
        "decline",
        "reopen",
    }
