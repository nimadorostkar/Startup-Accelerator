import pytest
from django.core.management import CommandError, call_command
from django.test import override_settings

from apps.applications import rules
from apps.applications.models import Application

pytestmark = pytest.mark.django_db


def demo_applications():
    return Application.objects.filter(user__email__endswith="@demo.fundup.example")


@override_settings(DEBUG=True)
def test_seed_demo_adds_refreshes_and_removes_the_sample_applications():
    call_command("seed_demo")
    assert demo_applications().count() == 23
    assert demo_applications().exclude(status="draft").count() == 22
    assert set(demo_applications().values_list("status", flat=True)) == set(rules.STATUSES)

    call_command("seed_demo")  # replaces the sample set rather than adding a second one
    assert demo_applications().count() == 23

    call_command("seed_demo", "--reset")
    assert demo_applications().count() == 0


@override_settings(DEBUG=False)
def test_seed_demo_only_runs_with_debug_on_or_when_forced():
    with pytest.raises(CommandError):
        call_command("seed_demo")
    assert not demo_applications().exists()

    call_command("seed_demo", "--force")
    assert demo_applications().count() == 23
