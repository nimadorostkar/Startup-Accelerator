"""Development only: fills the database with invented sample applications so
the review queue has something to work with (the backend's version of
scripts/seed-demo.mts).

    python manage.py seed_demo            add / refresh the sample applications
    python manage.py seed_demo --reset    remove them again

It refuses to run unless DEBUG is on (DJANGO_DEBUG=true); --force runs it
anyway. The sample founders and reviewers are users at @demo.fundup.example
and they are the only records it touches: each run deletes them, with their
applications, timelines, scorecards and notes, and creates them afresh. Real
applications are left alone. Every name, company and number below is invented.
"""

from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime, timedelta

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import User
from apps.applications import rules
from apps.applications.models import Application, ApplicationEvent, InternalNote, Scorecard, slugify
from apps.applications.services import free_slug, team_average
from apps.core.utils import plural

DOMAIN = "demo.fundup.example"

# The script also had "you" (the old dev-founder stand-in, Alex Rivera). No
# such user exists any more, so what was assigned to "you" is Maya's here.
REVIEWERS = {
    "maya": (f"maya.chen@{DOMAIN}", "Maya Chen"),
    "jonas": (f"jonas.weber@{DOMAIN}", "Jonas Weber"),
}

WELCOME = "Welcome to the Fall 2026 cohort! Onboarding call invites are on their way."


@dataclass(frozen=True, kw_only=True)
class Spec:
    startup: str  # the founder's email (<slug>@demo.fundup.example) and public slug come from this
    tagline: str
    industry: str
    stage: str
    model: str
    country: str
    founder: str
    cofounder: str
    status: str
    submitted_days_ago: int | None
    mrr: int | None
    users: int | None
    seeking: int | None
    problem: str
    assignee: str | None = None
    # (reviewer, [problem, solution, market, team, traction], recommendation, summary)
    scorecards: list[tuple[str, list[int], str, str]] = field(default_factory=list)
    # (days ago, key in rules.DECISIONS, optional message to the founder)
    support_events: list[tuple[int, str] | tuple[int, str, str]] = field(default_factory=list)
    note: tuple[str, str] | None = None  # (reviewer, body), written a day ago
    incomplete: bool = False


SPECS = [
    Spec(
        startup="Ledgerly",
        tagline="Month-end close for agencies, done in a day",
        industry="Fintech",
        stage="traction",
        model="Subscription (B2B)",
        country="United Kingdom",
        founder="Maya Rosen",
        cofounder="Tom Achebe",
        status="submitted",
        submitted_days_ago=8,
        mrr=21000,
        users=140,
        seeking=1_200_000,
        problem=(
            "Creative agencies spend 6–9 days closing each month because billable hours, retainers and "
            "expenses live in four different tools."
        ),
    ),
    Spec(
        startup="Tidewell",
        tagline="Flood-risk forecasts for small coastal councils",
        industry="Climate & energy",
        stage="mvp",
        model="Subscription (B2B)",
        country="Indonesia",
        founder="Sari Wibowo",
        cofounder="Daniel Hart",
        status="submitted",
        submitted_days_ago=6,
        mrr=None,
        users=4,
        seeking=500_000,
        problem=(
            "Coastal councils plan flood defences from 10-year-old maps; they can't afford consultancies "
            "and get no warning of new risk zones."
        ),
    ),
    Spec(
        startup="Kitebase",
        tagline="Feature flags your support team can safely use",
        industry="B2B software / SaaS",
        stage="validation",
        model="Subscription (B2B)",
        country="Nigeria",
        founder="Tunde Adeyemi",
        cofounder="Ife Okafor",
        status="submitted",
        submitted_days_ago=2,
        mrr=1800,
        users=36,
        seeking=400_000,
        problem=(
            "Support teams wait days for engineers to toggle features for a single customer, because flag "
            "tools are built only for developers."
        ),
    ),
    Spec(
        startup="Restly",
        tagline="Sleep coaching for night-shift nurses",
        industry="Health & biotech",
        stage="validation",
        model="Subscription (B2C)",
        country="Brazil",
        founder="Camila Ferreira",
        cofounder="Rafael Souza",
        status="in_review",
        submitted_days_ago=5,
        mrr=3200,
        users=900,
        seeking=600_000,
        assignee="maya",
        problem=(
            "Night-shift nurses average under five hours of sleep; generic sleep apps assume a 9-to-5 "
            "schedule and make rotating shifts worse."
        ),
        scorecards=[
            (
                "maya",
                [4, 4, 3, 5, 3],
                "interview",
                "Strong founder–market fit (Camila was an ICU nurse). Retention data is early but promising.",
            )
        ],
        support_events=[(4, "start_review")],
    ),
    Spec(
        startup="Relaywave",
        tagline="An AI marketing team for one-person companies",
        industry="AI & machine learning",
        stage="traction",
        model="Subscription (B2B)",
        country="United States",
        founder="Marcus Hale",
        cofounder="Lena Ortiz",
        status="in_review",
        submitted_days_ago=3,
        mrr=12500,
        users=1500,
        seeking=1_500_000,
        assignee="maya",
        problem=(
            "Solo founders know they should market consistently but can't afford an agency, so campaigns "
            "start and stall within weeks."
        ),
        support_events=[(2, "start_review")],
        note=(
            "jonas",
            "Check how much of the MRR is from their previous agency clients — could flatter the numbers.",
        ),
    ),
    Spec(
        startup="Orbitly",
        tagline="Tutoring marketplace for rural secondary schools",
        industry="Education",
        stage="mvp",
        model="Marketplace / take rate",
        country="Kenya",
        founder="Amina Otieno",
        cofounder="Peter Kamau",
        status="changes_requested",
        submitted_days_ago=9,
        mrr=600,
        users=310,
        seeking=350_000,
        assignee="jonas",
        problem=(
            "Rural schools have one maths teacher for 200 students, and qualified tutors in cities have no "
            "reliable way to reach them."
        ),
        scorecards=[
            (
                "jonas",
                [4, 3, 2, 4, 2],
                "interview",
                "Great mission, but supply side is unproven. Need tutor retention numbers.",
            )
        ],
        support_events=[
            (8, "start_review"),
            (
                6,
                "request_changes",
                "Thanks — compelling problem. Before interviews, please add:\n"
                "• How many tutors have completed 4+ sessions\n"
                "• Your cost to acquire a school",
            ),
        ],
    ),
    Spec(
        startup="Greenloop",
        tagline="Returnable packaging for grocery delivery",
        industry="Climate & energy",
        stage="fundraising",
        model="Transactional / usage-based",
        country="Netherlands",
        founder="Eva de Vries",
        cofounder="Joost Bakker",
        status="accepted",
        submitted_days_ago=21,
        mrr=34000,
        users=5200,
        seeking=2_000_000,
        assignee="maya",
        problem=(
            "Online grocers ship each order in 6–10 single-use bags; customers hate the waste and grocers "
            "pay for packaging every time."
        ),
        scorecards=[
            (
                "maya",
                [5, 4, 4, 5, 5],
                "accept",
                "Clear winner. Two grocer contracts signed, packaging reused 38 times on average.",
            ),
            ("jonas", [4, 4, 4, 4, 5], "accept", "Operationally complex but they've proven the loop works."),
        ],
        support_events=[(19, "start_review"), (12, "accept", WELCOME)],
    ),
    Spec(
        startup="Parcelhive",
        tagline="Shared parcel lockers for apartment blocks",
        industry="Mobility & logistics",
        stage="idea",
        model="Hardware sales",
        country="Poland",
        founder="Kasia Nowak",
        cofounder="Piotr Zielinski",
        status="declined",
        submitted_days_ago=18,
        mrr=None,
        users=None,
        seeking=250_000,
        assignee="jonas",
        problem=(
            "Couriers leave parcels in apartment lobbies where they get stolen, and landlords won't pay for "
            "a locker from each courier company."
        ),
        scorecards=[
            (
                "jonas",
                [3, 2, 2, 3, 1],
                "decline",
                "Crowded space and no pilot yet. Encourage them to reapply with a building partner.",
            )
        ],
        support_events=[
            (15, "start_review"),
            (
                11,
                "decline",
                "Thank you for applying. We'd love to see a pilot with a building partner — please apply "
                "again next cycle.",
            ),
        ],
    ),
    # ── More of the cohort ──
    Spec(
        startup="Cobaltry",
        tagline="Battery health passports for second-life EV packs",
        industry="Climate & energy",
        stage="scaling",
        model="Transactional / usage-based",
        country="Germany",
        founder="Lea Hoffmann",
        cofounder="Emre Yilmaz",
        status="accepted",
        submitted_days_ago=26,
        mrr=48000,
        users=60,
        seeking=3_000_000,
        assignee="jonas",
        problem=(
            "Used EV batteries are scrapped or sold blind because buyers can't verify how much capacity is "
            "left in each pack."
        ),
        scorecards=[
            (
                "jonas",
                [5, 4, 5, 4, 5],
                "accept",
                "Recyclers and storage integrators already pay per passport. Strong unit economics.",
            )
        ],
        support_events=[(24, "start_review"), (17, "accept", WELCOME)],
    ),
    Spec(
        startup="Pillpath",
        tagline="Medication reminders families can see",
        industry="Health & biotech",
        stage="traction",
        model="Subscription (B2C)",
        country="India",
        founder="Ananya Rao",
        cofounder="Vikram Mehta",
        status="accepted",
        submitted_days_ago=24,
        mrr=15500,
        users=8200,
        seeking=1_000_000,
        assignee="maya",
        problem=(
            "Elderly parents miss doses and their adult children only find out at the next doctor's visit."
        ),
        scorecards=[
            (
                "maya",
                [5, 4, 4, 4, 4],
                "accept",
                "Retention is excellent: 71% of families still active after 90 days.",
            )
        ],
        support_events=[(22, "start_review"), (15, "accept", WELCOME)],
    ),
    Spec(
        startup="Quarrylane",
        tagline="Building materials, ordered by the truckload, for small builders",
        industry="Marketplaces",
        stage="traction",
        model="Marketplace / take rate",
        country="Mexico",
        founder="Lucia Navarro",
        cofounder="Diego Ramos",
        status="accepted",
        submitted_days_ago=23,
        mrr=27000,
        users=640,
        seeking=1_800_000,
        assignee="maya",
        problem=(
            "Small builders spend a day a week phoning yards for cement and steel prices, and still overpay "
            "versus big contractors."
        ),
        scorecards=[
            (
                "maya",
                [4, 4, 5, 4, 4],
                "accept",
                "Big, fragmented market and a clear wedge. Repeat orders are strong.",
            )
        ],
        support_events=[(21, "start_review"), (14, "accept", WELCOME)],
    ),
    # ── More in review ──
    Spec(
        startup="Lumora",
        tagline="Low-cost light sensors that tell growers when to pick",
        industry="Deep tech & hardware",
        stage="mvp",
        model="Hardware sales",
        country="Chile",
        founder="Valentina Rojas",
        cofounder="Matias Silva",
        status="in_review",
        submitted_days_ago=7,
        mrr=None,
        users=12,
        seeking=800_000,
        assignee="jonas",
        problem=(
            "Vineyards judge ripeness by tasting grapes row by row, so harvest timing is a guess across "
            "hundreds of hectares."
        ),
        support_events=[(5, "start_review")],
    ),
    Spec(
        startup="Tallybird",
        tagline="Bookkeeping over WhatsApp for market traders",
        industry="Fintech",
        stage="validation",
        model="Subscription (B2C)",
        country="Ghana",
        founder="Kwame Mensah",
        cofounder="Abena Owusu",
        status="in_review",
        submitted_days_ago=4,
        mrr=900,
        users=2300,
        seeking=450_000,
        assignee="maya",
        problem=(
            "Market traders keep accounts in notebooks, so banks can't see their income and won't lend "
            "to them."
        ),
        support_events=[(3, "start_review")],
    ),
    Spec(
        startup="Shiftnest",
        tagline="Shift swaps for hourly retail teams, approved in a tap",
        industry="B2B software / SaaS",
        stage="traction",
        model="Subscription (B2B)",
        country="Canada",
        founder="Olivia Tremblay",
        cofounder="Noah Chen",
        status="in_review",
        submitted_days_ago=6,
        mrr=9800,
        users=4100,
        seeking=1_100_000,
        assignee="maya",
        problem=(
            "Store managers lose hours a week texting staff to cover shifts, and no-shows cost retailers "
            "sales every weekend."
        ),
        support_events=[(5, "start_review")],
    ),
    # ── More applied ──
    Spec(
        startup="Wordloom",
        tagline="A reading tutor that listens while kids read aloud",
        industry="Education",
        stage="validation",
        model="Subscription (B2C)",
        country="Ireland",
        founder="Aoife Byrne",
        cofounder="Sean Walsh",
        status="submitted",
        submitted_days_ago=1,
        mrr=2100,
        users=1200,
        seeking=600_000,
        problem=(
            "Children need someone to listen as they practise reading, and most parents don't have twenty "
            "spare minutes every evening."
        ),
    ),
    Spec(
        startup="Haulbridge",
        tagline="Return loads for regional truckers, matched in minutes",
        industry="Mobility & logistics",
        stage="validation",
        model="Marketplace / take rate",
        country="Turkey",
        founder="Elif Demir",
        cofounder="Can Aksoy",
        status="submitted",
        submitted_days_ago=3,
        mrr=3400,
        users=280,
        seeking=700_000,
        problem=(
            "A third of regional trucks drive home empty because finding a return load still happens "
            "through phone calls and brokers."
        ),
    ),
    Spec(
        startup="Crumbly",
        tagline="Surprise boxes of unsold bakery goods at closing time",
        industry="Consumer",
        stage="traction",
        model="Marketplace / take rate",
        country="France",
        founder="Chloe Martin",
        cofounder="Hugo Laurent",
        status="submitted",
        submitted_days_ago=4,
        mrr=7600,
        users=15000,
        seeking=900_000,
        problem=(
            "Bakeries throw away up to a fifth of what they bake each day, while customers would happily "
            "buy it at a discount."
        ),
    ),
    Spec(
        startup="Clausewise",
        tagline="Contract review for freelancers, in plain language",
        industry="AI & machine learning",
        stage="mvp",
        model="Subscription (B2C)",
        country="Spain",
        founder="Marta Gil",
        cofounder="Pablo Ortega",
        status="submitted",
        submitted_days_ago=2,
        mrr=450,
        users=520,
        seeking=400_000,
        problem=(
            "Freelancers sign client contracts they don't fully understand because a lawyer costs more than "
            "the project is worth."
        ),
    ),
    Spec(
        startup="Rootcell",
        tagline="Climate control software for small vertical farms",
        industry="Climate & energy",
        stage="mvp",
        model="Subscription (B2B)",
        country="Singapore",
        founder="Wei Lin Tan",
        cofounder="Arjun Nair",
        status="submitted",
        submitted_days_ago=5,
        mrr=1200,
        users=9,
        seeking=650_000,
        problem=(
            "Small vertical farms lose crops to temperature swings because industrial control systems are "
            "priced for giant facilities."
        ),
    ),
    Spec(
        startup="Mendmark",
        tagline="Repair-first returns for outdoor gear brands",
        industry="E-commerce & retail",
        stage="validation",
        model="Transactional / usage-based",
        country="Sweden",
        founder="Elin Lindqvist",
        cofounder="Oskar Berg",
        status="submitted",
        submitted_days_ago=7,
        mrr=2800,
        users=14,
        seeking=500_000,
        problem=(
            "Outdoor brands refund or landfill returned jackets with small faults that a local repair shop "
            "could fix for a few euros."
        ),
    ),
    Spec(
        startup="Vetlane",
        tagline="Video vet triage for rural pet owners",
        industry="Health & biotech",
        stage="idea",
        model="Subscription (B2C)",
        country="Australia",
        founder="Grace Mitchell",
        cofounder="Liam O'Connor",
        status="submitted",
        submitted_days_ago=9,
        mrr=None,
        users=None,
        seeking=300_000,
        problem=(
            "Rural pet owners drive hours to a vet without knowing whether it's an emergency or something "
            "that could wait until morning."
        ),
    ),
    Spec(
        startup="Quillary",
        tagline="Grant applications drafted in hours, not weeks",
        industry="AI & machine learning",
        stage="traction",
        model="Subscription (B2B)",
        country="South Africa",
        founder="Thandi Nkosi",
        cofounder="Ruan Botha",
        status="submitted",
        submitted_days_ago=10,
        mrr=11200,
        users=380,
        seeking=1_000_000,
        problem=(
            "Small nonprofits miss funding because each grant application takes weeks of staff time they "
            "don't have."
        ),
    ),
    Spec(
        startup="Mintleaf",
        tagline="",
        industry="Consumer",
        stage="idea",
        model="",
        country="",
        founder="Jordan Lee",
        cofounder="",
        status="draft",
        submitted_days_ago=None,
        mrr=None,
        users=None,
        seeking=None,
        problem="Houseplants die because owners guess at watering.",
        incomplete=True,
    ),
]


# ---------------------------------------------------------------- answers


def _profile(spec: Spec) -> dict:
    profile = rules.blank_profile(spec.founder) | {"country": spec.country, "heardFrom": "Fundup Club event"}
    if not spec.incomplete:
        profile |= {
            "phone": "+44 20 7946 0000",
            "title": "CEO & co-founder",
            "linkedin": f"https://linkedin.com/in/{'-'.join(spec.founder.lower().split())}",
            "bio": (
                f"Previously built products in {spec.industry.lower()} for six years; started "
                f"{spec.startup} after seeing the problem first-hand."
            ),
            "experienceYears": 6,
            "commitment": "full-time",
        }
    return profile


def _startup(spec: Spec, slug: str) -> dict:
    mrr = spec.mrr
    startup = rules.blank_startup() | {
        "name": spec.startup,
        "tagline": spec.tagline,
        "industry": spec.industry,
        "stage": spec.stage,
        "country": spec.country,
        "businessModel": spec.model,
        "problem": spec.problem,
        "activeUsers": spec.users,
        "payingCustomers": round(mrr / 150) if mrr else None,
        "monthlyRevenue": mrr,
        "growthRate": 14 if mrr else None,
        "raisedToDate": 150_000 if mrr else 0,
        "seeking": spec.seeking,
    }
    if not spec.incomplete:
        startup |= {
            "website": f"https://{spec.startup.lower()}.example",
            "foundedOn": "2025-06",
            "incorporated": "yes",
            "solution": (
                f"{spec.startup} gives them a simple product that fixes this end to end, priced for small "
                "teams and live within a day of signing up."
            ),
            "targetCustomer": "Small and mid-sized organisations in our home market first.",
            "marketSize": "Bottom-up: ~40k target customers at ~$1,500 a year.",
            "competitors": "Spreadsheets and enterprise suites that are too heavy for this segment.",
            "advantage": (
                "Founders lived this problem for years and already have the first customers lined up."
            ),
            "useOfFunds": "Engineering hires and 18 months of runway.",
            "deckUrl": f"https://docsend.example/{slug}",
        }
    return startup


def _team(spec: Spec, email: str) -> dict:
    team = rules.blank_team(spec.founder, email)
    team["members"][0] |= {
        "role": "CEO & co-founder",
        "equity": 55 if spec.cofounder else 100,
        "commitment": "full-time",
    }
    if spec.cofounder:
        team["members"].append(
            rules.blank_member(spec.cofounder, is_founder=True)
            | {"role": "CTO & co-founder", "equity": 45, "commitment": "full-time"}
        )
    if not spec.incomplete:
        partner = spec.cofounder.split()[0] if spec.cofounder else "the team"
        team |= {
            "workedTogether": "1–3 years",
            "whyUs": (
                f"{spec.founder.split()[0]} spent years on the customer side of this problem; {partner} "
                "built the technical core at a previous company."
            ),
        }
    return team


# ---------------------------------------------------------------- records


def add_application(spec: Spec, reviewers: dict[str, User], now: datetime) -> Application:
    def ago(days: int) -> datetime:
        return now - timedelta(days=days)

    days = spec.submitted_days_ago
    created = ago((3 if days is None else days) + 4)
    submitted_at = None if days is None else ago(days)
    slug = slugify(spec.startup)
    assignee = reviewers[spec.assignee] if spec.assignee else None
    founder = User.objects.create_user(f"{slug}@{DOMAIN}", spec.founder, None, created_at=created)

    events = [ApplicationEvent(at=created, by="founder", kind="created", title="Application started")]
    if submitted_at is not None:
        events.append(
            ApplicationEvent(
                at=submitted_at, by="founder", kind="submitted", title="Application submitted for review"
            )
        )
    for event_days, decision, *message in spec.support_events:
        # Recorded the way services.decide() records a decision, with the reviewer as the (audit-only) actor.
        events.append(
            ApplicationEvent(
                at=ago(event_days),
                by="support",
                kind="status",
                title=rules.DECISIONS[decision].title,
                body=message[0] if message else "",
                actor=assignee,
            )
        )

    app = Application.objects.create(
        user=founder,
        status=spec.status,
        profile=_profile(spec),
        startup=_startup(spec, slug),
        team=_team(spec, founder.email),
        assignee=assignee,
        # A real startup may already use the name: take the next free address, like a real submission.
        slug=None if spec.status == "draft" else free_slug(spec.startup),
        created_at=created,
        updated_at=events[-1].at,
        submitted_at=submitted_at,
    )
    for event in events:
        event.application = app
    ApplicationEvent.objects.bulk_create(events)

    for reviewer, scores, recommendation, summary in spec.scorecards:
        Scorecard.objects.create(
            application=app,
            reviewer=reviewers[reviewer],
            **dict(zip(rules.SCORE_AREAS, scores, strict=True)),
            recommendation=recommendation,
            summary=summary,
            updated_at=ago(max((1 if days is None else days) - 1, 0)),
        )
    if spec.scorecards:
        app.team_score = team_average(app)
        app.save(update_fields=["team_score"])

    if spec.note:
        author, body = spec.note
        InternalNote.objects.create(application=app, author=reviewers[author], body=body, at=ago(1))
    return app


class Command(BaseCommand):
    help = "Add (or refresh) invented sample applications for the review queue. Development only."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Remove the sample applications.")
        parser.add_argument("--force", action="store_true", help="Run even though DEBUG is off.")

    @transaction.atomic
    def handle(self, *args, reset=False, force=False, **options):
        if not (settings.DEBUG or force):
            raise CommandError(
                "seed_demo writes invented sample data, so it only runs with DEBUG on (DJANGO_DEBUG=true). "
                "Pass --force to run it anyway."
            )

        # Deleting the demo users takes their applications, events, scorecards and notes with them.
        _, deleted = User.objects.filter(email__endswith=f"@{DOMAIN}").delete()
        if reset:
            removed = deleted.get(Application._meta.label, 0)
            self.stdout.write(self.style.SUCCESS(f"Removed {plural(removed, 'sample application')}."))
            return

        now = timezone.now()
        reviewers = {
            key: User.objects.create_user(email, name, None, role=User.Role.REVIEWER, email_verified_at=now)
            for key, (email, name) in REVIEWERS.items()
        }
        for spec in SPECS:
            add_application(spec, reviewers, now)

        counts = Counter(spec.status for spec in SPECS)
        mix = ", ".join(
            f"{counts[status]} {label.lower()}"
            for status, label in rules.STATUS_LABELS.items()
            if counts[status]
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(SPECS)} sample applications ({mix}; {Application.objects.count()} in the "
                "database). Open /admin to review them."
            )
        )
