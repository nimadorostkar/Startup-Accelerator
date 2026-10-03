"""The review queue: filters, counts, sorting and paging, in SQL.

Same options as the website's src/lib/application/queue.ts (TABS, SORTS,
parseFilters), which builds the links; this module answers them.
"""

from datetime import timedelta

from django.conf import settings
from django.db.models import Case, Count, F, IntegerField, Q, Value, When
from django.db.models.functions import Lower

from apps.core.utils import now

from . import payloads, rules
from .models import Application

TABS = ["submitted", "in_review", "changes_requested", "accepted", "declined", "draft", "all"]
SORTS = ["waiting", "recent", "score", "name"]
PAGE_SIZE = 50
MAX_PAGE_SIZE = 200


def _one(params, key: str) -> str:
    value = params.get(key, "")
    if isinstance(value, (list, tuple)):
        value = value[0] if value else ""
    return value if isinstance(value, str) else ""


def _int(value: str, default: int, lo: int, hi: int) -> int:
    try:
        return max(lo, min(hi, int(value)))
    except (TypeError, ValueError):
        return default


def parse_filters(params) -> dict:
    """Reads filters from the query string, ignoring anything that isn't a known option."""
    status = _one(params, "status")
    tab = status if status in TABS else "submitted"
    sort = _one(params, "sort")
    stage = _one(params, "stage")
    industry = _one(params, "industry")
    return {
        "status": tab,
        "q": _one(params, "q").strip()[:100],
        "stage": stage if stage in rules.STAGE_IDS else "",
        "industry": industry if industry in rules.INDUSTRIES else "",
        "mine": _one(params, "mine") == "1",
        # The work queue reads oldest-first; everything else, most recent first.
        "sort": sort if sort in SORTS else ("waiting" if tab == "submitted" else "recent"),
        "page": _int(_one(params, "page"), 1, 1, 10_000),
        "pageSize": _int(_one(params, "pageSize"), PAGE_SIZE, 1, MAX_PAGE_SIZE),
    }


def _ordering(sort: str) -> list:
    if sort == "waiting":
        return [F("submitted_at").asc(nulls_last=True), "user_id"]
    if sort == "score":
        return [F("team_score").desc(nulls_last=True), "-updated_at", "user_id"]
    if sort == "name":
        # Unnamed startups go last, like the website's "~" placeholder.
        blank_last = Case(When(startup_name="", then=Value(1)), default=Value(0), output_field=IntegerField())
        return [blank_last, Lower("startup_name"), "user_id"]
    return ["-updated_at", "user_id"]


def run(reviewer, params) -> dict:
    f = parse_filters(params)
    matches = Application.objects.all()
    if f["q"]:
        q = f["q"]
        matches = matches.filter(
            Q(startup_name__icontains=q)
            | Q(founder_name__icontains=q)
            | Q(user__email__icontains=q)
            | Q(tagline__icontains=q)
        )
    if f["stage"]:
        matches = matches.filter(stage=f["stage"])
    if f["industry"]:
        matches = matches.filter(industry=f["industry"])
    if f["mine"]:
        matches = matches.filter(assignee=reviewer)

    # Counts per tab respect the search filters, so the tabs tell you where results are.
    by_status = dict(matches.order_by().values_list("status").annotate(n=Count("pk")))
    counts = {tab: by_status.get(tab, 0) for tab in TABS if tab != "all"}
    counts["all"] = sum(by_status.values())

    in_tab = matches if f["status"] == "all" else matches.filter(status=f["status"])
    total = counts[f["status"]]
    size = f["pageSize"]
    pages = max(1, -(-total // size))
    page = min(f["page"], pages)
    rows = (
        in_tab.select_related("user", "assignee")
        .prefetch_related("scorecards")
        .order_by(*_ordering(f["sort"]))[(page - 1) * size : page * size]
    )

    at = now()
    overdue_before = at - timedelta(days=settings.REVIEW_SLA_DAYS)
    everything = Application.objects.all()
    return {
        "filters": {**f, "page": page},
        "rows": [payloads.queue_row(app, at) for app in rows],
        "counts": counts,
        "summary": {
            "waiting": everything.filter(status="submitted").count(),
            "overdue": everything.filter(status="submitted", submitted_at__lte=overdue_before).count(),
            "mineInReview": everything.filter(status="in_review", assignee=reviewer).count(),
        },
        "page": page,
        "pages": pages,
        "pageSize": size,
        "total": total,
    }
