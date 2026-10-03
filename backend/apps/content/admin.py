import csv
import zoneinfo

from django.conf import settings
from django.contrib import admin, messages
from django.db import models
from django.http import HttpResponse
from django.utils import timezone
from django.utils.html import format_html

from .models import AgendaItem, ContactMessage, Event, EventRegistration, Post, Subscriber


def export_csv(filename: str, header: list[str], rows) -> HttpResponse:
    response = HttpResponse(content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    response.write("\ufeff")  # BOM, so Excel reads UTF-8
    writer = csv.writer(response)
    writer.writerow(header)
    for row in rows:
        # Defuse spreadsheet formulas in visitor-entered text.
        writer.writerow([f"'{v}" if isinstance(v, str) and v and v[0] in "=+-@\t\r" else v for v in row])
    return response


class AgendaInline(admin.TabularInline):
    model = AgendaItem
    extra = 1
    fields = ("order", "time", "item")


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "type",
        "format",
        "city",
        "local_start",
        "registered",
        "capacity",
        "is_published",
        "page",
    )
    list_filter = ("type", "format", "is_published")
    search_fields = ("title", "city", "slug")
    prepopulated_fields = {"slug": ("title",)}
    date_hierarchy = "start"
    inlines = [AgendaInline]
    # A joining link typed without a scheme gets https:// (Django 6's default).
    formfield_overrides = {models.URLField: {"assume_scheme": "https"}}
    fieldsets = (
        (None, {"fields": ("title", "slug", "type", "format", "is_published")}),
        (
            "When and where",
            {
                "fields": ("tz", "start", "end", "city", "capacity"),
                "description": "Start and end are in the event's own time zone (the first field).",
            },
        ),
        ("Private joining details", {"fields": ("venue", "online_url")}),
        ("Page", {"fields": ("summary", "about", "takeaways", "audience")}),
    )

    def get_queryset(self, request):
        from django.db.models import Count

        return super().get_queryset(request).annotate(n_registrations=Count("registrations"))

    def changeform_view(self, request, object_id=None, form_url="", extra_context=None):
        """Show and read start and end in the event's own time zone rather than UTC."""
        name = request.POST.get("tz") if request.method == "POST" else None
        if not name and object_id:
            name = Event.objects.filter(pk=object_id).values_list("tz", flat=True).first()
        try:
            zone = zoneinfo.ZoneInfo(name) if name else None
        except (zoneinfo.ZoneInfoNotFoundError, ValueError):
            zone = None  # the form reports the bad zone itself
        if zone is None:
            return super().changeform_view(request, object_id, form_url, extra_context)
        with timezone.override(zone):
            response = super().changeform_view(request, object_id, form_url, extra_context)
            # Render now: a TemplateResponse would otherwise render after the override ends.
            if hasattr(response, "render") and not getattr(response, "is_rendered", True):
                response.render()
            return response

    @admin.display(description="Starts (local time)", ordering="start")
    def local_start(self, obj):
        start = timezone.localtime(obj.start, zoneinfo.ZoneInfo(obj.tz))
        return f"{start:%Y-%m-%d %H:%M} {start:%Z}"

    @admin.display(description="Registered", ordering="n_registrations")
    def registered(self, obj):
        return obj.n_registrations

    @admin.display(description="Page")
    def page(self, obj):
        return format_html(
            '<a href="{}/events/{}" target="_blank" rel="noopener">View</a>', settings.SITE_URL, obj.slug
        )


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "company", "event", "created_at", "reminded_at")
    list_filter = ("event",)
    search_fields = ("name", "email", "company")
    list_select_related = ("event",)
    readonly_fields = ("created_at", "reminded_at", "ip")
    actions = ["export"]

    @admin.action(description="Export selected as CSV")
    def export(self, request, queryset):
        return export_csv(
            "event-registrations.csv",
            ["Event", "Name", "Email", "Company", "Registered"],
            ((r.event.title, r.name, r.email, r.company, r.created_at.isoformat()) for r in queryset),
        )


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("issue", "title", "category", "published_on", "is_published", "page")
    list_filter = ("category", "is_published")
    search_fields = ("title", "excerpt", "slug")
    prepopulated_fields = {"slug": ("title",)}
    date_hierarchy = "published_on"
    fieldsets = (
        (None, {"fields": ("title", "slug", "issue", "category", "author", "published_on", "is_published")}),
        ("Text", {"fields": ("excerpt", "body", "minutes")}),
    )

    @admin.display(description="Page")
    def page(self, obj):
        return format_html(
            '<a href="{}/newsletter/{}" target="_blank" rel="noopener">View</a>', settings.SITE_URL, obj.slug
        )


@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ("email", "source", "created_at", "unsubscribed_at")
    list_filter = ("source", ("unsubscribed_at", admin.EmptyFieldListFilter))
    search_fields = ("email",)
    readonly_fields = ("created_at", "ip")
    actions = ["export", "unsubscribe"]

    @admin.action(description="Export selected as CSV")
    def export(self, request, queryset):
        return export_csv(
            "newsletter-subscribers.csv",
            ["Email", "Source", "Subscribed", "Unsubscribed"],
            (
                (
                    s.email,
                    s.source,
                    s.created_at.isoformat(),
                    s.unsubscribed_at.isoformat() if s.unsubscribed_at else "",
                )
                for s in queryset
            ),
        )

    @admin.action(description="Unsubscribe selected")
    def unsubscribe(self, request, queryset):
        count = queryset.filter(unsubscribed_at__isnull=True).update(unsubscribed_at=timezone.now())
        self.message_user(request, f"Unsubscribed {count} address(es).", messages.SUCCESS)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("created_at", "name", "email", "topic", "short_message", "handled")
    list_filter = ("topic", ("handled_at", admin.EmptyFieldListFilter))
    search_fields = ("name", "email", "company", "message")
    readonly_fields = ("name", "email", "company", "topic", "message", "created_at", "ip", "user_agent")
    fields = ("name", "email", "company", "topic", "message", "created_at", "handled_at", "ip", "user_agent")
    actions = ["mark_handled"]

    def has_add_permission(self, request):
        return False

    @admin.display(description="Message")
    def short_message(self, obj):
        return obj.message[:80] + ("…" if len(obj.message) > 80 else "")

    @admin.display(boolean=True, description="Handled", ordering="handled_at")
    def handled(self, obj):
        return obj.handled_at is not None

    @admin.action(description="Mark as handled")
    def mark_handled(self, request, queryset):
        count = queryset.filter(handled_at__isnull=True).update(handled_at=timezone.now())
        self.message_user(request, f"Marked {count} message(s) handled.", messages.SUCCESS)
