"""A startup's logo and its founder's photo.

Founders upload them from the dashboard; whatever arrives is checked, turned
the right way up, shrunk and re-encoded as WebP, so nothing a browser sent is
ever stored or served as it came. Files get random names and never change:
a new upload is a new file (and a new address), so they can be cached forever.
"""

import uuid
from io import BytesIO

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from PIL import Image, ImageOps, UnidentifiedImageError

from apps.core.exceptions import Invalid

MAX_BYTES = 5 * 1024 * 1024
MAX_PIXELS = 40_000_000
SIZE = 512
FORMATS = {"PNG", "JPEG", "WEBP"}

# kind → folder under MEDIA_ROOT
FOLDERS = {"logo": "startups", "photo": "founders"}

TOO_BIG = "Keep the image under 5 MB."
NOT_AN_IMAGE = "Use a PNG, JPEG or WebP image."


def new_name() -> str:
    return f"{uuid.uuid4().hex}.webp"


def process(upload, kind: str) -> ContentFile:
    """The uploaded file as a WebP of at most 512 × 512: photos cropped square, logos kept whole."""
    if upload is None or not hasattr(upload, "read"):
        raise Invalid({"file": "Choose an image to upload."})
    if getattr(upload, "size", 0) > MAX_BYTES:
        raise Invalid({"file": TOO_BIG})
    try:
        image = Image.open(upload)
        if image.format not in FORMATS:
            raise Invalid({"file": NOT_AN_IMAGE})
        if image.width * image.height > MAX_PIXELS:
            raise Invalid({"file": "That image is too large. Use one under 6,000 pixels wide."})
        image = ImageOps.exif_transpose(image)
        image = image.convert("RGBA" if kind == "logo" else "RGB")
    except Invalid:
        raise
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError):
        raise Invalid({"file": NOT_AN_IMAGE}) from None

    if kind == "photo":
        image = ImageOps.fit(image, (SIZE, SIZE), Image.Resampling.LANCZOS)
    else:
        image.thumbnail((SIZE, SIZE), Image.Resampling.LANCZOS)
    out = BytesIO()
    image.save(out, "WEBP", quality=86, method=6)
    return ContentFile(out.getvalue(), name=new_name())


def url(field) -> str:
    """The address the website shows it from, or "" when there is none."""
    return f"{settings.MEDIA_URL}{field.name}" if field else ""


def discard(name: str | None) -> None:
    """Removes a file that nothing points to any more."""
    if name:
        default_storage.delete(name)
