from functools import partial

from django.conf import settings
from django.db import transaction


def refresh_public_pages(*tags: str) -> None:
    """After this transaction commits, tell the website its cached pages for these tags are stale."""
    if not settings.FRONTEND_INTERNAL_URL or not settings.REVALIDATE_SECRET:
        return
    from .tasks import revalidate_frontend

    transaction.on_commit(partial(revalidate_frontend.delay, sorted(set(tags))), robust=True)
