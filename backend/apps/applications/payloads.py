"""JSON shapes, matching the website's TypeScript types in src/lib/application/types.ts.

`application(app)` is the founder's view: it never contains reviewer data
(scores, notes, assignment, actor ids). Only `application(app, review=True)`
adds them, and only the reviewer endpoints call it.
"""

from django.conf import settings
from django.db.models import Prefetch

from apps.core.utils import iso, now

from . import rules
from .models import Application, ApplicationEvent, InternalNote, Scorecard


def founder_queryset():
    return Application.objects.select_related("user").prefetch_related(
        Prefetch("events", queryset=ApplicationEvent.objects.order_by("at"))
    )


def reviewer_queryset():
    return (
        founder_queryset()
        .select_related("assignee")
        .prefetch_related(
            Prefetch(
                "scorecards", queryset=Scorecard.objects.select_related("reviewer").order_by("updated_at")
            ),
            Prefetch("notes", queryset=InternalNote.objects.select_related("author").order_by("at")),
        )
    )


def event(e: ApplicationEvent) -> dict:
    out = {"id": str(e.id), "at": iso(e.at), "by": e.by, "kind": e.kind, "title": e.title}
    if e.body:
        out["body"] = e.body
    return out


def scorecard(card: Scorecard) -> dict:
    return {
        "reviewerId": str(card.reviewer_id),
        "reviewerName": card.reviewer.name,
        "scores": card.scores(),
        "recommendation": card.recommendation,
        "summary": card.summary,
        "updatedAt": iso(card.updated_at),
    }


def review(app: Application) -> dict:
    return {
        "assigneeId": str(app.assignee_id) if app.assignee_id else None,
        "assigneeName": app.assignee.name if app.assignee_id else None,
        "scorecards": [scorecard(c) for c in app.scorecards.all()],
        "notes": [
            {
                "id": str(n.id),
                "at": iso(n.at),
                "authorId": str(n.author_id),
                "authorName": n.author.name,
                "body": n.body,
            }
            for n in app.notes.all()
        ],
    }


def application(app: Application, *, include_review: bool = False) -> dict:
    profile = app.profile_data
    profile["email"] = app.user.email  # always the account's address
    out = {
        "userId": str(app.user_id),
        "status": app.status,
        "profile": profile,
        "startup": app.startup_data,
        "team": app.team_data,
        "events": [event(e) for e in app.events.all()],
        "createdAt": iso(app.created_at),
        "updatedAt": iso(app.updated_at),
        "submittedAt": iso(app.submitted_at),
        "progress": app.progress(),
    }
    if include_review:
        out["review"] = review(app)
        out["slug"] = app.slug
    return out


def days_waiting(app: Application, at=None) -> int | None:
    if app.submitted_at is None:
        return None
    return int(((at or now()) - app.submitted_at).total_seconds() // 86400)


def queue_row(app: Application, at=None) -> dict:
    """One row of the review queue — only what the list needs (QueueRow in review.ts)."""
    startup, team = app.startup_data, app.team_data
    waiting = days_waiting(app, at)
    cards = list(app.scorecards.all())
    return {
        "id": str(app.user_id),
        "startup": startup["name"],
        "tagline": startup["tagline"],
        "founder": app.profile_data["fullName"],
        "email": app.user.email,
        "stage": startup["stage"],
        "industry": startup["industry"],
        "country": startup["country"],
        "status": app.status,
        "percent": app.progress()["percent"],
        "submittedAt": iso(app.submitted_at),
        "updatedAt": iso(app.updated_at),
        "waiting": waiting,
        "overdue": app.status == "submitted" and waiting is not None and waiting >= settings.REVIEW_SLA_DAYS,
        "assigneeId": str(app.assignee_id) if app.assignee_id else None,
        "assigneeName": app.assignee.name if app.assignee_id else None,
        "score": app.team_score,
        "scorecards": len(cards),
        "recommendations": [c.recommendation for c in cards if c.recommendation],
        "monthlyRevenue": startup["monthlyRevenue"],
        "seeking": startup["seeking"],
        "teamSize": len(team["members"]),
    }


# ---------------------------------------------------------------- public directory
# An allowlist, on purpose (src/lib/application/public.ts). Kept out: founder
# emails and phones, equity, money (revenue, growth, raised, seeking, use of
# funds), the deck, how they heard of us, review messages and all reviewer data.


def public_card(app: Application) -> dict:
    startup, team = app.startup_data, app.team_data
    return {
        "slug": app.slug,
        "name": startup["name"].strip(),
        "tagline": startup["tagline"],
        "industry": startup["industry"],
        "stage": startup["stage"],
        "stageLabel": rules.stage_label(startup["stage"]),
        "country": startup["country"],
        "foundedOn": startup["foundedOn"],
        "status": rules.PUBLIC_STATUS[app.status],
        "appliedAt": iso(app.submitted_at),
        "founders": [m["name"].strip() for m in team["members"] if m.get("isFounder") and m["name"].strip()],
        "users": startup["activeUsers"],
        "customers": startup["payingCustomers"],
    }


def public_startup(app: Application) -> dict:
    startup, profile, team = app.startup_data, app.profile_data, app.team_data
    return {
        **public_card(app),
        "website": startup["website"],
        "demoUrl": startup["demoUrl"],
        "videoUrl": startup["videoUrl"],
        "incorporated": startup["incorporated"],
        "businessModel": startup["businessModel"],
        "problem": startup["problem"],
        "solution": startup["solution"],
        "targetCustomer": startup["targetCustomer"],
        "marketSize": startup["marketSize"],
        "competitors": startup["competitors"],
        "advantage": startup["advantage"],
        "keyMetric": startup["keyMetric"],
        "team": [
            {
                "name": m["name"].strip(),
                "role": m["role"],
                "linkedin": m["linkedin"],
                "isFounder": bool(m.get("isFounder")),
                "commitment": m["commitment"],
            }
            for m in team["members"]
            if m["name"].strip()
        ],
        "workedTogether": team["workedTogether"],
        "whyUs": team["whyUs"],
        "hiringNeeds": team["hiringNeeds"],
        "applicant": {
            "name": profile["fullName"],
            "title": profile["title"],
            "city": profile["city"],
            "country": profile["country"],
            "bio": profile["bio"],
            "experienceYears": profile["experienceYears"],
            "linkedin": profile["linkedin"],
        },
        # Dated milestones, titles only: the messages behind them stay private.
        "timeline": [
            {"at": iso(e.at), "title": e.title} for e in app.events.all() if e.kind in ("submitted", "status")
        ],
    }
