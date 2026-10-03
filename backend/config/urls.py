from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from apps.core import views as core

admin.site.site_header = "Fundup Club back office"
admin.site.site_title = "Fundup Club back office"
admin.site.index_title = "Content, accounts and applications"

api = [
    path("health", core.health),
    path("health/ready", core.ready),
    path("", include("apps.accounts.urls")),
    path("", include("apps.applications.urls")),
    path("", include("apps.content.urls")),
]
if settings.API_DOCS_PUBLIC:
    api += [
        path("schema/", SpectacularAPIView.as_view(), name="schema"),
        path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
    ]
api.append(re_path(r"^.*$", core.not_found))  # last: anything else under /api/v1/

urlpatterns = [
    path("api/v1/", include(api)),
    path(settings.ADMIN_URL, admin.site.urls),
]

handler500 = "apps.core.views.server_error"
