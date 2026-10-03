"""Every application as a CSV, for the support team's own analysis (src/app/admin/export)."""

import csv
import re

from django.http import StreamingHttpResponse

from apps.core.utils import now

from . import rules
from .models import Application, Scorecard

FORMULA = re.compile(r"^[=+\-@\t\r]")


def cell(value) -> str:
    """Defuses spreadsheet formulas (=, +, -, @) in founder-entered text."""
    if value is None:
        return ""
    if isinstance(value, bool):
        return "yes" if value else "no"
    text = str(value)
    if isinstance(value, str) and FORMULA.match(text):
        text = "'" + text
    return text


def _founders(app):
    return [m["name"] for m in app.team_data["members"] if m.get("isFounder")]


def _cards(app) -> list[Scorecard]:
    return list(app.scorecards.all())


COLUMNS = [
    ("Status", lambda a: rules.STATUS_LABELS[a.status]),
    ("Submitted", lambda a: a.submitted_at.date().isoformat() if a.submitted_at else ""),
    ("Last activity", lambda a: a.updated_at.date().isoformat()),
    ("Complete %", lambda a: a.progress()["percent"]),
    ("Startup", lambda a: a.startup_data["name"]),
    ("One-line pitch", lambda a: a.startup_data["tagline"]),
    ("Website", lambda a: a.startup_data["website"]),
    ("Industry", lambda a: a.startup_data["industry"]),
    ("Stage", lambda a: rules.stage_label(a.startup_data["stage"]) if a.startup_data["stage"] else ""),
    ("Business model", lambda a: a.startup_data["businessModel"]),
    ("HQ", lambda a: a.startup_data["country"]),
    ("Founded", lambda a: a.startup_data["foundedOn"]),
    ("Incorporated", lambda a: a.startup_data["incorporated"]),
    ("Founder", lambda a: a.profile_data["fullName"]),
    ("Email", lambda a: a.user.email),
    ("Phone", lambda a: a.profile_data["phone"]),
    ("LinkedIn", lambda a: a.profile_data["linkedin"]),
    ("Commitment", lambda a: rules.COMMITMENTS.get(a.profile_data["commitment"], "")),
    ("Team size", lambda a: len(a.team_data["members"])),
    ("Co-founders", lambda a: "; ".join(_founders(a))),
    ("Active users", lambda a: a.startup_data["activeUsers"]),
    ("Paying customers", lambda a: a.startup_data["payingCustomers"]),
    ("MRR (USD)", lambda a: a.startup_data["monthlyRevenue"]),
    ("Growth % MoM", lambda a: a.startup_data["growthRate"]),
    ("Raised (USD)", lambda a: a.startup_data["raisedToDate"]),
    ("Raising (USD)", lambda a: a.startup_data["seeking"]),
    ("Pitch deck", lambda a: a.startup_data["deckUrl"]),
    ("Team score", lambda a: f"{a.team_score:.2f}" if a.team_score is not None else ""),
    ("Scorecards", lambda a: len(_cards(a))),
    ("Recommendations", lambda a: "; ".join(c.recommendation for c in _cards(a) if c.recommendation)),
    ("Reviewer", lambda a: a.assignee.name if a.assignee_id else ""),
    ("Problem", lambda a: a.startup_data["problem"]),
    ("Solution", lambda a: a.startup_data["solution"]),
]


class _Echo:
    def write(self, value):
        return value


def rows():
    writer = csv.writer(_Echo(), lineterminator="\r\n")
    # BOM first, so Excel reads the file as UTF-8 (names, €, em dashes).
    yield "﻿" + writer.writerow([header for header, _ in COLUMNS])
    apps = (
        Application.objects.select_related("user", "assignee")
        .prefetch_related("scorecards")
        .order_by("-updated_at")
    )
    for app in apps.iterator(chunk_size=200):
        yield writer.writerow([cell(get(app)) for _, get in COLUMNS])


def response() -> StreamingHttpResponse:
    today = now().date().isoformat()
    resp = StreamingHttpResponse(rows(), content_type="text/csv; charset=utf-8")
    resp["Content-Disposition"] = f'attachment; filename="fundup-club-applications-{today}.csv"'
    resp["Cache-Control"] = "no-store"
    return resp
