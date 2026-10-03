"""Transactional email: what goes out, to whom, and that it can always be sent."""

from datetime import UTC, datetime, timedelta

import pytest
from django.core import mail
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import User, UserToken
from apps.applications.models import Application
from apps.content import services
from apps.content.models import Event, EventRegistration, Post
from apps.core.emails import queue_email
from apps.core.tasks import deliver_email
from apps.core.validation import check_email, check_single_line, max_length

from .conftest import client_for, fill_application, make_reviewer, make_user, submit

pytestmark = pytest.mark.django_db


def html_of(message) -> str:
    return message.alternatives[0][0]


# ---------------------------------------------------------------- sending


def test_subjects_are_flattened_to_one_line():
    queue_email("a@example.com", "New application:\nAcme\r\n  Labs", "review_new", {"startup": "Acme"})
    assert mail.outbox[0].subject == "New application: Acme Labs"


def test_layout_never_turns_text_into_links_and_has_no_trailing_break():
    queue_email(
        "a@example.com",
        "Hello",
        "contact_message",
        {
            "name": "Mallory",
            "email": "m@example.com",
            "topic": "Press",
            "message": "Log in at https://evil.example/login or evil.example now",
            "action_url": "https://site.example/backoffice/x",
            "action_label": "Open in the back office",
        },
    )
    html = html_of(mail.outbox[0])
    assert "evil.example/login" in html and 'href="https://evil.example' not in html
    assert 'href="http://evil.example' not in html
    assert 'href="https://site.example/backoffice/x"' in html  # the button
    assert "<br></p>" not in html


def test_email_retries_span_about_half_an_hour():
    assert deliver_email.retry_jitter is False
    delays = [min(deliver_email.retry_backoff * 2**n, deliver_email.retry_backoff_max) for n in range(6)]
    assert deliver_email.max_retries == 6 and 25 * 60 <= sum(delays) <= 35 * 60


# ---------------------------------------------------------------- validation


@pytest.mark.parametrize(
    "value",
    [
        "x,reader@example.com",
        "a;b@example.com",
        "a:b@example.com",
        "a>b@example.com",
        "a<b@example.com",
        'a"b@example.com',
        "a(b)@example.com",
        "a[b]@example.com",
        "a\\b@example.com",
        "a b@example.com",
        "ab@example.com\n",
        "a\x00b@example.com",
        "ab@exa,mple.com",
    ],
)
def test_email_addresses_the_mailer_cannot_use_are_refused(value):
    assert check_email(value) == "That doesn't look like a valid email address."


@pytest.mark.parametrize(
    "value", ["maya@example.com", "maya.rosen+apply@ledgerly.co.uk", "o'neil@example.ie"]
)
def test_ordinary_email_addresses_pass(value):
    assert check_email(value) is None


def test_single_line_check_and_length_wording():
    assert check_single_line("Acme Labs — Ü") is None
    for bad in ("Acme\nLabs", "Acme\rLabs", "Acme\tLabs", "Acme\x85Labs", "Acme Labs"):
        assert check_single_line(bad) == "Use a single line."
    assert max_length("x" * 120, 120) is None
    assert max_length("x" * 121, 120) == "Keep this to 120 characters or fewer."


# ---------------------------------------------------------------- contact form


@override_settings(SUPPORT_EMAILS=[])
def test_contact_without_a_support_inbox_reaches_each_reviewer_separately():
    make_reviewer("one@example.com", "One Reviewer")
    make_reviewer("two@example.com", "Two Reviewer")
    body = {
        "name": "Lena Ortiz",
        "email": "lena@example.com",
        "topic": "Press",
        "message": "Could we interview a founder from the cohort?",
    }
    assert APIClient().post("/api/v1/contact", body, format="json").status_code == 201
    assert sorted(m.to for m in mail.outbox) == [["one@example.com"], ["two@example.com"]]
    assert all(m.reply_to == ["lena@example.com"] for m in mail.outbox)


# ---------------------------------------------------------------- events


def make_event(*, fmt="In person", days=3.0, venue="", online_url="", tz="Europe/London", **extra):
    start = timezone.now() + timedelta(days=days)
    return Event.objects.create(
        slug=extra.pop("slug", "meetup"),
        title="Founder Meetup",
        type="Networking",
        format=fmt,
        city="Online" if fmt == "Online" else "London",
        start=start,
        end=extra.pop("end", start + timedelta(hours=2)),
        tz=tz,
        summary="Drinks with the cohort.",
        about="One paragraph.",
        venue=venue,
        online_url=online_url,
        **extra,
    )


def register(slug="meetup", email="lena@example.com"):
    body = {"name": "Lena Ortiz", "email": email}
    response = APIClient().post(f"/api/v1/events/{slug}/registrations", body, format="json")
    assert response.status_code == 201
    return mail.outbox[-1]


def test_invite_without_a_venue_names_the_city_not_a_promise():
    make_event()
    message = register()
    text = message.attachments[0].get_payload(decode=True).decode().replace("\r\n ", "")
    assert "LOCATION:London\r\n" in text
    assert "We'll email the exact venue before the event." in message.body


def test_late_registrations_are_not_promised_a_reminder():
    make_event(days=0.5)
    message = register()
    assert "reminder" not in message.body


def test_venue_set_later_is_emailed_to_every_guest_once():
    event = make_event()
    register(email="lena@example.com")
    register(email="tom@example.com")
    mail.outbox.clear()

    event.title = "Founder Meetup (updated)"
    event.save()  # no venue yet: nothing to send
    assert not mail.outbox

    event.venue = "Second Home, 68 Hanbury St, London"
    event.save()
    assert sorted(m.to[0] for m in mail.outbox) == ["lena@example.com", "tom@example.com"]
    assert all("68 Hanbury St" in m.body and m.subject.startswith("Venue:") for m in mail.outbox)

    mail.outbox.clear()
    event.venue = "Second Home, 68 Hanbury St, London E1"
    event.save()  # already had a venue: guests aren't emailed again for an edit
    event.save()
    assert not mail.outbox


def test_joining_link_set_later_is_emailed_and_in_the_reminder():
    event = make_event(fmt="Online", slug="webinar")
    register("webinar")
    mail.outbox.clear()
    event.online_url = "https://meet.example/xyz"
    event.save()
    [message] = mail.outbox
    assert "https://meet.example/xyz" in message.body and message.subject == "Joining link: Founder Meetup"
    assert 'href="https://meet.example/xyz"' in html_of(message)

    Event.objects.filter(pk=event.pk).update(start=timezone.now() + timedelta(hours=5))
    EventRegistration.objects.update(created_at=timezone.now() - timedelta(days=2))
    mail.outbox.clear()
    assert services.send_reminders() == 1
    assert "https://meet.example/xyz" in mail.outbox[0].body


def test_no_joining_details_for_past_or_hidden_events():
    past = make_event(slug="past", days=-2)
    EventRegistration.objects.create(event=past, name="Lena Ortiz", email="lena@example.com")
    hidden = make_event(slug="hidden", is_published=False)
    EventRegistration.objects.create(event=hidden, name="Lena Ortiz", email="lena@example.com")
    for event in (past, hidden):
        event.venue = "Somewhere"
        event.save()
    assert not mail.outbox


def test_reminder_says_today_or_tomorrow_in_the_events_time_zone():
    event = Event(tz="Europe/London", start=datetime(2026, 12, 1, 23, 30, tzinfo=UTC))
    assert services._relative_day(event, datetime(2026, 12, 1, 0, 15, tzinfo=UTC)) == "today"
    assert services._relative_day(event, datetime(2026, 11, 30, 23, 45, tzinfo=UTC)) == "tomorrow"
    tokyo = Event(tz="Asia/Tokyo", start=datetime(2026, 12, 1, 14, 30, tzinfo=UTC))  # 23:30 in Tokyo
    assert services._relative_day(tokyo, datetime(2026, 11, 30, 15, 15, tzinfo=UTC)) == "today"


def test_reminder_subject_matches_its_wording():
    event = make_event(days=0.5, venue="Second Home")
    EventRegistration.objects.create(
        event=event,
        name="Lena Ortiz",
        email="lena@example.com",
        created_at=timezone.now() - timedelta(days=3),
    )
    assert services.send_reminders() == 1
    message = mail.outbox[0]
    day = services._relative_day(event, timezone.now())
    assert message.subject == f"{day.capitalize()}: Founder Meetup"
    assert f"Founder Meetup is {day}." in message.body and "Second Home" in message.body


def test_event_times_name_the_end_date_and_a_readable_zone():
    same_day = Event(
        tz="America/Los_Angeles",
        start=datetime(2026, 12, 1, 17, 0, tzinfo=UTC),
        end=datetime(2026, 12, 1, 18, 0, tzinfo=UTC),
    )
    assert services.event_when(same_day) == "Tuesday, December 1, 2026 · 9:00 AM – 10:00 AM PST"
    overnight = Event(
        tz="America/Sao_Paulo",
        start=datetime(2026, 12, 2, 1, 0, tzinfo=UTC),  # 22:00 on Dec 1 in São Paulo
        end=datetime(2026, 12, 2, 4, 0, tzinfo=UTC),
    )
    assert services.event_when(overnight) == (
        "Tuesday, December 1, 2026, 10:00 PM – Wednesday, December 2, 2026, 1:00 AM UTC−03:00"
    )


# ---------------------------------------------------------------- newsletter


def test_future_dated_issues_wait_for_their_date(monkeypatch):
    today = timezone.localdate()
    for issue, published_on in ((1, today), (2, today + timedelta(days=1))):
        Post.objects.create(
            slug=f"issue-{issue}",
            issue=issue,
            title=f"Issue {issue}",
            excerpt="Short.",
            category="Building",
            body="One paragraph.",
            published_on=published_on,
        )
    client = APIClient()
    assert [p["slug"] for p in client.get("/api/v1/newsletter/posts").json()["posts"]] == ["issue-1"]
    assert client.get("/api/v1/newsletter/posts/issue-2").status_code == 404

    # The next day it appears, even though the list is still cached.
    tomorrow = datetime.combine(today + timedelta(days=1), datetime.min.time(), tzinfo=UTC) + timedelta(
        hours=1
    )
    monkeypatch.setattr(services, "now", lambda: tomorrow)
    assert [p["slug"] for p in client.get("/api/v1/newsletter/posts").json()["posts"]] == [
        "issue-2",
        "issue-1",
    ]
    assert client.get("/api/v1/newsletter/posts/issue-2").status_code == 200


# ---------------------------------------------------------------- accounts


def test_password_changed_email_has_a_button():
    user = make_user(password="old-password-1")
    client_for(user).post(
        "/api/v1/me/password",
        {"currentPassword": "old-password-1", "newPassword": "new-pass-word-2"},
        format="json",
    )
    [message] = mail.outbox
    assert "Reset my password" in html_of(
        message
    ) and 'href="http://testserver.local/forgot-password"' in html_of(message)


def test_changing_an_address_needs_it_confirmed_again():
    reviewer = make_reviewer("alex@example.com", "Alex Rivera")
    UserToken.issue(reviewer, UserToken.Purpose.PASSWORD_RESET)
    assert reviewer.is_reviewer

    reviewer = User.objects.get(pk=reviewer.pk)
    reviewer.email = "Alex.New@Example.com"
    reviewer.save()
    reviewer.refresh_from_db()
    assert reviewer.email == "alex.new@example.com" and reviewer.email_verified_at is None
    assert not reviewer.is_reviewer  # review access waits for the new inbox's owner
    old = UserToken.objects.filter(user=reviewer, purpose=UserToken.Purpose.PASSWORD_RESET).get()
    assert old.used_at is not None  # links sent to the old address stop working
    [message] = mail.outbox
    assert message.to == ["alex.new@example.com"] and "verify-email?token=" in message.body
    assert "was changed to this one" in message.body

    # Saves that don't touch the address leave it alone.
    mail.outbox.clear()
    reviewer.name = "Alex R."
    reviewer.save()
    reviewer.save(update_fields=["name"])
    assert not mail.outbox


def test_back_office_email_change_sends_a_fresh_confirmation(client):
    client.force_login(User.objects.create_superuser("admin@example.com", "Admin", "admin-pass-123"))
    user = make_user("maya@example.com", email_verified_at=timezone.now())
    page = client.get(f"/backoffice/accounts/user/{user.pk}/change/")
    assert page.status_code == 200
    form = {
        "email": "maya.rosen@example.com",
        "name": user.name,
        "role": "founder",
        "is_active": "on",
        "sessions-TOTAL_FORMS": "0",
        "sessions-INITIAL_FORMS": "0",
        "sessions-MIN_NUM_FORMS": "0",
        "sessions-MAX_NUM_FORMS": "1000",
    }
    response = client.post(f"/backoffice/accounts/user/{user.pk}/change/", form)
    assert response.status_code == 302, response.content.decode()[:2000]
    user.refresh_from_db()
    assert user.email == "maya.rosen@example.com" and not user.email_verified
    assert [m.to for m in mail.outbox] == [["maya.rosen@example.com"]]


# ---------------------------------------------------------------- applications


@override_settings(SUPPORT_EMAILS=["team@example.com", "other@example.com"])
def test_decision_emails_can_be_answered(reviewer_client):
    founder = make_user()
    client = client_for(founder)
    fill_application(client)
    assert submit(client).status_code == 200
    mail.outbox.clear()
    response = reviewer_client.post(
        f"/api/v1/admin/applications/{founder.pk}/decisions", {"decision": "start_review"}, format="json"
    )
    assert response.status_code == 200
    [message] = [m for m in mail.outbox if m.to == [founder.email]]
    assert message.reply_to == ["team@example.com"]


def test_digest_counts_every_waiting_application(reviewer, monkeypatch):
    from apps.applications import tasks

    monkeypatch.setattr(tasks, "DIGEST_LIST_LIMIT", 1)
    for email, startup in (("a@example.com", "Alpha"), ("b@example.com", "Beta")):
        user = make_user(email, "Ana Founder")
        client = client_for(user)
        fill_application(client)
        client.patch("/api/v1/me/application/startup", {"name": startup}, format="json")
        assert submit(client).status_code == 200
        Application.objects.filter(pk=user.pk).update(submitted_at=timezone.now() - timedelta(days=30))
    mail.outbox.clear()
    assert tasks.send_overdue_digest() == 2
    [message] = mail.outbox
    assert message.subject.startswith("2 applications waiting")
    assert "and 1 more" in message.body
