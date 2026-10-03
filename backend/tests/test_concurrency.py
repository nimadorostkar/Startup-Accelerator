"""Two requests at the same moment: the row lock makes exactly one of them win."""

import threading

import pytest
from django.db import connection

from apps.applications.models import Application

from .conftest import client_for, fill_application, make_reviewer, make_user, submit

pytestmark = pytest.mark.django_db(transaction=True)


def race(*calls):
    """Runs the calls in parallel threads, each on its own database connection."""
    barrier = threading.Barrier(len(calls))
    results = [None] * len(calls)

    def run(i, call):
        try:
            barrier.wait()
            results[i] = call()
        finally:
            connection.close()

    threads = [threading.Thread(target=run, args=(i, c)) for i, c in enumerate(calls)]
    for t in threads:
        t.start()
    for t in threads:
        t.join(30)
    return results


def test_two_member_saves_can_not_push_equity_past_100():
    founder = make_user()
    client = client_for(founder)
    [me] = client.get("/api/v1/me/application").json()["application"]["team"]["members"]
    client.patch(
        f"/api/v1/me/application/team/members/{me['id']}", {"role": "CEO", "equity": 40}, format="json"
    )

    def add(name):
        return lambda: (
            client.post(
                "/api/v1/me/application/team/members",
                {"name": name, "role": "CTO", "equity": 40},
                format="json",
            ).status_code
        )

    codes = race(add("Tom"), add("Ife"), add("Sam"))
    assert sorted(codes) == [201, 422, 422]
    members = Application.objects.get().team["members"]
    assert sum(m["equity"] or 0 for m in members) == 80


def test_two_reviewers_deciding_at_once_exactly_one_wins():
    founder = make_user()
    fclient = client_for(founder)
    fill_application(fclient)
    assert submit(fclient).status_code == 200
    first, second = (
        client_for(make_reviewer("a@example.com", "A")),
        client_for(make_reviewer("b@example.com", "B")),
    )
    url = f"/api/v1/admin/applications/{founder.pk}/decisions"

    codes = race(
        lambda: first.post(url, {"decision": "accept"}, format="json").status_code,
        lambda: second.post(url, {"decision": "decline"}, format="json").status_code,
    )
    assert sorted(codes) == [200, 409]
    app = Application.objects.get()
    assert app.status in {"accepted", "declined"}
    assert app.events.filter(kind="status").count() == 1


def test_parallel_first_visits_create_one_application():
    founder = make_user()
    client = client_for(founder)
    codes = race(*[lambda: client.get("/api/v1/me/application").status_code for _ in range(4)])
    assert codes == [200, 200, 200, 200]
    assert Application.objects.count() == 1
    assert Application.objects.get().events.filter(kind="created").count() == 1
