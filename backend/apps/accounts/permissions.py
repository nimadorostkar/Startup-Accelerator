from rest_framework import exceptions
from rest_framework.permissions import BasePermission


class IsSignedIn(BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            raise exceptions.NotAuthenticated()
        return True


class IsReviewer(BasePermission):
    """Signed out → 401. Signed in but not a reviewer → 404, so the review panel isn't advertised."""

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            raise exceptions.NotAuthenticated()
        if not request.user.is_reviewer:
            raise exceptions.NotFound()
        return True
