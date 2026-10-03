import re

from drf_spectacular.extensions import OpenApiAuthenticationExtension
from drf_spectacular.openapi import AutoSchema as BaseAutoSchema


class AutoSchema(BaseAutoSchema):
    """Operation ids from the view and method (`EventDetailView` GET → `event_detail_get`), so a
    list and its detail endpoint never collide in the OpenAPI document."""

    def get_operation_id(self):
        name = re.sub(r"View$", "", self.view.__class__.__name__)
        snake = re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()
        return f"{snake}_{self.method.lower()}"


class SessionTokenScheme(OpenApiAuthenticationExtension):
    """Documents apps.accounts.authentication.SessionTokenAuthentication: the same session
    token, sent as a Bearer header or in the site's `vcs_session` cookie."""

    target_class = "apps.accounts.authentication.SessionTokenAuthentication"
    name = ["bearerAuth", "cookieAuth"]

    def get_security_definition(self, auto_schema):
        return [
            {
                "type": "http",
                "scheme": "bearer",
                "description": "The session token (the vcs_session cookie's value).",
            },
            {"type": "apiKey", "in": "cookie", "name": "vcs_session"},
        ]
