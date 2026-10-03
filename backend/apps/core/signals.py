from django.conf import settings
from django.db import transaction


class _Refresh:
    """The one website refresh queued for the current transaction; later calls add their tags to it."""

    def __init__(self, tags: set[str]):
        self.tags = tags
        # Django names a failed robust on-commit callback by its __qualname__.
        self.__qualname__ = "refresh_public_pages"

    def __call__(self):
        from .tasks import revalidate_frontend

        revalidate_frontend.delay(sorted(self.tags))


def refresh_public_pages(*tags: str) -> None:
    """After this transaction commits, tell the website its cached pages for these tags are stale.

    One request per transaction, with every tag asked for during it: saving an
    event with three agenda items sends one refresh, not four. Outside a
    transaction the refresh is sent straight away.
    """
    if not settings.FRONTEND_INTERNAL_URL or not settings.REVALIDATE_SECRET or not tags:
        return
    connection = transaction.get_connection()
    if connection.in_atomic_block:
        # Still queued (not dropped by a rollback): join it. A savepoint rolled back
        # after joining can only leave an extra tag in, never lose one.
        for _, callback, _ in connection.run_on_commit:
            if isinstance(callback, _Refresh):
                callback.tags.update(tags)
                return
    transaction.on_commit(_Refresh(set(tags)), robust=True)
