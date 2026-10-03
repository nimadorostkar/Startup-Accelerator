from django.apps import AppConfig


class ApplicationsConfig(AppConfig):
    name = "apps.applications"
    label = "applications"
    verbose_name = "Applications"

    def ready(self):
        from . import signals  # noqa: F401
