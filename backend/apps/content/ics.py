"""A calendar invite (RFC 5545) for event confirmation emails."""

from datetime import UTC

from django.conf import settings

from apps.core.utils import now


def _escape(text: str) -> str:
    """RFC 5545 TEXT escaping: backslash, semicolon, comma and line breaks."""
    out = text.replace("\\", "\\\\")
    for char in (";", ","):
        out = out.replace(char, "\\" + char)
    return out.replace("\r\n", "\\n").replace("\n", "\\n")


def _fold(line: str) -> str:
    """Lines longer than 75 octets continue on the next line after a space."""
    encoded = line.encode()
    if len(encoded) <= 75:
        return line
    parts, current = [], b""
    for ch in line:
        b = ch.encode()
        if len(current) + len(b) > (75 if not parts else 74):
            parts.append(current.decode())
            current = b""
        current += b
    parts.append(current.decode())
    return "\r\n ".join(parts)


def _stamp(value) -> str:
    return value.astimezone(UTC).strftime("%Y%m%dT%H%M%SZ")


def invite(event, *, uid: str, location: str, description: str) -> str:
    domain = settings.SITE_URL.split("://")[-1].split("/")[0].split(":")[0] or "fundup.club"
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Fundup Club//Events//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        f"UID:{uid}@{domain}",
        f"DTSTAMP:{_stamp(now())}",
        f"DTSTART:{_stamp(event.start)}",
        f"DTEND:{_stamp(event.end)}",
        f"SUMMARY:{_escape(event.title)}",
        f"DESCRIPTION:{_escape(description)}",
        f"LOCATION:{_escape(location)}",
        f"URL:{settings.SITE_URL}/events/{event.slug}",
        "END:VEVENT",
        "END:VCALENDAR",
    ]
    return "\r\n".join(_fold(line) for line in lines) + "\r\n"
