from datetime import UTC, datetime

from django.utils import timezone


def iso(value: datetime | None) -> str | None:
    """UTC timestamp in the frontend's format: 2026-09-16T10:30:00.000Z."""
    if value is None:
        return None
    return value.astimezone(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def now() -> datetime:
    return timezone.now()


def plural(n: int, one: str, many: str | None = None) -> str:
    return f"{n} {one if n == 1 else (many or one + 's')}"
