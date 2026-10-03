import csv
import io
from datetime import timedelta

import pytest
from django.core import mail
from django.utils import timezone

from apps.applications.models import Application
from apps.applications.tasks import send_overdue_digest

from .conftest import client_for, fill_application, make_reviewer, make_user, submit

pytestmark = pytest.mark.django_db


def url(app_id, tail=""):
    return f"/api/v1/admin/applications/{app_id}{tail}"


# ---------------------------------------------------------------- access


def test_non_reviewers_get_404_everywhere_in_the_panel(submitted, founder_client):
    app_id = submitted.pk
    for method, path in [
        ("get", "/api/v1/admin/applications"),
        ("get", url(app_id)),
        ("post", url(app_id, "/decisions")),
        ("put", url(app_id, "/assignee")),
        ("put", url(app_id, "/scorecard")),
        ("post", url(app_id, "/notes")),
        ("get", "/api/v1/admin/export.csv"),
    ]:
        response = getattr(founder_client, method)(path, {}, format="json")
        assert response.status_code == 404, path
        assert response.json() == {"message": "Not found."}


def test_signed_out_gets_401_from_the_panel():
    from rest_framework.test import APIClient

    assert APIClient().get("/api/v1/admin/applications").status_code == 401


def test_unknown_or_malformed_ids_are_404(reviewer_client):
    assert reviewer_client.get(url("not-a-uuid")).status_code == 404
    assert reviewer_client.get(url("00000000-0000-0000-0000-000000000000")).status_code == 404


# ---------------------------------------------------------------- the review page


def test_reviewer_sees_the_full_record(submitted, reviewer_client):
    app = reviewer_client.get(url(submitted.pk)).json()["application"]
    assert app["status"] == "submitted"
    assert app["review"] == {"assigneeId": None, "assigneeName": None, "scorecards": [], "notes": []}
    assert app["slug"] == "ledgerly"


def test_decisions_follow_the_table(submitted, reviewer, reviewer_client, founder_client):
    start = reviewer_client.post(url(submitted.pk, "/decisions"), {"decision": "start_review"}, format="json")
    assert start.status_code == 200
    app = start.json()["application"]
    assert app["status"] == "in_review"
    assert app["review"]["assigneeName"] == "Alex Rivera"  # starting a review claims it
    assert app["events"][-1] == {
        **app["events"][-1],
        "by": "support",
        "kind": "status",
        "title": "Review started",
    }

    # Not allowed from in_review
    again = reviewer_client.post(url(submitted.pk, "/decisions"), {"decision": "start_review"}, format="json")
    assert again.status_code == 409
    assert again.json()["message"].startswith('Someone got there first — this application is now "In review"')

    short = reviewer_client.post(
        url(submitted.pk, "/decisions"), {"decision": "request_changes", "message": "More"}, format="json"
    )
    assert short.status_code == 422
    assert (
        short.json()["errors"]["message"] == "Tell the founder what to change — at least a sentence or two."
    )

    mail.outbox.clear()
    message = "Please add your retention numbers for the last six months."
    changes = reviewer_client.post(
        url(submitted.pk, "/decisions"), {"decision": "request_changes", "message": message}, format="json"
    )
    assert changes.status_code == 200
    founder_view = founder_client.get("/api/v1/me/application").json()["application"]
    assert founder_view["status"] == "changes_requested"
    assert founder_view["events"][-1]["body"] == message
    assert "actor" not in founder_view["events"][-1]
    assert mail.outbox[0].to == ["founder@example.com"] and message in mail.outbox[0].body


def test_unknown_decision(submitted, reviewer_client):
    response = reviewer_client.post(url(submitted.pk, "/decisions"), {"decision": "approve!"}, format="json")
    assert response.status_code == 422 and response.json()["message"] == "Pick a decision."


def test_accept_then_reopen(submitted, reviewer_client):
    assert (
        reviewer_client.post(
            url(submitted.pk, "/decisions"), {"decision": "accept"}, format="json"
        ).status_code
        == 200
    )
    assert Application.objects.get().status == "accepted"
    assert (
        reviewer_client.post(
            url(submitted.pk, "/decisions"), {"decision": "reopen"}, format="json"
        ).status_code
        == 200
    )
    assert Application.objects.get().status == "in_review"


def test_drafts_can_not_be_decided(founder, founder_client, reviewer_client):
    fill_application(founder_client)
    response = reviewer_client.post(url(founder.pk, "/decisions"), {"decision": "accept"}, format="json")
    assert response.status_code == 409


def test_assign_and_unassign(submitted, reviewer, reviewer_client):
    assert reviewer_client.put(url(submitted.pk, "/assignee")).json()["application"]["review"][
        "assigneeId"
    ] == str(reviewer.pk)
    assert (
        reviewer_client.delete(url(submitted.pk, "/assignee")).json()["application"]["review"]["assigneeId"]
        is None
    )


def test_each_reviewer_keeps_one_scorecard_and_the_team_score_averages_them(submitted, reviewer_client):
    first = reviewer_client.put(
        url(submitted.pk, "/scorecard"),
        {"score-problem": "5", "score-team": "3", "recommendation": "interview", "summary": "Good"},
        format="json",
    )
    assert first.status_code == 200
    reviewer_client.put(url(submitted.pk, "/scorecard"), {"scores": {"problem": 4, "team": 4}}, format="json")
    cards = reviewer_client.get(url(submitted.pk)).json()["application"]["review"]["scorecards"]
    assert len(cards) == 1 and cards[0]["scores"] == {"problem": 4, "team": 4}

    other = client_for(make_reviewer("jonas@example.com", "Jonas Weber"))
    other.put(url(submitted.pk, "/scorecard"), {"scores": {"market": 2}}, format="json")
    assert Application.objects.get().team_score == pytest.approx((4 + 2) / 2)


def test_deleting_a_reviewer_drops_their_scores_from_the_team_score(submitted, reviewer_client):
    reviewer_client.put(url(submitted.pk, "/scorecard"), {"scores": {"problem": 5}}, format="json")
    leaving = make_reviewer("jonas@example.com", "Jonas Weber")
    client_for(leaving).put(url(submitted.pk, "/scorecard"), {"scores": {"problem": 1}}, format="json")
    assert Application.objects.get().team_score == pytest.approx(3)

    leaving.delete()  # their scorecard goes with them
    assert Application.objects.get().team_score == pytest.approx(5)


def test_scorecard_validation(submitted, reviewer_client):
    response = reviewer_client.put(
        url(submitted.pk, "/scorecard"),
        {"scores": {"problem": 6, "market": "2.5"}, "recommendation": "maybe", "summary": "x" * 2001},
        format="json",
    )
    assert response.status_code == 422
    assert response.json()["errors"] == {
        "score-problem": "Score from 1 to 5.",
        "score-market": "Score from 1 to 5.",
        "recommendation": "Pick a recommendation.",
        "summary": "Keep this under 2000 characters.",
    }


def test_internal_notes(submitted, reviewer_client):
    assert reviewer_client.post(url(submitted.pk, "/notes"), {"body": ""}, format="json").json()[
        "errors"
    ] == {"body": "Write a note first."}
    response = reviewer_client.post(url(submitted.pk, "/notes"), {"body": "Call references"}, format="json")
    assert response.status_code == 201
    [note] = response.json()["application"]["review"]["notes"]
    assert note["body"] == "Call references" and note["authorName"] == "Alex Rivera"


# ---------------------------------------------------------------- queue


def make_submitted(email, name, startup, *, days_ago=0, stage="traction", industry="Fintech"):
    user = make_user(email, name)
    client = client_for(user)
    fill_application(client)
    client.patch(
        "/api/v1/me/application/startup",
        {"name": startup, "stage": stage, "industry": industry},
        format="json",
    )
    assert submit(client).status_code == 200
    Application.objects.filter(pk=user.pk).update(submitted_at=timezone.now() - timedelta(days=days_ago))
    return user


def test_queue_filters_counts_sorting_and_paging(reviewer, reviewer_client):
    old = make_submitted("a@example.com", "Ana", "Alpha", days_ago=9, stage="mvp")
    make_submitted("b@example.com", "Ben", "Beta", days_ago=2, industry="Education")
    gamma = make_submitted("c@example.com", "Cy", "Gamma", days_ago=1)
    Application.objects.filter(pk=gamma.pk).update(status="in_review", assignee=reviewer)
    make_user("d@example.com", "Dee")  # no application yet
    client_for(make_user("e@example.com", "Eve")).get("/api/v1/me/application")  # a draft

    data = reviewer_client.get("/api/v1/admin/applications").json()
    assert data["filters"]["status"] == "submitted" and data["filters"]["sort"] == "waiting"
    assert [r["startup"] for r in data["rows"]] == ["Alpha", "Beta"]  # longest wait first
    assert data["counts"] == {
        "submitted": 2,
        "in_review": 1,
        "changes_requested": 0,
        "accepted": 0,
        "declined": 0,
        "draft": 1,
        "all": 4,
    }
    assert data["summary"] == {"waiting": 2, "overdue": 1, "mineInReview": 1}
    row = data["rows"][0]
    assert row["overdue"] is True and row["waiting"] == 9 and row["email"] == "a@example.com"
    assert row["id"] == str(old.pk) and row["percent"] == 100

    assert [r["startup"] for r in reviewer_client.get("/api/v1/admin/applications?q=bet").json()["rows"]] == [
        "Beta"
    ]
    assert reviewer_client.get("/api/v1/admin/applications?stage=mvp").json()["counts"]["submitted"] == 1
    assert reviewer_client.get("/api/v1/admin/applications?industry=Education").json()["total"] == 1
    mine = reviewer_client.get("/api/v1/admin/applications?status=all&mine=1").json()
    assert [r["startup"] for r in mine["rows"]] == ["Gamma"]
    by_name = reviewer_client.get("/api/v1/admin/applications?status=all&sort=name").json()["rows"]
    assert [r["startup"] for r in by_name] == ["Alpha", "Beta", "Gamma", ""]  # unnamed last

    paged = reviewer_client.get("/api/v1/admin/applications?status=all&pageSize=2&page=2").json()
    assert paged["page"] == 2 and paged["pages"] == 2 and len(paged["rows"]) == 2
    nonsense = reviewer_client.get("/api/v1/admin/applications?status=bogus&sort=bogus&page=-4").json()
    assert nonsense["filters"]["status"] == "submitted" and nonsense["page"] == 1


def test_overdue_digest_emails_each_reviewer(reviewer):
    make_reviewer("jonas@example.com", "Jonas")
    make_submitted("a@example.com", "Ana", "Alpha", days_ago=6)
    mail.outbox.clear()
    assert send_overdue_digest() == 1
    assert sorted(m.to[0] for m in mail.outbox) == ["jonas@example.com", "reviewer@example.com"]
    assert "Alpha" in mail.outbox[0].body


# ---------------------------------------------------------------- export


def test_csv_export_escapes_and_neutralises_formulas(founder_client, submitted, reviewer_client):
    Application.objects.update(
        startup={
            **Application.objects.get().startup,
            "name": '=HYPERLINK("http://evil.example","x")',
            "tagline": '+1 more, with "quotes"\nand a line break',
            "problem": "-minus",
            "solution": "@at",
        }
    )
    response = reviewer_client.get("/api/v1/admin/export.csv")
    assert response.status_code == 200
    assert response["Content-Type"] == "text/csv; charset=utf-8"
    assert response["Cache-Control"] == "no-store"
    assert response["Content-Disposition"].startswith('attachment; filename="fundup-club-applications-')
    body = b"".join(response.streaming_content).decode()
    assert body.startswith("﻿")
    rows = list(csv.reader(io.StringIO(body.lstrip("﻿"))))
    header, row = rows[0], rows[1]
    assert len(header) == 33
    record = dict(zip(header, row, strict=True))
    assert record["Startup"] == '\'=HYPERLINK("http://evil.example","x")'
    assert record["One-line pitch"] == '\'+1 more, with "quotes"\nand a line break'
    assert record["Problem"] == "'-minus" and record["Solution"] == "'@at"
    assert record["Email"] == "founder@example.com" and record["Status"] == "Submitted"
