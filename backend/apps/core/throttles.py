"""Rate limits, stored in the shared cache (Redis) so every API worker counts together.

Rates are configured in settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"].
"""

from django.conf import settings
from rest_framework import throttling

from .net import client_ip, is_internal


class _Switchable:
    def allow_request(self, request, view):
        if not getattr(settings, "API_THROTTLING", True) or is_internal(request):
            return True
        return super().allow_request(request, view)

    def get_ident(self, request):
        return client_ip(request)


class AnonRateThrottle(_Switchable, throttling.AnonRateThrottle):
    pass


class UserRateThrottle(_Switchable, throttling.UserRateThrottle):
    pass


class IPRateThrottle(_Switchable, throttling.SimpleRateThrottle):
    """Counts requests per client address for one scope."""

    def get_cache_key(self, request, view):
        return self.cache_format % {"scope": self.scope, "ident": self.get_ident(request)}


def ip_throttle(scope: str) -> type[IPRateThrottle]:
    return type(f"{scope.title().replace('_', '')}IPThrottle", (IPRateThrottle,), {"scope": scope})
