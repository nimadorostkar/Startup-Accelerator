"""Loads the website's launch content (the events and newsletter issues it
shipped with) into the database, so the site isn't empty on day one.

    python manage.py seed_content            add any that are missing (by slug)
    python manage.py seed_content --if-empty only once per database: never again after
                                             a first load, nor where content already exists
    python manage.py seed_content --update   also overwrite ones that exist

Edit or delete them afterwards in the back office (/backoffice/).
"""

import json
from datetime import date, datetime
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.content.models import AgendaItem, Event, Post, SeedRecord

# The SeedRecord name that marks this load as done on this database.
SEED_NAME = "content"

FIXTURES = Path(__file__).resolve().parents[2] / "fixtures"


def blocks_to_text(blocks: list[dict]) -> str:
    parts = []
    for block in blocks:
        kind = block["type"]
        if kind == "p":
            parts.append(block["text"])
        elif kind == "h2":
            parts.append(f"## {block['text']}")
        elif kind == "list":
            if block.get("ordered"):
                parts.append("\n".join(f"{n}. {item}" for n, item in enumerate(block["items"], 1)))
            else:
                parts.append("\n".join(f"- {item}" for item in block["items"]))
        elif kind == "quote":
            quote = f"> {block['text']}"
            if block.get("cite"):
                quote += f"\n> — {block['cite']}"
            parts.append(quote)
    return "\n\n".join(parts)


class Command(BaseCommand):
    help = "Load the launch events and newsletter issues."

    def add_arguments(self, parser):
        parser.add_argument(
            "--if-empty",
            action="store_true",
            help="Do nothing if content was loaded before on this database, or any event or post exists.",
        )
        parser.add_argument(
            "--update", action="store_true", help="Overwrite existing items with the same slug."
        )

    @transaction.atomic
    def handle(self, *args, if_empty=False, update=False, **options):
        if if_empty:
            if SeedRecord.objects.filter(name=SEED_NAME).exists():
                self.stdout.write("Launch content was loaded on this database before; nothing loaded.")
                return
            if Event.objects.exists() or Post.objects.exists():
                SeedRecord.objects.get_or_create(name=SEED_NAME)
                self.stdout.write("Content already exists; nothing loaded.")
                return
        events = json.loads((FIXTURES / "placeholder_events.json").read_text())
        posts = json.loads((FIXTURES / "placeholder_posts.json").read_text())
        created = {"events": 0, "posts": 0}

        for e in events:
            fields = {
                "title": e["title"],
                "type": e["type"],
                "format": e["format"],
                "city": e["city"],
                "start": datetime.fromisoformat(e["start"]),
                "end": datetime.fromisoformat(e["end"]),
                "tz": e["tz"],
                "capacity": e["capacity"],
                "summary": e["summary"],
                "about": "\n\n".join(e["about"]),
                "takeaways": "\n".join(e["takeaways"]),
                "audience": e["audience"],
            }
            event = Event.objects.filter(slug=e["slug"]).first()
            if event and not update:
                continue
            if event:
                for key, value in fields.items():
                    setattr(event, key, value)
                event.save()
                event.agenda.all().delete()
            else:
                event = Event.objects.create(slug=e["slug"], **fields)
                created["events"] += 1
            AgendaItem.objects.bulk_create(
                AgendaItem(event=event, time=a["time"], item=a["item"], order=i)
                for i, a in enumerate(e["agenda"])
            )

        for p in posts:
            fields = {
                "issue": p["issue"],
                "title": p["title"],
                "excerpt": p["excerpt"],
                "category": p["category"],
                "author": p["author"],
                "published_on": date.fromisoformat(p["date"]),
                "minutes": p["minutes"],
                "body": blocks_to_text(p["body"]),
            }
            post = Post.objects.filter(slug=p["slug"]).first()
            if post and not update:
                continue
            if post:
                # save(), not a queryset update: the change signals refresh the newsletter pages.
                for key, value in fields.items():
                    setattr(post, key, value)
                post.save()
            else:
                Post.objects.create(slug=p["slug"], **fields)
                created["posts"] += 1

        SeedRecord.objects.get_or_create(name=SEED_NAME)
        self.stdout.write(
            self.style.SUCCESS(f"Loaded {created['events']} new event(s) and {created['posts']} new post(s).")
        )
