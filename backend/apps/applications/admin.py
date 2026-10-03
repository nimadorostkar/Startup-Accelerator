import json

from django import forms
from django.conf import settings
from django.contrib import admin
from django.core.files.uploadedfile import UploadedFile
from django.utils.html import format_html

from apps.core.exceptions import Invalid

from . import images
from .models import Application, ApplicationEvent, InternalNote, Scorecard


def pretty(data) -> str:
    return format_html(
        '<pre style="white-space:pre-wrap;max-width:900px;margin:0">{}</pre>',
        json.dumps(data, indent=2, ensure_ascii=False),
    )


class EventInline(admin.TabularInline):
    model = ApplicationEvent
    extra = 0
    fields = ("at", "by", "kind", "title", "body", "actor")
    readonly_fields = fields
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


class ScorecardInline(admin.TabularInline):
    model = Scorecard
    extra = 0
    fields = (
        "reviewer",
        "problem",
        "solution",
        "market",
        "team",
        "traction",
        "recommendation",
        "summary",
        "updated_at",
    )
    readonly_fields = fields
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


class NoteInline(admin.TabularInline):
    model = InternalNote
    extra = 0
    fields = ("at", "author", "body")
    readonly_fields = fields
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


class ApplicationForm(forms.ModelForm):
    """Images uploaded here go through the same checks and resizing as a founder's upload."""

    class Meta:
        model = Application
        fields = ("slug", "logo", "photo")

    def _image(self, kind: str):
        upload = self.cleaned_data.get(kind)
        if not isinstance(upload, UploadedFile):
            return upload  # unchanged, or cleared
        try:
            return images.process(upload, kind)
        except Invalid as refused:
            raise forms.ValidationError(refused.errors["file"]) from None

    def clean_slug(self):
        # Emptied: no address (NULL, as before submission), not "" — which only one row could have.
        return self.cleaned_data.get("slug") or None

    def clean_logo(self):
        return self._image("logo")

    def clean_photo(self):
        return self._image("photo")


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    """Read-mostly: reviewing happens on the website's review panel, where every rule is enforced.
    Use this for look-ups, fixing a public address, a logo or a founder photo, or deleting an
    application on request."""

    list_display = (
        "__str__",
        "founder_name",
        "email",
        "status",
        "stage",
        "industry",
        "submitted_at",
        "updated_at",
        "team_score",
    )
    list_filter = ("status", "stage", "industry")
    search_fields = ("startup_name", "founder_name", "user__email", "tagline", "slug")
    date_hierarchy = "created_at"
    list_select_related = ("user", "assignee")
    inlines = [EventInline, ScorecardInline, NoteInline]
    form = ApplicationForm
    fields = (
        "user",
        "status",
        "slug",
        "logo",
        "photo",
        "assignee",
        "review_link",
        "created_at",
        "updated_at",
        "submitted_at",
        "first_submitted_at",
        "team_score",
        "profile_json",
        "startup_json",
        "team_json",
        "public_json",
    )
    readonly_fields = (
        "user",
        "status",
        "assignee",
        "review_link",
        "created_at",
        "updated_at",
        "submitted_at",
        "first_submitted_at",
        "team_score",
        "profile_json",
        "startup_json",
        "team_json",
        "public_json",
    )

    def has_add_permission(self, request):
        return False

    def save_model(self, request, obj, form, change):
        if "slug" in form.changed_data:
            # A fixed address is kept until the startup is renamed (services._assign_slug).
            obj.slug_source = obj.startup_name
        super().save_model(request, obj, form, change)

    @admin.display(description="Email", ordering="user__email")
    def email(self, obj):
        return obj.user.email

    @admin.display(description="Review panel")
    def review_link(self, obj):
        url = f"{settings.SITE_URL}/admin/applications/{obj.user_id}"
        return format_html('<a href="{}" target="_blank" rel="noopener">{}</a>', url, url)

    @admin.display(description="Profile")
    def profile_json(self, obj):
        return pretty(obj.profile_data)

    @admin.display(description="Startup")
    def startup_json(self, obj):
        return pretty(obj.startup_data)

    @admin.display(description="Team")
    def team_json(self, obj):
        return pretty(obj.team_data)

    @admin.display(description="Public version (as last submitted)")
    def public_json(self, obj):
        return pretty(obj.public_snapshot) if obj.public_snapshot else "—"
