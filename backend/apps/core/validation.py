"""Field checks, ported from the website's src/lib/validation.ts so both sides
give the same answer in the same words. The API is the check that counts.

Every checker returns an error message, or None when the value is fine.
Empty values pass the format checkers: whether a field is *required* is
decided at submission time (see apps/applications/rules.py), so founders can
save a half-finished draft.
"""

import math
import re
from urllib.parse import urlsplit

from django.contrib.auth.password_validation import CommonPasswordValidator
from django.core.exceptions import ValidationError

# Deliberately loose: the only real proof an address works is a sent email.
EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")
NUMBER = re.compile(r"^(\d+\.?\d*|\.\d+)$")
HOST_LABEL = re.compile(r"^[a-z0-9_](?:[a-z0-9_-]{0,61}[a-z0-9_])?$", re.IGNORECASE)
MAX_URL_LENGTH = 2000


class Fields:
    """Reads one JSON body the way the website's forms send it, collecting errors as it goes.

    Text arrives as strings (trimmed here); numbers may be numbers or strings
    with thousands separators ("1,200"); checkboxes as true/false or "on".
    """

    def __init__(self, data):
        self.data = data if isinstance(data, dict) else {}
        self.errors: dict[str, str] = {}

    def has(self, key: str) -> bool:
        return key in self.data

    def error(self, key: str, message: str | None) -> None:
        if message and key not in self.errors:
            self.errors[key] = message

    def text(self, key: str) -> str:
        value = self.data.get(key)
        if value is None:
            return ""
        if isinstance(value, str):
            return value.strip()
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            return str(value)
        self.error(key, "Enter text.")
        return ""

    def number(self, key: str) -> int | float | None:
        """A whole or decimal, non-negative number; empty stays None."""
        value = self.data.get(key)
        if value is None:
            return None
        if isinstance(value, bool):
            self.error(key, "Enter a positive number.")
            return None
        if isinstance(value, (int, float)):
            n = value
        elif isinstance(value, str):
            raw = re.sub(r"[,\s]", "", value)
            if not raw:
                return None
            if not NUMBER.match(raw):
                self.error(key, "Enter a positive number.")
                return None
            n = float(raw)
        else:
            self.error(key, "Enter a positive number.")
            return None
        if not math.isfinite(n) or n < 0:
            self.error(key, "Enter a positive number.")
            return None
        return int(n) if float(n).is_integer() else n

    def flag(self, key: str) -> bool:
        return self.data.get(key) in (True, 1, "on", "true", "1", "yes")


def format_number(n: float) -> str:
    """110 → "110", 110.5 → "110.5" (as JavaScript would print it)."""
    if float(n).is_integer():
        return str(int(n))
    return f"{n:.2f}".rstrip("0").rstrip(".")


def check_name(value: str) -> str | None:
    if not value:
        return "Enter your full name."
    if len(value) < 2:
        return "That name looks too short."
    if len(value) > 80:
        return "That name is too long."
    return None


def check_email(value: str) -> str | None:
    if not value:
        return "Enter your email address."
    if len(value) > 254 or not EMAIL.match(value):
        return "That doesn't look like a valid email address."
    return None


def check_new_password(value: str) -> str | None:
    if not value:
        return "Choose a password."
    if len(value) < 8:
        return "Use at least 8 characters."
    if len(value) > 200:
        return "That password is too long."
    if not re.search(r"[a-zA-Z]", value):
        return "Include at least one letter."
    if not re.search(r"[0-9]", value):
        return "Include at least one number."
    try:
        CommonPasswordValidator().validate(value)
    except ValidationError:
        return "That password is too common. Choose one that's harder to guess."
    return None


def max_length(value: str, limit: int) -> str | None:
    return f"Keep this under {limit} characters." if len(value) > limit else None


def optional_email(value: str) -> str | None:
    return check_email(value) if value else None


def normalize_url(value: str) -> str:
    """Accepts "acme.com" as well as full URLs; saves always carry a scheme."""
    if not value:
        return ""
    return value if re.match(r"^https?://", value, re.IGNORECASE) else f"https://{value}"


def optional_url(value: str) -> str | None:
    if not value:
        return None
    if len(value) > MAX_URL_LENGTH:
        return max_length(value, MAX_URL_LENGTH)
    bad = "That doesn't look like a valid link."
    try:
        parts = urlsplit(normalize_url(value))
        host = parts.hostname
        parts.port  # noqa: B018 — raises ValueError on a malformed port
    except ValueError:
        return bad
    if not host or "." not in host or re.search(r"\s", parts.netloc):
        return bad
    try:
        ascii_host = host.encode("idna").decode("ascii")
    except UnicodeError:
        return bad
    labels = ascii_host.rstrip(".").split(".")
    if not all(HOST_LABEL.match(label) for label in labels):
        return bad
    return None


def optional_linkedin(value: str) -> str | None:
    bad = optional_url(value)
    if bad:
        return bad
    if value and not re.search(r"linkedin\.com/", value, re.IGNORECASE):
        return "Use your LinkedIn profile link (linkedin.com/in/…)."
    return None


def optional_phone(value: str) -> str | None:
    if not value:
        return None
    digits = re.sub(r"[^0-9]", "", value)
    if len(digits) < 7 or len(digits) > 15 or re.search(r"[^0-9\s()+.-]", value):
        return "Enter a phone number with country code, e.g. +1 415 555 0100."
    return None


def one_of(value: str, allowed) -> bool:
    return value in allowed
