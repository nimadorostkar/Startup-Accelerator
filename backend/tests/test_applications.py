import json

import pytest
from django.core import mail

from apps.applications.models import Application, InternalNote, Scorecard

from .conftest import COMPLETE_STARTUP, client_for, fill_application, make_user, submit

pytestmark = pytest.mark.django_db


def app_of(client):
    return client.get("/api/v1/me/application").json()["application"]


# ---------------------------------------------------------------- first visit


def test_first_visit_creates_a_blank_draft_with_the_applicant_as_founder(founder, founder_client):
    app = app_of(founder_client)
    assert app["status"] == "draft"
    assert app["profile"]["fullName"] == "Maya Rosen"
    assert app["profile"]["email"] == "founder@example.com"
    [member] = app["team"]["members"]
    assert member["isFounder"] and member["name"] == "Maya Rosen"
    assert [e["kind"] for e in app["events"]] == ["created"]
    assert app["progress"]["percent"] == 10  # full name + at least one founder: 2 of 21
    assert Application.objects.count() == 1
    assert app_of(founder_client)["userId"] == app["userId"]  # created once


def test_signed_out_visitors_get_401():
    from rest_framework.test import APIClient

    assert APIClient().get("/api/v1/me/application").status_code == 401


# ---------------------------------------------------------------- saving sections


def test_profile_save_normalises_and_never_takes_the_email_from_the_form(founder_client):
    response = founder_client.patch(
        "/api/v1/me/application/profile",
        {"linkedin": "linkedin.com/in/maya", "experienceYears": "6", "email": "hacker@evil.example"},
        format="json",
    )
    assert response.status_code == 200
    profile = response.json()["application"]["profile"]
    assert profile["linkedin"] == "https://linkedin.com/in/maya"
    assert profile["experienceYears"] == 6
    assert profile["email"] == "founder@example.com"
    assert "email" not in Application.objects.get().profile


@pytest.mark.parametrize(
    ("body", "field", "message"),
    [
        ({"phone": "12ab"}, "phone", "Enter a phone number with country code, e.g. +1 415 555 0100."),
        ({"linkedin": "twitter.com/maya"}, "linkedin", "Use your LinkedIn profile link (linkedin.com/in/…)."),
        # Mentioning LinkedIn isn't enough: the link is public, so it must go there.
        (
            {"linkedin": "evil.example/linkedin.com/in/x"},
            "linkedin",
            "Use your LinkedIn profile link (linkedin.com/in/…).",
        ),
        (
            {"linkedin": "notlinkedin.com/in/x"},
            "linkedin",
            "Use your LinkedIn profile link (linkedin.com/in/…).",
        ),
        ({"experienceYears": "61"}, "experienceYears", "That's more than 60 years."),
        ({"experienceYears": "-1"}, "experienceYears", "Enter a positive number."),
        ({"commitment": "weekends"}, "commitment", "Pick an option."),
        ({"bio": "x" * 1201}, "bio", "Keep this under 1200 characters."),
    ],
)
def test_profile_validation_messages(founder_client, body, field, message):
    response = founder_client.patch("/api/v1/me/application/profile", body, format="json")
    assert response.status_code == 422
    assert response.json()["errors"][field] == message
    assert response.json()["message"] == "Some fields need another look — they're highlighted below."


@pytest.mark.parametrize(
    ("body", "field", "message"),
    [
        ({"website": "not a link"}, "website", "That doesn't look like a valid link."),
        ({"industry": "Crypto"}, "industry", "Pick an industry."),
        ({"stage": "unicorn"}, "stage", "Pick a stage."),
        ({"foundedOn": "2999-01"}, "foundedOn", "Pick a month that isn't in the future."),
        ({"foundedOn": "2024-13"}, "foundedOn", "Pick a month that isn't in the future."),
        ({"growthRate": "1001"}, "growthRate", "That looks too high — use % per month."),
        ({"monthlyRevenue": "lots"}, "monthlyRevenue", "Enter a positive number."),
        # 1e21 would come back from JavaScript as "1e+21" and block every later save.
        ({"activeUsers": "1000000000000000000000"}, "activeUsers", "That number is too large."),
        ({"seeking": 10**13}, "seeking", "That number is too large."),
        ({"activeUsers": "1.200"}, "activeUsers", "Enter a whole number."),
        ({"payingCustomers": "1.5"}, "payingCustomers", "Enter a whole number."),
        ({"businessModel": "Vibes"}, "businessModel", "Pick a model."),
    ],
)
def test_startup_validation_messages(founder_client, body, field, message):
    response = founder_client.patch("/api/v1/me/application/startup", body, format="json")
    assert response.status_code == 422
    assert response.json()["errors"][field] == message


def test_startup_save_parses_numbers_and_links(founder_client):
    response = founder_client.patch("/api/v1/me/application/startup", COMPLETE_STARTUP, format="json")
    startup = response.json()["application"]["startup"]
    assert startup["activeUsers"] == 1400 and startup["seeking"] == 1_200_000
    assert startup["growthRate"] == 12.5
    assert startup["website"] == "https://ledgerly.example"
    assert startup["deckUrl"] == "https://docsend.example/ledgerly"


def test_line_breaks_count_once_and_are_stored_as_newlines(founder_client):
    # Browsers send textarea line breaks as \r\n; the website's counter sees one character each.
    bio = "\r\n".join(["x" * 59] * 20)  # 59 * 20 + 19 = 1199 characters as the founder sees it
    response = founder_client.patch("/api/v1/me/application/profile", {"bio": bio}, format="json")
    assert response.status_code == 200
    assert response.json()["application"]["profile"]["bio"] == bio.replace("\r\n", "\n")


def test_linkedin_subdomains_are_fine(founder_client):
    response = founder_client.patch(
        "/api/v1/me/application/profile", {"linkedin": "uk.linkedin.com/in/maya"}, format="json"
    )
    assert response.json()["application"]["profile"]["linkedin"] == "https://uk.linkedin.com/in/maya"


def test_partial_saves_keep_other_answers(founder_client):
    founder_client.patch("/api/v1/me/application/startup", COMPLETE_STARTUP, format="json")
    founder_client.patch("/api/v1/me/application/startup", {"tagline": "New pitch"}, format="json")
    startup = app_of(founder_client)["startup"]
    assert startup["tagline"] == "New pitch" and startup["name"] == "Ledgerly"


# ---------------------------------------------------------------- team


def test_team_members_add_edit_remove(founder_client):
    created = founder_client.post(
        "/api/v1/me/application/team/members",
        {
            "name": "Tom Achebe",
            "role": "CTO",
            "equity": "40",
            "isFounder": "on",
            "linkedin": "linkedin.com/in/tom",
        },
        format="json",
    )
    assert created.status_code == 201
    member_id = created.json()["memberId"]
    members = created.json()["application"]["team"]["members"]
    assert [m["name"] for m in members] == ["Maya Rosen", "Tom Achebe"]
    assert members[1]["linkedin"] == "https://linkedin.com/in/tom" and members[1]["isFounder"] is True

    edited = founder_client.patch(
        f"/api/v1/me/application/team/members/{member_id}", {"role": "CTO & co-founder"}, format="json"
    )
    tom = edited.json()["application"]["team"]["members"][1]
    assert tom["role"] == "CTO & co-founder" and tom["equity"] == 40  # partial edit keeps the rest

    assert founder_client.delete(f"/api/v1/me/application/team/members/{member_id}").status_code == 200
    assert len(app_of(founder_client)["team"]["members"]) == 1


def test_member_validation_and_the_last_member_stays(founder_client):
    bad = founder_client.post("/api/v1/me/application/team/members", {"name": "", "role": ""}, format="json")
    assert bad.status_code == 422
    assert bad.json()["errors"] == {"name": "Add their name.", "role": "Add their role, e.g. CTO."}

    [only] = app_of(founder_client)["team"]["members"]
    last = founder_client.delete(f"/api/v1/me/application/team/members/{only['id']}")
    assert last.status_code == 409

    missing = founder_client.delete(
        "/api/v1/me/application/team/members/00000000-0000-0000-0000-000000000000"
    )
    assert missing.status_code == 404


def test_equity_can_not_exceed_100_percent(founder_client):
    [me] = app_of(founder_client)["team"]["members"]
    founder_client.patch(
        f"/api/v1/me/application/team/members/{me['id']}", {"role": "CEO", "equity": 60}, format="json"
    )
    response = founder_client.post(
        "/api/v1/me/application/team/members", {"name": "Tom", "role": "CTO", "equity": 50}, format="json"
    )
    assert response.status_code == 422
    assert response.json()["errors"]["equity"] == "That brings team equity to 110% — it can't exceed 100%."
    assert len(app_of(founder_client)["team"]["members"]) == 1  # nothing written


def test_equity_just_past_100_is_not_reported_as_100(founder_client):
    [me] = app_of(founder_client)["team"]["members"]
    founder_client.patch(
        f"/api/v1/me/application/team/members/{me['id']}", {"role": "CEO", "equity": 100}, format="json"
    )
    response = founder_client.post(
        "/api/v1/me/application/team/members", {"name": "Tom", "role": "CTO", "equity": 0.004}, format="json"
    )
    assert (
        response.json()["errors"]["equity"] == "That brings team equity to 100.004% — it can't exceed 100%."
    )


def test_equity_that_adds_up_to_exactly_100_is_fine_despite_float_rounding(founder_client):
    [me] = app_of(founder_client)["team"]["members"]
    founder_client.patch(
        f"/api/v1/me/application/team/members/{me['id']}", {"role": "CEO", "equity": 33.3}, format="json"
    )
    for name, equity in (("Tom", 33.3), ("Ife", 33.4)):
        response = founder_client.post(
            "/api/v1/me/application/team/members",
            {"name": name, "role": "Co-founder", "equity": equity},
            format="json",
        )
        assert response.status_code == 201, response.json()


# ---------------------------------------------------------------- submit and withdraw


def test_submitting_with_missing_answers_is_refused(founder_client):
    founder_client.patch("/api/v1/me/application/startup", {"name": "Ledgerly"}, format="json")
    response = submit(founder_client)
    assert response.status_code == 422
    body = response.json()
    assert body["message"] == "18 required answers are still missing."
    assert {"section": "startup", "field": "problem", "label": "Problem"} in body["missing"]
    assert app_of(founder_client)["status"] == "draft"


def test_short_answers_do_not_count(founder_client):
    fill_application(founder_client)
    founder_client.patch("/api/v1/me/application/startup", {"problem": "Too short"}, format="json")
    response = submit(founder_client)
    assert response.status_code == 422
    assert response.json()["missing"] == [
        {"section": "startup", "field": "problem", "label": "Problem", "reason": "71 more characters needed"}
    ]


def test_submit_needs_the_confirmation(founder_client):
    fill_application(founder_client)
    response = founder_client.post("/api/v1/me/application/submit", {}, format="json")
    assert response.status_code == 422
    assert response.json()["errors"] == {"confirm": "Please confirm the details are accurate."}


def test_submit_locks_the_application_and_notifies(founder_client, reviewer):
    fill_application(founder_client)
    response = submit(founder_client)
    assert response.status_code == 200
    app = response.json()["application"]
    assert app["status"] == "submitted" and app["submittedAt"]
    assert app["events"][-1]["title"] == "Application submitted for review"
    assert Application.objects.get().slug == "ledgerly"

    recipients = sorted(m.to[0] for m in mail.outbox)
    assert recipients == ["founder@example.com", "reviewer@example.com"]
    assert "New application: Ledgerly" in [m.subject for m in mail.outbox]


@pytest.mark.parametrize("status", ["submitted", "in_review", "accepted", "declined"])
def test_saves_are_refused_while_with_the_review_team(founder_client, status):
    fill_application(founder_client)
    Application.objects.update(status=status)
    before = json.dumps(Application.objects.values("profile", "startup", "team").get(), sort_keys=True)

    for method, url, body in [
        ("patch", "/api/v1/me/application/profile", {"fullName": "Changed"}),
        ("patch", "/api/v1/me/application/startup", {"name": "Changed"}),
        ("patch", "/api/v1/me/application/team", {"whyUs": "Changed"}),
        ("post", "/api/v1/me/application/team/members", {"name": "New", "role": "CTO"}),
    ]:
        response = getattr(founder_client, method)(url, body, format="json")
        assert response.status_code == 409
        assert (
            response.json()["message"]
            == "This application is with the review team and can't be edited right now."
        )

    after = json.dumps(Application.objects.values("profile", "startup", "team").get(), sort_keys=True)
    assert before == after


def test_withdraw_only_before_review_starts(submitted, founder_client):
    response = founder_client.post("/api/v1/me/application/withdraw")
    assert response.status_code == 200
    app = response.json()["application"]
    assert app["status"] == "draft" and app["submittedAt"] is None
    assert app["events"][-1]["kind"] == "withdrawn"

    assert submit(founder_client).status_code == 200
    Application.objects.update(status="in_review")
    refused = founder_client.post("/api/v1/me/application/withdraw")
    assert refused.status_code == 409
    assert refused.json()["message"] == "Review has already started, so this can't be withdrawn."

    Application.objects.update(status="draft")
    nothing = founder_client.post("/api/v1/me/application/withdraw")
    assert nothing.status_code == 409
    assert nothing.json()["message"] == "This application isn't submitted, so there's nothing to withdraw."


def test_resubmitting_after_changes_requested(submitted, founder_client):
    Application.objects.update(status="changes_requested")
    founder_client.patch("/api/v1/me/application/startup", {"tagline": "Sharper pitch"}, format="json")
    response = submit(founder_client)
    assert response.json()["application"]["events"][-1]["title"] == "Application resubmitted"


# ---------------------------------------------------------------- privacy between founders and reviewers


def test_founders_only_ever_see_their_own_application(submitted, founder_client):
    other = make_user("other@example.com", "Other Founder")
    other_client = client_for(other)
    mine = app_of(founder_client)
    theirs = app_of(other_client)
    assert mine["userId"] != theirs["userId"]
    assert theirs["startup"]["name"] == ""  # their own blank draft, not Maya's


def test_founder_payloads_never_contain_reviewer_data(submitted, founder_client, reviewer, reviewer_client):
    app_id = str(submitted.pk)
    reviewer_client.put(f"/api/v1/admin/applications/{app_id}/assignee")
    reviewer_client.put(
        f"/api/v1/admin/applications/{app_id}/scorecard",
        {"scores": {"problem": 5}, "summary": "SECRET-SCORE-SUMMARY"},
        format="json",
    )
    reviewer_client.post(f"/api/v1/admin/applications/{app_id}/notes", {"body": "SECRET-NOTE"}, format="json")

    raw = founder_client.get("/api/v1/me/application").content.decode()
    for marker in (
        "SECRET-NOTE",
        "SECRET-SCORE-SUMMARY",
        '"review"',
        "assignee",
        str(submitted.pk) + '"reviewer',
    ):
        assert marker not in raw
    assert "Alex Rivera" not in raw  # reviewer's name only appears if they write to the founder


def test_founder_saves_leave_reviewer_data_untouched(submitted, founder_client, reviewer, reviewer_client):
    app_id = str(submitted.pk)
    reviewer_client.put(f"/api/v1/admin/applications/{app_id}/assignee")
    reviewer_client.put(
        f"/api/v1/admin/applications/{app_id}/scorecard", {"scores": {"team": 4}}, format="json"
    )
    reviewer_client.post(f"/api/v1/admin/applications/{app_id}/notes", {"body": "Keep me"}, format="json")

    founder_client.post("/api/v1/me/application/withdraw")
    founder_client.patch("/api/v1/me/application/profile", {"title": "CEO"}, format="json")

    app = Application.objects.get()
    assert app.assignee == reviewer
    assert Scorecard.objects.get().team == 4
    assert InternalNote.objects.get().body == "Keep me"


def test_minimum_lengths_count_like_the_website_does(founder_client):
    """JavaScript counts an emoji as two characters; the API must agree, or the dashboard
    would show "ready" and the submit would be refused."""
    fill_application(founder_client)
    founder_client.patch("/api/v1/me/application/profile", {"bio": "🚀" * 30}, format="json")  # 60 in JS
    app = founder_client.get("/api/v1/me/application").json()["application"]
    assert not any(m["field"] == "bio" for m in app["progress"]["missing"])
    assert submit(founder_client).status_code == 200


def test_founded_month_allows_a_month_that_has_begun_somewhere():
    from datetime import UTC, datetime

    from apps.applications.rules import parse_startup
    from apps.core.exceptions import Invalid

    # 23:00 UTC on 31 March is already 1 April east of UTC.
    late_march = datetime(2026, 3, 31, 23, 0, tzinfo=UTC)
    assert parse_startup({"foundedOn": "2026-04"}, today=late_march)["foundedOn"] == "2026-04"
    with pytest.raises(Invalid):
        parse_startup({"foundedOn": "2026-05"}, today=late_march)
