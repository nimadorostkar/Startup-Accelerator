import ipaddress
from functools import lru_cache

from django.conf import settings


@lru_cache(maxsize=1)
def _trusted_networks():
    return tuple(ipaddress.ip_network(n, strict=False) for n in settings.TRUSTED_PROXY_NETWORKS)


def _is_trusted(value: str) -> bool:
    try:
        address = ipaddress.ip_address(value)
    except ValueError:
        return False
    return any(address in network for network in _trusted_networks())


def _valid_ip(value: str) -> bool:
    try:
        ipaddress.ip_address(value)
    except ValueError:
        return False
    return True


def client_ip(request) -> str:
    """The visitor's address, for rate limits and audit fields.

    X-Forwarded-For is believed only when the request arrives from our own
    proxy or frontend (TRUSTED_PROXY_NETWORKS); anyone else could forge it.
    Walking the chain from the nearest hop, the first address that isn't
    ours is the client.
    """
    remote = request.META.get("REMOTE_ADDR", "") or ""
    if not _is_trusted(remote):
        return remote
    hops = [h.strip() for h in request.META.get("HTTP_X_FORWARDED_FOR", "").split(",") if h.strip()]
    hops = [h for h in hops if _valid_ip(h)]
    for hop in reversed(hops):
        if not _is_trusted(hop):
            return hop
    return hops[0] if hops else remote


def user_agent(request) -> str:
    return (request.META.get("HTTP_USER_AGENT") or "")[:300]
