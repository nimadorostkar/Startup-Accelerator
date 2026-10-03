"""The application's rules, ported from the website so both sides agree:

    src/lib/application/types.ts      option lists, statuses, the edit lock
    src/lib/application/progress.ts   required answers and completion
    src/lib/application/decisions.ts  what a reviewer can do from which status
    src/app/dashboard/actions.ts      what each form field accepts

If you change a rule, change it in both places (the website uses its copy to
show progress and hide invalid buttons; this copy is the one that's enforced).
"""

import uuid
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from apps.core.exceptions import Invalid
from apps.core.validation import (
    Fields,
    check_single_line,
    max_length,
    normalize_url,
    optional_email,
    optional_linkedin,
    optional_phone,
    optional_url,
    text_length,
)

# ---------------------------------------------------------------- option lists

STAGES = [
    ("idea", "Discover", "Exploring a problem, no product yet"),
    ("mvp", "Build MVP", "Building the first version"),
    ("validation", "Validate", "Real users are testing it"),
    ("traction", "Traction", "Paying customers, growing usage"),
    ("fundraising", "Fundraise", "Raising a round now"),
    ("scaling", "Scale", "Hiring and expanding markets"),
]
STAGE_IDS = [s[0] for s in STAGES]
STAGE_LABELS = {s[0]: s[1] for s in STAGES}

INDUSTRIES = [
    "AI & machine learning",
    "B2B software / SaaS",
    "Climate & energy",
    "Consumer",
    "Deep tech & hardware",
    "E-commerce & retail",
    "Education",
    "Fintech",
    "Health & biotech",
    "Marketplaces",
    "Mobility & logistics",
    "Other",
]

BUSINESS_MODELS = [
    "Subscription (B2B)",
    "Subscription (B2C)",
    "Marketplace / take rate",
    "Transactional / usage-based",
    "Hardware sales",
    "Advertising",
    "Licensing",
    "Not decided yet",
]

COMMITMENTS = {"full-time": "Full-time", "part-time": "Part-time"}

WORKED_TOGETHER = ["Less than 6 months", "6–12 months", "1–3 years", "More than 3 years", "Solo founder"]

HEARD_FROM = [
    "Friend or alumni referral",
    "Fundup Club event",
    "Social media",
    "Search",
    "Press or podcast",
    "Other",
]

SCORE_AREAS = ["problem", "solution", "market", "team", "traction"]
RECOMMENDATIONS = ["accept", "interview", "decline"]


def stage_label(stage_id: str) -> str:
    return STAGE_LABELS.get(stage_id, "Not set")


# ---------------------------------------------------------------- statuses

STATUS_LABELS = {
    "draft": "Draft",
    "submitted": "Submitted",
    "in_review": "In review",
    "changes_requested": "Changes requested",
    "accepted": "Accepted",
    "declined": "Not selected",
}
STATUSES = list(STATUS_LABELS)

# Founders can edit only while the application isn't with the review team.
EDITABLE = {"draft", "changes_requested"}

# How each status shows in the public directory. Drafts never appear.
PUBLIC_STATUS = {
    "accepted": "cohort",
    "in_review": "review",
    "changes_requested": "review",
    "submitted": "applied",
    "declined": "passed",
}
PUBLIC_VISIBLE = list(PUBLIC_STATUS)


@dataclass(frozen=True)
class Decision:
    label: str
    allowed_from: tuple[str, ...]
    to: str
    title: str
    message_required: bool = False


DECISIONS = {
    "start_review": Decision("Start review", ("submitted",), "in_review", "Review started"),
    "request_changes": Decision(
        "Request changes", ("submitted", "in_review"), "changes_requested", "Changes requested", True
    ),
    "accept": Decision("Accept", ("submitted", "in_review"), "accepted", "Application accepted"),
    "decline": Decision("Decline", ("submitted", "in_review"), "declined", "Application not selected"),
    "reopen": Decision("Reopen review", ("accepted", "declined"), "in_review", "Review reopened"),
}


def available_decisions(status: str) -> list[str]:
    return [key for key, d in DECISIONS.items() if status in d.allowed_from]


# ---------------------------------------------------------------- blank records


def blank_profile(name: str) -> dict:
    return {
        "fullName": name,
        "phone": "",
        "title": "",
        "country": "",
        "city": "",
        "linkedin": "",
        "bio": "",
        "experienceYears": None,
        "commitment": "",
        "heardFrom": "",
    }


def blank_startup() -> dict:
    return {
        "name": "",
        "tagline": "",
        "website": "",
        "industry": "",
        "stage": "",
        "foundedOn": "",
        "country": "",
        "incorporated": "",
        "businessModel": "",
        "problem": "",
        "solution": "",
        "targetCustomer": "",
        "marketSize": "",
        "competitors": "",
        "advantage": "",
        "activeUsers": None,
        "payingCustomers": None,
        "monthlyRevenue": None,
        "growthRate": None,
        "keyMetric": "",
        "raisedToDate": None,
        "seeking": None,
        "useOfFunds": "",
        "deckUrl": "",
        "demoUrl": "",
        "videoUrl": "",
    }


def blank_member(name: str = "", email: str = "", *, is_founder: bool = False) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "name": name,
        "role": "",
        "email": email,
        "linkedin": "",
        "equity": None,
        "commitment": "",
        "isFounder": is_founder,
    }


def blank_team(name: str, email: str) -> dict:
    # The applicant is the first founder; they fill in the rest.
    return {
        "members": [blank_member(name, email, is_founder=True)],
        "workedTogether": "",
        "whyUs": "",
        "hiringNeeds": "",
    }


def with_defaults(section: dict | None, blank: dict) -> dict:
    """Stored sections gain any field added since they were saved."""
    return {**blank, **(section or {})}


# Answers saved under the old brand name, mapped to today's option.
HEARD_FROM_RENAMED = {"VC Summit event": "Fundup Club event"}


# ---------------------------------------------------------------- completion

# (field, label, minimum characters for free text, getter)
REQUIRED = {
    "profile": [
        ("fullName", "Full name", None, lambda p, s, t: p.get("fullName")),
        ("title", "Your role", None, lambda p, s, t: p.get("title")),
        ("country", "Country", None, lambda p, s, t: p.get("country")),
        ("linkedin", "LinkedIn", None, lambda p, s, t: p.get("linkedin")),
        ("commitment", "Commitment", None, lambda p, s, t: p.get("commitment")),
        ("bio", "Short bio", 60, lambda p, s, t: p.get("bio")),
    ],
    "startup": [
        ("name", "Startup name", None, lambda p, s, t: s.get("name")),
        ("tagline", "One-line pitch", None, lambda p, s, t: s.get("tagline")),
        ("industry", "Industry", None, lambda p, s, t: s.get("industry")),
        ("stage", "Current stage", None, lambda p, s, t: s.get("stage")),
        ("country", "Headquarters", None, lambda p, s, t: s.get("country")),
        ("businessModel", "Business model", None, lambda p, s, t: s.get("businessModel")),
        ("problem", "Problem", 80, lambda p, s, t: s.get("problem")),
        ("solution", "Solution", 80, lambda p, s, t: s.get("solution")),
        ("targetCustomer", "Target customer", None, lambda p, s, t: s.get("targetCustomer")),
        ("competitors", "Competitors", None, lambda p, s, t: s.get("competitors")),
        ("advantage", "Unfair advantage", 40, lambda p, s, t: s.get("advantage")),
        ("deckUrl", "Pitch deck link", None, lambda p, s, t: s.get("deckUrl")),
    ],
    "team": [
        (
            "members",
            "At least one founder",
            None,
            lambda p, s, t: any(m.get("isFounder") for m in t.get("members", [])) or None,
        ),
        ("workedTogether", "Time working together", None, lambda p, s, t: t.get("workedTogether")),
        ("whyUs", "Why this team", 60, lambda p, s, t: t.get("whyUs")),
    ],
}

SECTION_LABELS = {"profile": "Your profile", "startup": "Startup details", "team": "Team"}


def missing_fields(profile: dict, startup: dict, team: dict) -> list[dict]:
    out = []
    for section, rules in REQUIRED.items():
        for field, label, minimum, get in rules:
            value = get(profile, startup, team)
            if value is None or value == "" or value is False:
                out.append({"section": section, "field": field, "label": label})
            elif minimum and isinstance(value, str) and text_length(value) < minimum:
                out.append(
                    {
                        "section": section,
                        "field": field,
                        "label": label,
                        "reason": f"{minimum - text_length(value)} more characters needed",
                    }
                )
    return out


def progress(profile: dict, startup: dict, team: dict) -> dict:
    missing = missing_fields(profile, startup, team)
    sections = []
    for section, rules in REQUIRED.items():
        total = len(rules)
        left = sum(1 for m in missing if m["section"] == section)
        sections.append(
            {
                "id": section,
                "label": SECTION_LABELS[section],
                "total": total,
                "done": total - left,
                "complete": left == 0,
            }
        )
    total = sum(s["total"] for s in sections)
    done = sum(s["done"] for s in sections)
    return {
        "percent": round(done / total * 100),
        "ready": not missing,
        "sections": sections,
        "missing": missing,
    }


# ---------------------------------------------------------------- form parsing
# Each parser reads only the fields present in the body (so a client may send
# just what changed) and raises Invalid with every problem at once.


def _choice(f: Fields, key: str, allowed, message: str) -> str:
    value = f.text(key)
    if value and value not in allowed:
        f.error(key, message)
    return value


def _text(f: Fields, key: str, limit: int) -> str:
    value = f.text(key)
    f.error(key, max_length(value, limit))
    return value


def _line(f: Fields, key: str, limit: int) -> str:
    """One-line text (names, titles): they go into email subjects and headings."""
    value = f.text(key)
    f.error(key, check_single_line(value))
    f.error(key, max_length(value, limit))
    return value


# Startup answers that must be a single line.
STARTUP_LINES = {"name", "tagline", "country", "keyMetric"}


def _url(f: Fields, key: str, check=optional_url) -> str:
    value = f.text(key)
    f.error(key, check(value))
    return normalize_url(value)


def parse_profile(data: dict) -> dict:
    f = Fields(data)
    out = {}
    readers = {
        "fullName": lambda: _line(f, "fullName", 80),
        "title": lambda: _line(f, "title", 80),
        "country": lambda: _line(f, "country", 60),
        "city": lambda: _line(f, "city", 60),
        "bio": lambda: _text(f, "bio", 1200),
        "linkedin": lambda: _url(f, "linkedin", optional_linkedin),
        "commitment": lambda: _choice(f, "commitment", COMMITMENTS, "Pick an option."),
        "heardFrom": lambda: _choice(f, "heardFrom", HEARD_FROM, "Pick an option."),
    }
    for key, read in readers.items():
        if f.has(key):
            out[key] = read()
    if f.has("phone"):
        out["phone"] = f.text("phone")
        f.error("phone", optional_phone(out["phone"]))
    if f.has("experienceYears"):
        years = f.number("experienceYears")
        if years is not None and years > 60:
            f.error("experienceYears", "That's more than 60 years.")
        out["experienceYears"] = years
    if f.errors:
        raise Invalid(f.errors)
    return out


STARTUP_TEXT_LIMITS = {
    "name": 60,
    "tagline": 120,
    "country": 60,
    "problem": 1500,
    "solution": 1500,
    "targetCustomer": 600,
    "marketSize": 600,
    "competitors": 1000,
    "advantage": 1000,
    "keyMetric": 200,
    "useOfFunds": 1000,
}
STARTUP_URLS = ["website", "deckUrl", "demoUrl", "videoUrl"]
# Counts of people: whole numbers only (so "1.200", meaning 1,200, isn't read as 1.2).
STARTUP_WHOLE_NUMBERS = {"activeUsers", "payingCustomers"}
STARTUP_NUMBERS = [
    "activeUsers",
    "payingCustomers",
    "monthlyRevenue",
    "growthRate",
    "raisedToDate",
    "seeking",
]


def parse_startup(data: dict, *, today: datetime | None = None) -> dict:
    f = Fields(data)
    out = {}
    for key, limit in STARTUP_TEXT_LIMITS.items():
        if f.has(key):
            out[key] = (_line if key in STARTUP_LINES else _text)(f, key, limit)
    for key in STARTUP_URLS:
        if f.has(key):
            out[key] = _url(f, key)
    choices = {
        "industry": (INDUSTRIES, "Pick an industry."),
        "stage": (STAGE_IDS, "Pick a stage."),
        "incorporated": (("yes", "no"), "Pick an option."),
        "businessModel": (BUSINESS_MODELS, "Pick a model."),
    }
    for key, (allowed, message) in choices.items():
        if f.has(key):
            out[key] = _choice(f, key, allowed, message)
    if f.has("foundedOn"):
        value = f.text("foundedOn")
        # The latest month anywhere on Earth (UTC+14), so a founder whose new month
        # has begun before UTC's can still pick it.
        this_month = ((today or datetime.now(UTC)) + timedelta(hours=14)).strftime("%Y-%m")
        valid_month = (
            len(value) == 7
            and value[4] == "-"
            and value[:4].isdigit()
            and value[5:] in {f"{m:02d}" for m in range(1, 13)}
        )
        if value and (not valid_month or value > this_month):
            f.error("foundedOn", "Pick a month that isn't in the future.")
        out["foundedOn"] = value
    for key in STARTUP_NUMBERS:
        if f.has(key):
            out[key] = f.number(key, whole=key in STARTUP_WHOLE_NUMBERS)
    if out.get("growthRate") is not None and out["growthRate"] > 1000:
        f.error("growthRate", "That looks too high — use % per month.")
    if f.errors:
        raise Invalid(f.errors)
    return out


def parse_team_details(data: dict) -> dict:
    f = Fields(data)
    out = {}
    if f.has("workedTogether"):
        out["workedTogether"] = _choice(f, "workedTogether", WORKED_TOGETHER, "Pick an option.")
    if f.has("whyUs"):
        out["whyUs"] = _text(f, "whyUs", 1200)
    if f.has("hiringNeeds"):
        out["hiringNeeds"] = _text(f, "hiringNeeds", 800)
    if f.errors:
        raise Invalid(f.errors)
    return out


MEMBER_FIELDS = ["name", "role", "email", "linkedin", "equity", "commitment", "isFounder"]


def parse_member(data: dict) -> dict:
    """A whole team member (name and role required). For edits, merge the stored member in first."""
    f = Fields(data)
    name, role = f.text("name"), f.text("role")
    f.error("name", "Add their name." if not name else check_single_line(name) or max_length(name, 80))
    f.error(
        "role", "Add their role, e.g. CTO." if not role else check_single_line(role) or max_length(role, 80)
    )
    email = f.text("email")
    f.error("email", optional_email(email))
    linkedin = _url(f, "linkedin", optional_linkedin)
    equity = f.number("equity")
    if equity is not None and equity > 100:
        f.error("equity", "Equity can't exceed 100%.")
    commitment = _choice(f, "commitment", COMMITMENTS, "Pick an option.")
    if f.errors:
        raise Invalid(f.errors)
    return {
        "name": name,
        "role": role,
        "email": email,
        "linkedin": linkedin,
        "equity": equity,
        "commitment": commitment,
        "isFounder": f.flag("isFounder"),
    }


def equity_error(members: list[dict]) -> str | None:
    """Equity across the team can't add up to more than 100%."""
    # Rounded, so 33.3 + 33.3 + 33.4 counts as 100 rather than 100.00000000000001.
    total = round(sum(m.get("equity") or 0 for m in members), 6)
    if total > 100:
        # Up to 6 decimals, so 100.004 isn't printed as a refused "100%".
        shown = f"{total:.6f}".rstrip("0").rstrip(".")
        return f"That brings team equity to {shown}% — it can't exceed 100%."
    return None
