"""Every change to an application, founder or reviewer, goes through here.

Each one runs in a single transaction holding the application's row lock
(SELECT … FOR UPDATE), and every rule is checked against the row as stored:
the edit lock, "complete before submit", the 100% equity cap and "two
reviewers can't both decide". A refusal raises, the transaction rolls back
and nothing is written.
"""

import uuid
from collections.abc import Callable

from django.db import IntegrityError, transaction

from apps.accounts.models import User
from apps.core.exceptions import Conflict, Invalid, NotFound
from apps.core.utils import now
from apps.core.validation import Fields, max_length, text_length

from . import directory, images, notifications, rules
from .models import Application, ApplicationEvent, InternalNote, Scorecard, slugify

LOCKED = "This application is with the review team and can't be edited right now."
MAX_TEAM = 20


def _event(app: Application, kind: str, title: str, body: str = "", *, by: str = "founder", actor=None):
    return ApplicationEvent.objects.create(
        application=app, kind=kind, title=title, body=body, by=by, actor=actor, at=now()
    )


# ---------------------------------------------------------------- founder side


def ensure_application(user: User) -> Application:
    """The founder's application, created as a blank draft on first visit."""
    app = Application.objects.filter(pk=user.pk).first()
    if app is not None:
        return app
    try:
        with transaction.atomic():
            app = Application.objects.create(
                user=user,
                profile=rules.blank_profile(user.name),
                startup=rules.blank_startup(),
                team=rules.blank_team(user.name, user.email),
            )
            _event(app, "created", "Application started")
            return app
    except IntegrityError:  # created by a parallel request a moment ago
        return Application.objects.get(pk=user.pk)


def _founder_change(
    user: User, change: Callable[[Application], None], *, editable: bool = True
) -> Application:
    """The one way for a founder to change their application.

    Reviewer data (assignee, scorecards, notes) lives in other columns and
    tables, so a founder save can't touch it.
    """
    ensure_application(user)
    with transaction.atomic():
        app = Application.objects.select_for_update().get(pk=user.pk)
        if editable and not app.editable:
            raise Conflict(LOCKED)
        change(app)
        app.updated_at = now()
        app.save()
    return app


def save_profile(user: User, data: dict) -> Application:
    updates = rules.parse_profile(data)

    def change(app):
        profile = {**app.profile_data, **updates}
        profile.pop("email", None)  # the email belongs to the account, never to the form
        app.profile = profile

    return _founder_change(user, change)


def save_startup(user: User, data: dict) -> Application:
    updates = rules.parse_startup(data)

    def change(app):
        app.startup = {**app.startup_data, **updates}

    return _founder_change(user, change)


def save_team_details(user: User, data: dict) -> Application:
    updates = rules.parse_team_details(data)

    def change(app):
        app.team = {**app.team_data, **updates}

    return _founder_change(user, change)


def _set_members(app: Application, members: list[dict]) -> None:
    # Checked against the stored team inside the lock, so two quick saves
    # can't each pass on their own and add up to more than 100%.
    overflow = rules.equity_error(members)
    if overflow:
        raise Invalid({"equity": overflow})
    app.team = {**app.team_data, "members": members}


def add_member(user: User, data: dict) -> tuple[Application, str]:
    member = {"id": str(uuid.uuid4()), **rules.parse_member(data)}

    def change(app):
        members = app.team_data["members"]
        if len(members) >= MAX_TEAM:
            raise Conflict(f"A team can list up to {MAX_TEAM} people.")
        _set_members(app, [*members, member])

    return _founder_change(user, change), member["id"]


def update_member(user: User, member_id: str, data: dict) -> Application:
    def change(app):
        members = app.team_data["members"]
        current = next((m for m in members if m["id"] == member_id), None)
        if current is None:
            raise NotFound("That team member isn't on your application any more.")
        incoming = data if isinstance(data, dict) else {}
        merged = {**current, **{k: v for k, v in incoming.items() if k in rules.MEMBER_FIELDS}}
        updated = {"id": member_id, **rules.parse_member(merged)}
        _set_members(app, [updated if m["id"] == member_id else m for m in members])

    return _founder_change(user, change)


def remove_member(user: User, member_id: str) -> Application:
    def change(app):
        members = app.team_data["members"]
        if not any(m["id"] == member_id for m in members):
            raise NotFound("That team member isn't on your application any more.")
        if len(members) == 1:
            raise Conflict("Your team needs at least one person.")
        app.team = {**app.team_data, "members": [m for m in members if m["id"] != member_id]}

    return _founder_change(user, change)


def set_image(user: User, kind: str, upload) -> Application:
    """Replaces the startup's logo or the founder's photo (`kind`) with a new upload."""
    content = images.process(upload, kind)
    previous = None

    def change(app):
        nonlocal previous
        field = getattr(app, kind)
        previous = field.name
        field.save(content.name, content, save=False)

    try:
        app = _founder_change(user, change)
    except Exception:
        images.discard(f"{images.FOLDERS[kind]}/{content.name}")  # refused: don't keep the new file
        raise
    images.discard(previous)
    return app


def remove_image(user: User, kind: str) -> Application:
    previous = None

    def change(app):
        nonlocal previous
        previous = getattr(app, kind).name
        setattr(app, kind, "")

    app = _founder_change(user, change)
    images.discard(previous)
    return app


def free_slug(name: str, *, exclude=None) -> str:
    """The startup's public address: its slugified name, or name-2, name-3… if taken.

    `exclude` is the application's own id: its current slug doesn't count as taken,
    and a name with no ASCII letters gets "startup-<first 8 hex digits of the id>".
    """
    base = slugify(name, exclude)
    taken = set(
        Application.objects.filter(slug__startswith=base).exclude(pk=exclude).values_list("slug", flat=True)
    )
    slug, n = base, 1
    while slug in taken:
        n += 1
        slug = f"{base}-{n}"
    return slug


def _assign_slug(app: Application) -> None:
    """Public address, kept stable: only re-made if the startup was renamed since it was made.

    Compared with the name it was made for (not with the slug itself), so an address
    fixed in the back office survives a resubmission.
    """
    if app.slug and slugify(app.slug_source, app.pk) == slugify(app.startup_name, app.pk):
        return
    app.slug = free_slug(app.startup_name, exclude=app.pk)
    app.slug_source = app.startup_name


def submit(user: User, data: dict) -> Application:
    if not Fields(data).flag("confirm"):
        raise Invalid({"confirm": "Please confirm the details are accurate."})
    resubmitted = False

    def change(app):
        nonlocal resubmitted
        # Re-checked on the stored record: the disabled button is a hint, this is the rule.
        progress = app.progress()
        if not progress["ready"]:
            count = len(progress["missing"])
            raise Invalid(
                message=f"{count} required {'answer is' if count == 1 else 'answers are'} still missing.",
                missing=progress["missing"],
            )
        resubmitted = app.status == "changes_requested"
        app.status = "submitted"
        app.submitted_at = now()
        # The public "Applied" date: the first submission, kept through resubmissions.
        if app.first_submitted_at is None:
            app.first_submitted_at = app.submitted_at
        _event(
            app, "submitted", "Application resubmitted" if resubmitted else "Application submitted for review"
        )
        _assign_slug(app)

    for attempt in range(3):
        try:
            app = _founder_change(user, change)
            break
        except IntegrityError:  # another startup took the same address a moment ago
            if attempt == 2:
                raise
    notifications.application_submitted(app, resubmitted=resubmitted)
    return app


def withdraw(user: User) -> Application:
    """Pull a submission back before review starts, to keep editing."""

    def change(app):
        if app.status in rules.EDITABLE:
            raise Conflict("This application isn't submitted, so there's nothing to withdraw.")
        if app.status != "submitted":
            raise Conflict("Review has already started, so this can't be withdrawn.")
        app.status = "draft"
        app.submitted_at = None
        _event(app, "withdrawn", "Submission withdrawn to make changes")

    app = _founder_change(user, change, editable=False)
    directory.invalidate()
    return app


# ---------------------------------------------------------------- reviewer side


def _review_change(
    app_id, change: Callable[[Application], None], *, fields: list[str] | None = None
) -> Application:
    """Atomic change to any application by a reviewer. Never creates one.

    `fields`: the columns `change` touches, for changes the public never sees
    (assignment, scores, notes), so they don't refresh the public directory.
    """
    with transaction.atomic():
        app = Application.objects.select_for_update().filter(pk=app_id).first()
        if app is None:
            raise NotFound("That application no longer exists.")
        change(app)
        app.updated_at = now()
        app.save(update_fields=[*fields, "updated_at"] if fields is not None else None)
    return app


def decide(app_id, reviewer: User, data: dict) -> Application:
    f = Fields(data)
    key = f.text("decision")
    decision = rules.DECISIONS.get(key)
    if decision is None:
        raise Invalid(message="Pick a decision.")
    note = f.text("message")
    f.error("message", max_length(note, 2000))
    if decision.message_required and text_length(note) < 20:
        f.error("message", "Tell the founder what to change — at least a sentence or two.")
    if f.errors:
        raise Invalid(f.errors)

    def change(app):
        # Checked against the stored status, so two reviewers can't both decide.
        if app.status not in decision.allowed_from:
            raise Conflict(
                f'Someone got there first — this application is now "{rules.STATUS_LABELS[app.status]}". '
                "Refresh to see the latest."
            )
        app.status = decision.to
        _event(app, "status", decision.title, note, by="support", actor=reviewer)
        # Starting a review claims it, unless someone already has.
        if key == "start_review" and app.assignee_id is None:
            app.assignee = reviewer

    app = _review_change(app_id, change)
    notifications.decision_made(app, key, note)
    return app


def assign(app_id, reviewer: User) -> Application:
    def change(app):
        app.assignee = reviewer

    return _review_change(app_id, change, fields=["assignee"])


def unassign(app_id) -> Application:
    def change(app):
        app.assignee = None

    return _review_change(app_id, change, fields=["assignee"])


def _read_scores(data: dict) -> tuple[dict, dict]:
    """Scores as {"scores": {"problem": 4}} or the form's flat "score-problem" fields."""
    nested = data.get("scores") if isinstance(data.get("scores"), dict) else {}
    scores, errors = {}, {}
    for area in rules.SCORE_AREAS:
        raw = nested.get(area, data.get(f"score-{area}"))
        if raw is None or raw == "":
            scores[area] = None
            continue
        try:
            value = int(str(raw).strip())
            valid = str(raw).strip() == str(value) and 1 <= value <= 5 and not isinstance(raw, bool)
        except ValueError:
            valid = False
        if valid:
            scores[area] = value
        else:
            errors[f"score-{area}"] = "Score from 1 to 5."
    return scores, errors


def save_scorecard(app_id, reviewer: User, data: dict) -> Application:
    data = data if isinstance(data, dict) else {}
    scores, errors = _read_scores(data)
    f = Fields(data)
    recommendation = f.text("recommendation")
    if recommendation and recommendation not in rules.RECOMMENDATIONS:
        errors["recommendation"] = "Pick a recommendation."
    summary = f.text("summary")
    if max_length(summary, 2000):
        errors["summary"] = max_length(summary, 2000)
    if errors:
        raise Invalid(errors)

    def change(app):
        # Each reviewer has exactly one scorecard; saving replaces theirs.
        Scorecard.objects.update_or_create(
            application=app,
            reviewer=reviewer,
            defaults={**scores, "recommendation": recommendation, "summary": summary, "updated_at": now()},
        )
        app.team_score = team_average(app)

    return _review_change(app_id, change, fields=["team_score"])


def team_average(app: Application) -> float | None:
    """Mean of each reviewer's average (scorecards with no scores don't count)."""
    averages = [
        a for a in (card.average() for card in Scorecard.objects.filter(application=app)) if a is not None
    ]
    return sum(averages) / len(averages) if averages else None


def add_note(app_id, reviewer: User, data: dict) -> Application:
    body = Fields(data).text("body")
    if not body:
        raise Invalid({"body": "Write a note first."})
    if max_length(body, 2000):
        raise Invalid({"body": max_length(body, 2000)})

    def change(app):
        InternalNote.objects.create(application=app, author=reviewer, body=body, at=now())

    return _review_change(app_id, change, fields=[])
