"""Fills the public directory with 50 invented startups, complete in every answer
and each with a logo, so the website's startup pages have something to show.

    python manage.py seed_startups            add / refresh the 50 startups
    python manage.py seed_startups --reset    remove them again

The startups are in seed_startups_data.py. Their founders are users at
@seed.fundup.example with no password (nobody can sign in as them), and they
are the only records this touches: each run deletes them, with their
applications, timelines and images, and creates them afresh. 22 are in the
cohort, 13 in review and 15 newly applied.

The first five keep the logos and founder photos the site launched with
(seed_assets/); the other logos are drawn here. It refuses to run unless DEBUG
is on (DJANGO_DEBUG=true); --force runs it anyway, e.g. on a staging server.
"""

import math
from datetime import timedelta
from io import BytesIO
from pathlib import Path

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from PIL import Image, ImageDraw

from apps.accounts.models import User
from apps.applications import images, rules
from apps.applications.models import Application, ApplicationEvent, slugify
from apps.applications.services import free_slug
from apps.core.utils import plural

from .seed_startups_data import STARTUPS

DOMAIN = "seed.fundup.example"
ASSETS = Path(__file__).resolve().parents[2] / "seed_assets"

WELCOME = "Welcome to the cohort! Onboarding call invites are on their way."
CHANGES = (
    "Promising. Before we go further, please add your monthly numbers for the last six months "
    "and say how you reach your first hundred customers."
)

# ---------------------------------------------------------------- logos

# Two-colour gradients, dark to light.
PALETTES = [
    ("#c2470a", "#f08a3c"),
    ("#165432", "#3f9a5a"),
    ("#1c2a5c", "#4a6fd1"),
    ("#5c1c3a", "#c44a8c"),
    ("#0f4c5c", "#2fa3ba"),
    ("#3b1d6e", "#8b5cf6"),
    ("#7a1f1f", "#e0564a"),
    ("#141a22", "#4b5a6e"),
    ("#6b4a0f", "#e0a52c"),
    ("#0d5c4a", "#34c9a3"),
    ("#2b3a8c", "#38b6e8"),
    ("#4a1d07", "#c8622c"),
]
WHITE = (255, 255, 255, 255)


def _hex(colour: str) -> tuple[int, int, int]:
    return tuple(int(colour[i : i + 2], 16) for i in (1, 3, 5))


def _polygon(d, s, points, **kw):
    d.polygon([(x * s, y * s) for x, y in points], **kw)


def _ring(d, s, cx, cy, r, w):
    d.ellipse([(cx - r) * s, (cy - r) * s, (cx + r) * s, (cy + r) * s], outline=WHITE, width=int(w * s))


def _dot(d, s, cx, cy, r):
    d.ellipse([(cx - r) * s, (cy - r) * s, (cx + r) * s, (cy + r) * s], fill=WHITE)


def _bar(d, s, x0, y0, x1, y1, r=0.03):
    d.rounded_rectangle([x0 * s, y0 * s, x1 * s, y1 * s], radius=r * s, fill=WHITE)


def _line(d, s, points, w=0.07):
    d.line([(x * s, y * s) for x, y in points], fill=WHITE, width=int(w * s), joint="curve")
    for x, y in (points[0], points[-1]):
        _dot(d, s, x, y, w / 2)


def _regular(n, cx, cy, r, turn=-90):
    return [
        (
            cx + r * math.cos(math.radians(turn + 360 * i / n)),
            cy + r * math.sin(math.radians(turn + 360 * i / n)),
        )
        for i in range(n)
    ]


# Simple marks, each drawn in white on the gradient, in a 0–1 box.
GLYPHS = [
    lambda d, s: (_ring(d, s, 0.5, 0.5, 0.22, 0.07), _dot(d, s, 0.5, 0.5, 0.07)),
    lambda d, s: _polygon(
        d, s, [(0.56, 0.2), (0.32, 0.54), (0.48, 0.54), (0.43, 0.8), (0.68, 0.45), (0.52, 0.45)], fill=WHITE
    ),
    lambda d, s: [_bar(d, s, x, y, x + 0.1, 0.72) for x, y in ((0.29, 0.52), (0.45, 0.4), (0.61, 0.28))],
    lambda d, s: (
        _polygon(d, s, _regular(6, 0.5, 0.5, 0.27), outline=WHITE, width=int(0.07 * s)),
        _dot(d, s, 0.5, 0.5, 0.06),
    ),
    lambda d, s: _polygon(d, s, _regular(3, 0.5, 0.54, 0.27), fill=WHITE),
    lambda d, s: (_ring(d, s, 0.42, 0.5, 0.17, 0.06), _ring(d, s, 0.58, 0.5, 0.17, 0.06)),
    lambda d, s: (_bar(d, s, 0.44, 0.26, 0.56, 0.74), _bar(d, s, 0.26, 0.44, 0.74, 0.56)),
    lambda d, s: [_line(d, s, [(x, 0.3), (x + 0.2, 0.5), (x, 0.7)]) for x in (0.3, 0.5)],
    lambda d, s: _polygon(d, s, _regular(4, 0.5, 0.5, 0.27), fill=WHITE),
    lambda d, s: [_dot(d, s, x, y, 0.055) for x in (0.32, 0.5, 0.68) for y in (0.32, 0.5, 0.68)],
    lambda d, s: (_line(d, s, [(0.3, 0.7), (0.7, 0.3)]), _line(d, s, [(0.44, 0.3), (0.7, 0.3), (0.7, 0.56)])),
    lambda d, s: [
        _line(d, s, [(0.27, y), (0.38, y - 0.07), (0.5, y), (0.62, y + 0.07), (0.73, y)], 0.06)
        for y in (0.4, 0.6)
    ],
    lambda d, s: [_bar(d, s, 0.28, y, x, y + 0.09) for y, x in ((0.3, 0.72), (0.455, 0.6), (0.61, 0.72))],
    lambda d, s: _polygon(d, s, _regular(5, 0.5, 0.52, 0.27), fill=WHITE),
    lambda d, s: (
        d.pieslice([0.24 * s, 0.24 * s, 0.76 * s, 0.76 * s], 180, 360, fill=WHITE),
        _bar(d, s, 0.24, 0.56, 0.76, 0.66),
    ),
]


def draw_logo(index: int) -> bytes:
    """A 256 × 256 logo: one of the marks on one of the gradients, different for every index."""
    scale = 1024  # drawn large, then shrunk, for smooth edges
    dark, light = (_hex(c) for c in PALETTES[(index * 5) % len(PALETTES)])
    # Corner to corner: light at the top left, dark at the bottom right.
    gradient = Image.new("L", (64, 64))
    gradient.putdata([255 - (x + y) * 255 // 126 for y in range(64) for x in range(64)])
    gradient = gradient.resize((scale, scale), Image.Resampling.BILINEAR)
    image = Image.composite(
        Image.new("RGB", (scale, scale), light), Image.new("RGB", (scale, scale), dark), gradient
    )
    image = image.convert("RGBA")
    GLYPHS[index % len(GLYPHS)](ImageDraw.Draw(image), scale)
    out = BytesIO()
    image.resize((256, 256), Image.Resampling.LANCZOS).save(out, "WEBP", quality=90, method=6)
    return out.getvalue()


def _asset(name: str) -> bytes | None:
    path = ASSETS / name
    return path.read_bytes() if path.exists() else None


# ---------------------------------------------------------------- answers

STAGE_MONTHS = {"idea": 4, "mvp": 9, "validation": 14, "traction": 22, "fundraising": 28, "scaling": 40}
SEEKING = {
    "idea": 150_000,
    "mvp": 350_000,
    "validation": 600_000,
    "traction": 1_200_000,
    "fundraising": 2_500_000,
    "scaling": 6_000_000,
}


def _records(index: int, row: tuple, email: str, now) -> tuple[dict, dict, dict]:
    (name, tagline, industry, stage, model, country, city, founder, cofounder, co_role, _status, _days,
     users, customers, mrr, problem, solution, customer, background) = row  # fmt: skip
    slug = slugify(name)
    first, partner = founder.split()[0], cofounder.split()[0]
    founded = now - timedelta(days=30 * STAGE_MONTHS[stage] + 11 * (index % 5))
    years = 5 + index % 8

    profile = rules.blank_profile(founder) | {
        "title": "Founder & CEO",
        "country": country,
        "city": city,
        "linkedin": f"https://www.linkedin.com/in/{slugify(founder)}",
        "bio": (
            f"{first} {background}. Started {name} in {founded.year} and works on it full-time from {city}."
        ),
        "experienceYears": years,
        "commitment": "full-time",
        "heardFrom": rules.HEARD_FROM[index % len(rules.HEARD_FROM)],
    }
    startup = rules.blank_startup() | {
        "name": name,
        "tagline": tagline,
        "website": f"https://{slug.replace('-', '')}.example",
        "industry": industry,
        "stage": stage,
        "foundedOn": founded.strftime("%Y-%m"),
        "country": country,
        "incorporated": "yes" if stage != "idea" else "no",
        "businessModel": model,
        "problem": problem,
        "solution": solution,
        "targetCustomer": customer,
        "marketSize": (
            f"Bottom-up: about {(index % 7 + 2) * 15},000 customers like this in {country} and nearby, "
            f"worth roughly ${(index % 6 + 2) * 40} million a year at our prices."
        ),
        "competitors": (
            "Mostly spreadsheets, phone calls and doing nothing. The established suppliers sell to large "
            "organisations and are too expensive and too slow to set up for the customers we serve."
        ),
        "advantage": (
            f"{first} {background}, so the team knows the buyers by name. "
            f"{partner} built the core technology, and the first customers came by referral."
        ),
        "activeUsers": users,
        "payingCustomers": customers,
        "monthlyRevenue": mrr,
        "growthRate": (8 + index % 14) if mrr else None,
        "keyMetric": (
            f"{users:,} active users, growing {8 + index % 14}% a month"
            if users and mrr
            else "Pilot customers live"
        ),
        "raisedToDate": 0 if stage in ("idea", "mvp") else (index % 5 + 1) * 120_000,
        "seeking": SEEKING[stage],
        "useOfFunds": "Two engineering hires, a first sales hire and 18 months of runway.",
        "deckUrl": f"https://docsend.example/{slug}",
        "demoUrl": f"https://{slug.replace('-', '')}.example/demo" if stage not in ("idea", "mvp") else "",
    }
    members = [
        rules.blank_member(founder, email, is_founder=True)
        | {"role": "Founder & CEO", "equity": 52, "commitment": "full-time",
           "linkedin": f"https://www.linkedin.com/in/{slugify(founder)}"},
        rules.blank_member(cofounder, is_founder=True)
        | {"role": co_role, "equity": 40, "commitment": "full-time",
           "linkedin": f"https://www.linkedin.com/in/{slugify(cofounder)}"},
    ]  # fmt: skip
    if index % 3 == 0:
        members.append(
            rules.blank_member("Sam Rivera" if index % 2 else "Jordan Blake")
            | {"role": "Founding engineer", "equity": 3, "commitment": "full-time"}
        )
    team = {
        "members": members,
        "workedTogether": rules.WORKED_TOGETHER[1 + index % 3],
        "whyUs": (
            f"{first} knows the customer and has sold to them before; {partner} has built this kind of "
            f"system at scale. We have worked side by side since before {name} had a name."
        ),
        "hiringNeeds": "A senior engineer and our first customer-success hire.",
    }
    return profile, startup, team


def _events(status: str, created, submitted_at, days: int, now) -> list[ApplicationEvent]:
    def ago(n: float):
        return now - timedelta(days=n)

    events = [
        ApplicationEvent(at=created, by="founder", kind="created", title="Application started"),
        ApplicationEvent(
            at=submitted_at, by="founder", kind="submitted", title="Application submitted for review"
        ),
    ]

    def decision(key: str, at, body: str = ""):
        events.append(
            ApplicationEvent(at=at, by="support", kind="status", title=rules.DECISIONS[key].title, body=body)
        )

    if status != "submitted":
        decision("start_review", ago(days * 0.8))
    if status == "accepted":
        decision("accept", ago(days * 0.5), WELCOME)
    if status == "changes_requested":
        decision("request_changes", ago(days * 0.4), CHANGES)
    return events


def add_startup(index: int, row: tuple, now) -> Application:
    name, status, days = row[0], row[10], row[11]
    slug = slugify(name)
    created, submitted_at = now - timedelta(days=days + 6), now - timedelta(days=days)
    founder = User.objects.create_user(
        f"{slug}@{DOMAIN}", row[7], None, created_at=created, email_verified_at=created
    )
    profile, startup, team = _records(index, row, founder.email, now)
    events = _events(status, created, submitted_at, days, now)

    app = Application(
        user=founder,
        status=status,
        profile=profile,
        startup=startup,
        team=team,
        slug=free_slug(name),
        created_at=created,
        updated_at=events[-1].at,
        submitted_at=submitted_at,
    )
    logo = _asset(f"{slug}-logo.webp") or draw_logo(index)
    app.logo.save(images.new_name(), ContentFile(logo), save=False)
    photo = _asset(f"{slugify(row[7])}.webp")
    if photo:
        app.photo.save(images.new_name(), ContentFile(photo), save=False)
    app.save()

    for event in events:
        event.application = app
    ApplicationEvent.objects.bulk_create(events)
    return app


class Command(BaseCommand):
    help = "Add (or refresh) 50 invented startups, with logos, in the public directory."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Remove the sample startups.")
        parser.add_argument("--force", action="store_true", help="Run even though DEBUG is off.")

    @transaction.atomic
    def handle(self, *args, reset=False, force=False, **options):
        if not (settings.DEBUG or force):
            raise CommandError(
                "seed_startups writes invented sample data, so it only runs with DEBUG on "
                "(DJANGO_DEBUG=true). Pass --force to run it anyway."
            )

        # Deleting the sample founders takes their applications, timelines and images with them.
        _, deleted = User.objects.filter(email__endswith=f"@{DOMAIN}").delete()
        if reset:
            removed = deleted.get(Application._meta.label, 0)
            self.stdout.write(self.style.SUCCESS(f"Removed {plural(removed, 'sample startup')}."))
            return

        now = timezone.now()
        for index, row in enumerate(STARTUPS):
            add_startup(index, row, now)
        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(STARTUPS)} startups with logos "
                f"({Application.objects.count()} applications in the database). Open /startups to see them."
            )
        )
