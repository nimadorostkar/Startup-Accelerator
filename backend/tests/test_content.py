from datetime import timedelta

import pytest
from django.core import mail
from django.core.management import call_command
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from apps.content import services
from apps.content.models import AgendaItem, ContactMessage, Event, EventRegistration, Post, Subscriber

pytestmark = pytest.mark.django_db


def make_event(slug="info-session", *, days=3, capacity=100, fmt="Online", **extra):
    start = timezone.now() + timedelta(days=days)
    event = Event.objects.create(
        slug=slug,
        title=extra.pop("title", "Info Session"),
        type=extra.pop("type", "Info Session"),
        format=fmt,
        city="Online" if fmt == "Online" else "London",
        start=start,
        end=start + timedelta(hours=1),
        tz="Europe/London",
        capacity=capacity,
        summary="All about the program.",
        about="First paragraph.\n\nSecond paragraph.",
        takeaways="- One\n- Two",
        audience="Founders",
        online_url="https://meet.example/abc",
        **extra,
    )
    AgendaItem.objects.create(event=event, time="9:00 AM", item="Welcome", order=0)
    return event


# ---------------------------------------------------------------- events


def test_event_lists_split_upcoming_and_past():
    make_event("later", days=10)
    make_event("sooner", days=2)
    make_event("ended", days=-5)
    make_event("hidden", days=4, is_published=False)
    client = APIClient()
    assert [e["slug"] for e in client.get("/api/v1/events?when=upcoming").json()["events"]] == [
        "sooner",
        "later",
    ]
    assert [e["slug"] for e in client.get("/api/v1/events?when=past").json()["events"]] == ["ended"]
    assert len(client.get("/api/v1/events").json()["events"]) == 3

    event = client.get("/api/v1/events/sooner").json()["event"]
    assert event["about"] == ["First paragraph.", "Second paragraph."]
    assert event["takeaways"] == ["One", "Two"]
    assert event["agenda"] == [{"time": "9:00 AM", "item": "Welcome"}]
    assert "online_url" not in event and "venue" not in event  # only sent to registered guests
    assert client.get("/api/v1/events/hidden").status_code == 404


def test_registration_new_existing_and_calendar_invite():
    make_event()
    client = APIClient()
    body = {"name": "Lena Ortiz", "email": "Lena@Example.com", "company": "Relaywave"}
    first = client.post("/api/v1/events/info-session/registrations", body, format="json")
    assert first.status_code == 201 and first.json()["existing"] is False
    again = client.post(
        "/api/v1/events/info-session/registrations", {**body, "email": "lena@example.com"}, format="json"
    )
    assert again.status_code == 200 and again.json()["existing"] is True
    assert EventRegistration.objects.count() == 1

    [message] = mail.outbox
    assert message.to == ["lena@example.com"] and "https://meet.example/abc" in message.body
    [(name, content, mimetype)] = message.attachments
    assert name == "invite.ics" and mimetype == "text/calendar"
    text = content if isinstance(content, str) else content.decode()
    assert "BEGIN:VEVENT" in text and "SUMMARY:Info Session" in text


def test_registration_refuses_ended_full_and_unknown_events():
    make_event("ended", days=-1)
    make_event("tiny", capacity=1)
    client = APIClient()
    body = {"name": "Lena Ortiz", "email": "lena@example.com"}
    closed = client.post("/api/v1/events/ended/registrations", body, format="json")
    assert closed.status_code == 409 and closed.json()["message"] == "Registration for this event has closed."
    assert client.post("/api/v1/events/tiny/registrations", body, format="json").status_code == 201
    full = client.post(
        "/api/v1/events/tiny/registrations", {**body, "email": "tom@example.com"}, format="json"
    )
    assert full.status_code == 409 and "full" in full.json()["message"]
    unknown = client.post("/api/v1/events/nope/registrations", body, format="json")
    assert unknown.status_code == 404 and unknown.json()["message"] == "We couldn't find that event."


def test_registration_validation_and_bot_trap():
    make_event()
    client = APIClient()
    bad = client.post("/api/v1/events/info-session/registrations", {"name": "L", "email": "x"}, format="json")
    assert bad.status_code == 422 and set(bad.json()["errors"]) == {"name", "email"}
    bot = client.post(
        "/api/v1/events/info-session/registrations",
        {"name": "Spam Bot", "email": "bot@example.com", "website": "http://spam.example"},
        format="json",
    )
    assert bot.status_code == 201 and EventRegistration.objects.count() == 0


def test_day_before_reminders_go_once():
    event = make_event(days=0.5)
    early = EventRegistration.objects.create(event=event, name="Early Bird", email="early@example.com")
    EventRegistration.objects.filter(pk=early.pk).update(created_at=timezone.now() - timedelta(days=3))
    EventRegistration.objects.create(event=event, name="Late Comer", email="late@example.com")
    assert services.send_reminders() == 1
    assert services.send_reminders() == 0
    assert [m.to for m in mail.outbox] == [["early@example.com"]]


# ---------------------------------------------------------------- newsletter


def test_subscribe_new_existing_and_unsubscribe():
    client = APIClient()
    first = client.post(
        "/api/v1/newsletter/subscribers",
        {"email": "Maya@Example.com", "source": "newsletter-hero"},
        format="json",
    )
    assert first.status_code == 201 and first.json() == {"status": "new"}
    again = client.post("/api/v1/newsletter/subscribers", {"email": "maya@example.com"}, format="json")
    assert again.status_code == 200 and again.json() == {"status": "existing"}

    [welcome] = mail.outbox
    token = welcome.body.split("token=")[1].split()[0]
    import base64

    assert "maya" not in base64.urlsafe_b64decode(token.split(":")[0] + "==").decode(errors="ignore").lower()
    assert client.post("/api/v1/newsletter/unsubscribe", {"token": token}, format="json").json() == {
        "email": "maya@example.com"
    }
    assert Subscriber.objects.get().unsubscribed_at is not None
    assert (
        client.post("/api/v1/newsletter/unsubscribe", {"token": "forged"}, format="json").status_code == 400
    )

    back = client.post("/api/v1/newsletter/subscribers", {"email": "maya@example.com"}, format="json")
    assert back.json() == {"status": "new"} and Subscriber.objects.get().unsubscribed_at is None


def test_subscribe_validation_and_bot_trap():
    client = APIClient()
    bad = client.post("/api/v1/newsletter/subscribers", {"email": "nope"}, format="json")
    assert bad.status_code == 422 and bad.json()["message"] == "That doesn't look like a valid email address."
    client.post("/api/v1/newsletter/subscribers", {"email": "bot@example.com", "website": "x"}, format="json")
    assert Subscriber.objects.count() == 0


def test_posts_list_and_article_blocks():
    call_command("seed_content")
    client = APIClient()
    posts = client.get("/api/v1/newsletter/posts").json()["posts"]
    assert [p["issue"] for p in posts] == sorted((p["issue"] for p in posts), reverse=True)
    assert "body" not in posts[0]
    article = client.get(f"/api/v1/newsletter/posts/{posts[0]['slug']}").json()["post"]
    assert {b["type"] for b in article["body"]} >= {"p", "h2", "list", "quote"}
    assert client.get("/api/v1/newsletter/posts/missing").status_code == 404


def test_seed_content_is_idempotent_and_editable_content_survives():
    call_command("seed_content")
    assert Event.objects.count() == 10 and Post.objects.count() == 7
    Post.objects.filter(issue=24).update(title="Edited in the back office")
    call_command("seed_content")
    call_command("seed_content", "--if-empty")
    assert Post.objects.get(issue=24).title == "Edited in the back office"
    assert Event.objects.count() == 10


def test_content_cache_refreshes_after_an_edit():
    make_event("sooner", days=2, title="Old title")
    client = APIClient()
    assert client.get("/api/v1/events/sooner").json()["event"]["title"] == "Old title"
    event = Event.objects.get(slug="sooner")
    event.title = "New title"
    event.save()
    assert client.get("/api/v1/events/sooner").json()["event"]["title"] == "New title"


# ---------------------------------------------------------------- contact


@override_settings(SUPPORT_EMAILS=["support@example.com"])
def test_contact_message_is_saved_and_sent_to_support():
    body = {
        "name": "Lena Ortiz",
        "email": "lena@example.com",
        "company": "Relaywave",
        "topic": "Press",
        "message": "Could we interview a founder from the cohort?",
    }
    response = APIClient().post("/api/v1/contact", body, format="json")
    assert response.status_code == 201
    assert ContactMessage.objects.get().topic == "Press"
    [message] = mail.outbox
    assert message.to == ["support@example.com"] and message.reply_to == ["lena@example.com"]


@pytest.mark.parametrize(
    ("body", "field", "message"),
    [
        ({"topic": "Other"}, "topic", "Choose what this is about."),
        ({"message": ""}, "message", "Write a short message."),
        ({"message": "Too short"}, "message", "Tell us a little more (at least 10 characters)."),
        ({"company": "x" * 121}, "company", "Keep this under 120 characters."),
    ],
)
def test_contact_validation(body, field, message):
    base = {
        "name": "Lena Ortiz",
        "email": "lena@example.com",
        "topic": "Press",
        "message": "A longer message here.",
    }
    response = APIClient().post("/api/v1/contact", {**base, **body}, format="json")
    assert response.status_code == 422 and response.json()["errors"][field] == message


def test_contact_bot_trap():
    body = {
        "name": "Spam",
        "email": "bot@example.com",
        "topic": "Press",
        "message": "Buy now buy now",
        "website": "x",
    }
    assert APIClient().post("/api/v1/contact", body, format="json").status_code == 201
    assert ContactMessage.objects.count() == 0 and not mail.outbox


# ---------------------------------------------------------------- back office


def test_back_office_event_times_are_in_the_events_own_time_zone(client):
    from datetime import UTC, datetime

    from apps.accounts.models import User

    admin_user = User.objects.create_superuser("admin@example.com", "Admin", "admin-pass-123")
    client.force_login(admin_user)
    response = client.post(
        "/backoffice/content/event/add/",
        {
            "title": "Winter Info Session",
            "slug": "winter-info-session",
            "type": "Info Session",
            "format": "Online",
            "is_published": "on",
            "tz": "America/Los_Angeles",
            "start_0": "2026-12-01",
            "start_1": "09:00:00",
            "end_0": "2026-12-01",
            "end_1": "10:00:00",
            "city": "Online",
            "capacity": "50",
            "summary": "All about the winter cohort.",
            "about": "One paragraph.",
            "agenda-TOTAL_FORMS": "0",
            "agenda-INITIAL_FORMS": "0",
            "agenda-MIN_NUM_FORMS": "0",
            "agenda-MAX_NUM_FORMS": "1000",
        },
    )
    assert response.status_code == 302, response.content.decode()[:500]
    event = Event.objects.get(slug="winter-info-session")
    assert event.start == datetime(2026, 12, 1, 17, 0, tzinfo=UTC)  # 9:00 PST

    page = client.get(f"/backoffice/content/event/{event.pk}/change/").content.decode()
    assert 'value="09:00:00"' in page  # shown as typed, in Los Angeles time


def test_back_office_csv_keeps_empty_cells_empty(client):
    from apps.accounts.models import User

    client.force_login(User.objects.create_superuser("admin@example.com", "Admin", "admin-pass-123"))
    Subscriber.objects.create(email="a@example.com", source="")
    Subscriber.objects.create(email="b@example.com", source="=cmd")
    response = client.post(
        "/backoffice/content/subscriber/",
        {"action": "export", "_selected_action": list(Subscriber.objects.values_list("pk", flat=True))},
    )
    rows = response.content.decode().lstrip("﻿").splitlines()
    by_email = {row.split(",")[0]: row.split(",")[1] for row in rows[1:]}
    assert by_email["a@example.com"] == ""
    assert by_email["b@example.com"] == "'=cmd"
