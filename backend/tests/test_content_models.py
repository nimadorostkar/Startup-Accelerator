"""Content models, their back-office forms and the one-off content load."""

from datetime import timedelta
from unittest import mock

import pytest
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.db import transaction
from django.forms import modelform_factory
from django.utils import timezone

from apps.content.admin import EventForm, PostForm
from apps.content.models import (
    AgendaItem,
    Event,
    Post,
    SeedRecord,
    body_blocks,
    split_lines,
    timezone_names,
    validate_timezone,
)
from apps.content.payloads import event as event_payload
from apps.content.payloads import post as post_payload
from apps.core.signals import refresh_public_pages

pytestmark = pytest.mark.django_db


def event_fields(**extra) -> dict:
    start = timezone.now() + timedelta(days=3)
    return {
        "slug": "info-session",
        "title": "Info Session",
        "type": "Info Session",
        "format": "Online",
        "city": "Online",
        "start": start,
        "end": start + timedelta(hours=1),
        "tz": "Europe/London",
        "capacity": 100,
        "summary": "All about the program.",
        "about": "First paragraph.",
        **extra,
    }


# ---------------------------------------------------------------- time zones


@pytest.mark.parametrize(
    "name",
    [
        "Factory",
        "localtime",
        "posixrules",
        "posix/Europe/London",
        "right/UTC",
        "Etc/GMT+5",
        "US/Pacific",
        "EST5EDT",
        "Nowhere/City",
    ],
)
def test_time_zones_the_website_cant_show_are_refused(name):
    with pytest.raises(ValidationError):
        validate_timezone(name)


@pytest.mark.parametrize(
    "name", ["UTC", "Europe/London", "America/Los_Angeles", "America/Argentina/Buenos_Aires", "Asia/Kolkata"]
)
def test_region_city_time_zones_and_utc_are_accepted(name):
    validate_timezone(name)


def test_event_form_offers_a_sorted_time_zone_list():
    form = EventForm()
    values = [value for value, _ in form.fields["tz"].choices]
    assert values[0] == "UTC" and values[1:] == sorted(values[1:])
    assert "Factory" not in values and "localtime" not in values and "Europe/London" in values
    assert tuple(values) == timezone_names()


def test_event_form_refuses_a_bad_zone_and_shows_a_stored_one():
    event = Event(**event_fields())
    event.save()
    Event.objects.filter(pk=event.pk).update(tz="Factory")
    event.refresh_from_db()
    form = EventForm(instance=event)
    assert form.fields["tz"].choices[0] == ("Factory", "Factory")  # visible, not silently swapped
    with pytest.raises(ValidationError):
        event.full_clean()


def test_capacity_must_be_at_least_one():
    event = Event(**event_fields(capacity=0))
    with pytest.raises(ValidationError) as refused:
        event.full_clean()
    assert "capacity" in refused.value.message_dict
    Event(**event_fields(capacity=1)).full_clean()


# ---------------------------------------------------------------- posts


def test_cleared_read_time_saves_as_zero():
    data = {
        "title": "Issue",
        "slug": "issue",
        "issue": 1,
        "excerpt": "Short.",
        "category": "Building",
        "author": "Team",
        "published_on": "2026-09-01",
        "minutes": "",
        "body": "word " * 440,
        "is_published": "on",
    }
    # The back office's form: its fields as the admin lays them out.
    form = modelform_factory(Post, form=PostForm, fields=list(data))(data=data)
    assert form.is_valid(), form.errors
    post = form.save()
    assert post.minutes == 0 and post.read_minutes() == 2

    post.minutes = None  # however it got there, the column never gets NULL
    post.save()
    post.refresh_from_db()
    assert post.minutes == 0


def test_blocks_lists_and_quotes_right_under_a_heading_or_paragraph():
    body = "## Why it matters\n- one\n- two\n\nIntro line\n> Quoted\n> — Ada"
    assert body_blocks(body) == [
        {"type": "h2", "text": "Why it matters"},
        {"type": "list", "items": ["one", "two"]},
        {"type": "p", "text": "Intro line"},
        {"type": "quote", "text": "Quoted", "cite": "Ada"},
    ]


def test_blocks_sub_headings_and_numbered_lists():
    body = "### Sub\n1. one\n2. two\n10) ten\n\n## Next\nText after\nmore text"
    assert body_blocks(body) == [
        {"type": "h2", "text": "Sub"},
        {"type": "list", "items": ["one", "two", "ten"], "ordered": True},
        {"type": "h2", "text": "Next"},
        {"type": "p", "text": "Text after more text"},
    ]


def test_blocks_quote_credit_needs_a_dash_and_a_space():
    assert body_blocks("> Retention is up\n> -10% churn") == [
        {"type": "quote", "text": "Retention is up -10% churn"}
    ]
    for credit in ["— Ada Lovelace", "--Ada Lovelace", "- Ada Lovelace", "–  Ada Lovelace"]:
        assert body_blocks(f"> Quote\n> {credit}") == [
            {"type": "quote", "text": "Quote", "cite": "Ada Lovelace"}
        ], credit
    # A one-line quote is never a credit.
    assert body_blocks("> — Just this") == [{"type": "quote", "text": "— Just this"}]


def test_blocks_plain_paragraphs_lists_and_continuations():
    body = "First line\nsecond line\n\n- item one\n  continued\n- item two\n* star item\n\n-50% fees is not a list"
    assert body_blocks(body) == [
        {"type": "p", "text": "First line second line"},
        {"type": "list", "items": ["item one continued", "item two", "star item"]},
        {"type": "p", "text": "-50% fees is not a list"},
    ]
    assert body_blocks("") == [] and body_blocks("\n\n  \n") == []


def test_takeaway_lines_keep_a_leading_minus():
    text = "- First\n* Second\n•Third\n• Fourth\n-50% fees\n*not a bullet*\n\n   \nPlain"
    assert split_lines(text) == ["First", "Second", "Third", "Fourth", "-50% fees", "*not a bullet*", "Plain"]


def test_payloads_carry_the_last_edit_time():
    event = Event.objects.create(**event_fields())
    data = event_payload(event)
    assert data["updated"].endswith("Z") and data["updated"].startswith(str(event.updated_at.year))
    post = Post.objects.create(
        slug="issue", issue=1, title="Issue", excerpt="x", category="Building", body="Body"
    )
    assert post_payload(post)["updated"].endswith("Z")


# ---------------------------------------------------------------- the launch content load


def test_if_empty_loads_once_per_database():
    call_command("seed_content", "--if-empty")
    assert Event.objects.exists() and Post.objects.exists()
    assert SeedRecord.objects.filter(name="content").exists()

    # Staff delete every placeholder; the next start doesn't bring them back.
    Event.objects.all().delete()
    Post.objects.all().delete()
    call_command("seed_content", "--if-empty")
    assert not Event.objects.exists() and not Post.objects.exists()


def test_if_empty_records_a_database_that_already_has_content():
    Event.objects.create(**event_fields())
    call_command("seed_content", "--if-empty")
    assert Event.objects.count() == 1
    assert SeedRecord.objects.filter(name="content").exists()


def test_update_refreshes_the_newsletter_pages(settings):
    call_command("seed_content")
    post = Post.objects.order_by("issue").first()
    Post.objects.filter(pk=post.pk).update(title="Edited by hand")
    settings.FRONTEND_INTERNAL_URL = "http://web.internal"
    settings.REVALIDATE_SECRET = "secret"
    with mock.patch("apps.core.tasks.revalidate_frontend.delay") as delay:
        call_command("seed_content", "--update")
    post.refresh_from_db()
    assert post.title != "Edited by hand"
    sent = {tag for call in delay.call_args_list for tag in call.args[0]}
    assert "newsletter" in sent


# ---------------------------------------------------------------- website refreshes


@pytest.fixture
def real_on_commit(monkeypatch, settings):
    """Undo conftest's run-on-commit-now, so callbacks wait for the (captured) commit."""
    settings.FRONTEND_INTERNAL_URL = "http://web.internal"
    settings.REVALIDATE_SECRET = "secret"

    def on_commit(func, using=None, robust=False):
        transaction.get_connection(using).on_commit(func, robust)

    monkeypatch.setattr("django.db.transaction.on_commit", on_commit)


def test_one_refresh_per_transaction(real_on_commit, django_capture_on_commit_callbacks):
    with mock.patch("apps.core.tasks.revalidate_frontend.delay") as delay:
        with django_capture_on_commit_callbacks(execute=True):
            with transaction.atomic():
                event = Event.objects.create(**event_fields())
                for i in range(3):
                    AgendaItem.objects.create(event=event, time=f"{i}:00 PM", item=f"Item {i}", order=i)
                refresh_public_pages("newsletter")
    delay.assert_called_once_with(["events", "newsletter"])


def test_a_rolled_back_transaction_does_not_swallow_later_refreshes(
    real_on_commit, django_capture_on_commit_callbacks
):
    with mock.patch("apps.core.tasks.revalidate_frontend.delay") as delay:
        with django_capture_on_commit_callbacks(execute=True):
            try:
                with transaction.atomic():
                    refresh_public_pages("events")
                    raise RuntimeError
            except RuntimeError:
                pass
            with transaction.atomic():
                refresh_public_pages("startups")
    delay.assert_called_once_with(["startups"])


def test_refresh_needs_the_website_settings(settings):
    settings.FRONTEND_INTERNAL_URL = ""
    with mock.patch("apps.core.tasks.revalidate_frontend.delay") as delay:
        refresh_public_pages("events")
    delay.assert_not_called()


def test_backfill_marks_a_database_that_had_content():
    from importlib import import_module
    from types import SimpleNamespace

    from django.apps import apps
    from django.db import connection

    migration = import_module("apps.content.migrations.0003_seed_record_backfill")
    editor = SimpleNamespace(connection=connection)

    event = Event.objects.create(**event_fields())
    event.delete()  # every placeholder deleted: the id sequence has still moved on
    assert migration._sequence_used(editor, Event._meta.db_table)
    migration.forwards(apps, editor)
    assert SeedRecord.objects.filter(name="content").exists()


def test_editing_the_agenda_moves_the_events_updated_time():
    event = Event.objects.create(**event_fields())
    long_ago = timezone.now() - timedelta(days=30)
    Event.objects.filter(pk=event.pk).update(updated_at=long_ago)

    item = AgendaItem.objects.create(event=event, time="4:00 PM", item="Welcome")
    assert Event.objects.get(pk=event.pk).updated_at > long_ago  # the sitemap's lastmod moves

    Event.objects.filter(pk=event.pk).update(updated_at=long_ago)
    item.delete()
    assert Event.objects.get(pk=event.pk).updated_at > long_ago
