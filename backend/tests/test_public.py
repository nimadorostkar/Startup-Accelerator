import uuid
from datetime import UTC, timedelta
from unittest import mock

import pytest
from django.conf import settings
from django.test import Client
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.applications.models import Application, slugify
from apps.content.models import CONTACT_TOPICS

from .conftest import COMPLETE_STARTUP, client_for, fill_application, make_user, submit

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
    assert data["contactTopics"] == CONTACT_TOPICS  # the contact form's list, from the one source
    assert {d["id"] for d in data["decisions"]} == {
        "start_review",
        "request_changes",
        "accept",
        "decline",
        "reopen",
    }


# ---------------------------------------------------------------- the submitted version


def request_changes(app_id, reviewer_client):
    response = reviewer_client.post(
        f"/api/v1/admin/applications/{app_id}/decisions",
        {"decision": "request_changes", "message": "Please tighten the pitch and the problem."},
        format="json",
    )
    assert response.status_code == 200


def test_edits_while_changes_are_requested_stay_private_until_resubmitted(
    submitted, founder_client, reviewer_client
):
    request_changes(submitted.pk, reviewer_client)
    edit = {"name": "Closewise", "tagline": "DRAFT-TAGLINE not yet submitted"}
    assert founder_client.patch("/api/v1/me/application/startup", edit, format="json").status_code == 200
    founder_client.patch("/api/v1/me/application/profile", {"fullName": "Draft Name"}, format="json")

    [card] = APIClient().get("/api/v1/startups").json()["startups"]
    assert card["name"] == "Ledgerly" and card["slug"] == "ledgerly" and card["status"] == "review"
    assert card["founder"]["name"] == "Maya Rosen"
    page = APIClient().get("/api/v1/startups/ledgerly")
    assert page.status_code == 200 and "DRAFT-TAGLINE" not in page.content.decode()
    assert page.json()["startup"]["tagline"] == COMPLETE_STARTUP["tagline"]

    # Even an emptied name doesn't take it out of the directory meanwhile.
    founder_client.patch("/api/v1/me/application/startup", {"name": ""}, format="json")
    assert APIClient().get("/api/v1/startups").json()["count"] == 1

    founder_client.patch("/api/v1/me/application/startup", {"name": "Closewise"}, format="json")
    assert submit(founder_client).status_code == 200
    [card] = APIClient().get("/api/v1/startups").json()["startups"]
    assert card["name"] == "Closewise" and card["tagline"] == "DRAFT-TAGLINE not yet submitted"
    assert card["slug"] == "closewise"


def test_resubmitting_keeps_the_first_applied_date_and_place(submitted, founder_client, reviewer_client):
    first = Application.objects.get(pk=submitted.pk)
    earlier = first.first_submitted_at - timedelta(days=10)
    Application.objects.filter(pk=submitted.pk).update(first_submitted_at=earlier, submitted_at=earlier)

    other = make_user("other@example.com", "Other Founder")
    other_client = client_for(other)
    fill_application(other_client)
    other_client.patch("/api/v1/me/application/startup", {"name": "Newco"}, format="json")
    assert submit(other_client).status_code == 200

    request_changes(submitted.pk, reviewer_client)
    assert submit(founder_client).status_code == 200
    app = Application.objects.get(pk=submitted.pk)
    assert app.first_submitted_at == earlier and app.submitted_at > earlier  # the queue's clock restarts

    cards = APIClient().get("/api/v1/startups").json()["startups"]
    assert [c["slug"] for c in cards] == ["newco", "ledgerly"]  # newest first submission first
    assert cards[1]["appliedAt"] == earlier.astimezone(UTC).isoformat(timespec="milliseconds").replace(
        "+00:00", "Z"
    )


def test_cards_and_pages_carry_the_last_change_time(submitted):
    [card] = APIClient().get("/api/v1/startups").json()["startups"]
    page = APIClient().get("/api/v1/startups/ledgerly").json()["startup"]
    assert card["updated"] and card["updated"].endswith("Z") and page["updated"] == card["updated"]


# ---------------------------------------------------------------- deactivated founders


def test_a_deactivated_founders_startup_leaves_the_directory(submitted):
    assert APIClient().get("/api/v1/startups").json()["count"] == 1  # now cached
    submitted.is_active = False
    submitted.save()
    assert APIClient().get("/api/v1/startups").json()["count"] == 0
    assert APIClient().get("/api/v1/startups/ledgerly").status_code == 404

    user = User.objects.get(pk=submitted.pk)  # a fresh load, as the back office does
    user.is_active = True
    user.save(update_fields=["is_active"])
    assert APIClient().get("/api/v1/startups").json()["count"] == 1


def test_saving_a_user_without_touching_is_active_leaves_the_directory_alone(submitted):
    user = User.objects.get(pk=submitted.pk)
    with mock.patch("apps.applications.directory.invalidate") as invalidate:
        user.name = "Maya R."
        user.save()
        user.save(update_fields=["last_login"])
    invalidate.assert_not_called()


# ---------------------------------------------------------------- addresses


def test_an_address_fixed_in_the_back_office_survives_resubmission(
    submitted, founder_client, reviewer_client
):
    staff = User.objects.create_superuser("staff@example.com", "Staff", "sup3r-Secret")
    admin = Client()
    admin.force_login(staff)
    app = Application.objects.get(pk=submitted.pk)
    url = f"/{settings.ADMIN_URL}applications/application/{app.pk}/change/"
    inlines = {
        f"{prefix}-{key}": "0"
        for prefix in ["events", "scorecards", "notes"]
        for key in ["TOTAL_FORMS", "INITIAL_FORMS"]
    }
    response = admin.post(url, {"slug": "ledgerly-app", **inlines})
    assert response.status_code == 302, response.content.decode()[:2000]
    assert Application.objects.get(pk=app.pk).slug == "ledgerly-app"

    request_changes(app.pk, reviewer_client)
    founder_client.patch("/api/v1/me/application/startup", {"tagline": "Sharper pitch"}, format="json")
    assert submit(founder_client).status_code == 200
    assert Application.objects.get(pk=app.pk).slug == "ledgerly-app"

    # A rename makes a new one.
    request_changes(app.pk, reviewer_client)
    founder_client.patch("/api/v1/me/application/startup", {"name": "Closewise"}, format="json")
    assert submit(founder_client).status_code == 200
    assert Application.objects.get(pk=app.pk).slug == "closewise"


@pytest.mark.parametrize(
    ("name", "expected"),
    [
        ("Café Nova!", "cafe-nova"),
        ("Straße & Søn", "strasse-son"),
        ("Łódź Labs", "lodz-labs"),
        ("  --Ledgerly--  ", "ledgerly"),
        ("x" * 80, "x" * 70),
    ],
)
def test_slugify_folds_to_ascii(name, expected):
    assert slugify(name) == expected


def test_slugify_falls_back_to_the_application_id():
    key = uuid.UUID("1a2b3c4d-5e6f-4a1b-8c9d-0e1f2a3b4c5d")
    assert slugify("東京ラボ", key) == "startup-1a2b3c4d"
    assert slugify("Ёлка", str(key)) == "startup-1a2b3c4d"
    assert slugify("🚀🚀", key) == "startup-1a2b3c4d"
    assert slugify("東京ラボ") == "startup"


def test_non_latin_names_get_distinct_addresses(submitted, founder_client):
    founder_client.post("/api/v1/me/application/withdraw")
    founder_client.patch("/api/v1/me/application/startup", {"name": "東京ラボ"}, format="json")
    assert submit(founder_client).status_code == 200

    other = make_user("other@example.com", "Other Founder")
    other_client = client_for(other)
    fill_application(other_client)
    other_client.patch("/api/v1/me/application/startup", {"name": "Ёлка"}, format="json")
    assert submit(other_client).status_code == 200

    mine, theirs = Application.objects.get(pk=submitted.pk).slug, Application.objects.get(pk=other.pk).slug
    assert mine == f"startup-{submitted.pk.hex[:8]}" and theirs == f"startup-{other.pk.hex[:8]}"
    assert APIClient().get(f"/api/v1/startups/{mine}").status_code == 200


def test_backfill_fills_the_new_columns(submitted, founder_client, reviewer_client):
    from importlib import import_module

    from django.apps import apps

    migration = import_module("apps.applications.migrations.0004_backfill_public_snapshot")
    first_event = Application.objects.get(pk=submitted.pk).events.get(kind="submitted").at
    request_changes(submitted.pk, reviewer_client)
    assert submit(founder_client).status_code == 200
    Application.objects.filter(pk=submitted.pk).update(
        public_snapshot={}, first_submitted_at=None, slug_source=""
    )
    migration.forwards(apps, None)
    app = Application.objects.get(pk=submitted.pk)
    assert app.public_snapshot["startup"]["name"] == "Ledgerly"
    assert app.first_submitted_at == first_event < app.submitted_at
    assert app.slug_source == "Ledgerly"
