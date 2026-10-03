from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth.forms import AdminUserCreationForm, UserChangeForm
from django.utils import timezone

from .models import AuthSession, User, UserToken


class UserCreateForm(AdminUserCreationForm):
    class Meta:
        model = User
        fields = ("email", "name", "role")


class UserEditForm(UserChangeForm):
    class Meta:
        model = User
        fields = "__all__"


class SessionInline(admin.TabularInline):
    model = AuthSession
    extra = 0
    can_delete = False
    fields = ("created_at", "last_used_at", "expires_at", "revoked_at", "remember", "ip", "user_agent")
    readonly_fields = fields
    ordering = ("-created_at",)
    show_change_link = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    form = UserEditForm
    add_form = UserCreateForm
    inlines = [SessionInline]
    list_display = ("email", "name", "role", "verified", "is_active", "is_staff", "created_at")
    list_filter = (
        "role",
        "is_active",
        "is_staff",
        "is_superuser",
        ("email_verified_at", admin.EmptyFieldListFilter),
    )
    search_fields = ("email", "name")
    ordering = ("-created_at",)
    # Only the address's owner confirms it (the emailed link), never the back office.
    readonly_fields = ("created_at", "last_login", "google_sub", "terms_accepted_at", "email_verified_at")
    fieldsets = (
        (None, {"fields": ("email", "name", "password")}),
        (
            "Role",
            {
                "fields": ("role", "email_verified_at"),
                "description": (
                    "Reviewers see the review panel at /admin on the website. The role only takes effect "
                    "once the email address is verified."
                ),
            },
        ),
        ("Sign-in", {"fields": ("google_sub", "last_login", "created_at", "terms_accepted_at")}),
        ("Back office", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "name", "role", "password1", "password2")}),
    )
    actions = ["make_reviewer", "make_founder", "sign_out_everywhere"]

    @admin.display(boolean=True, description="Verified", ordering="email_verified_at")
    def verified(self, obj):
        return obj.email_verified

    @admin.action(description="Make reviewer")
    def make_reviewer(self, request, queryset):
        """Review access also needs a confirmed address, which only the inbox's owner can give:
        anyone unconfirmed gets a fresh link. (Confirming on their behalf would hand the panel
        to whoever registered the address first.)"""
        from .services import send_verification

        waiting = 0
        for user in queryset:
            user.role = User.Role.REVIEWER
            user.save(update_fields=["role"])
            if not user.email_verified:
                send_verification(user)
                waiting += 1
        self.message_user(
            request,
            f"{queryset.count()} user(s) are now reviewers."
            + (f" {waiting} must confirm their email first; a link is on its way." if waiting else ""),
            messages.SUCCESS,
        )

    @admin.action(description="Make founder (remove review access)")
    def make_founder(self, request, queryset):
        count = queryset.update(role=User.Role.FOUNDER)
        self.message_user(request, f"{count} user(s) changed to founder.", messages.SUCCESS)

    @admin.action(description="Sign out of every device")
    def sign_out_everywhere(self, request, queryset):
        total = sum(AuthSession.revoke_all(user) for user in queryset)
        self.message_user(request, f"Ended {total} session(s).", messages.SUCCESS)


@admin.register(AuthSession)
class AuthSessionAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at", "last_used_at", "expires_at", "revoked_at", "ip")
    list_filter = (("revoked_at", admin.EmptyFieldListFilter), "remember")
    search_fields = ("user__email", "ip")
    readonly_fields = [f.name for f in AuthSession._meta.fields]
    actions = ["revoke"]

    def has_add_permission(self, request):
        return False

    @admin.action(description="Revoke selected sessions")
    def revoke(self, request, queryset):
        count = queryset.filter(revoked_at__isnull=True).update(revoked_at=timezone.now())
        self.message_user(request, f"Revoked {count} session(s).", messages.SUCCESS)


@admin.register(UserToken)
class UserTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "purpose", "created_at", "expires_at", "used_at")
    list_filter = ("purpose",)
    search_fields = ("user__email",)
    readonly_fields = ("user", "purpose", "created_at", "expires_at", "used_at")
    exclude = ("token_hash",)

    def has_add_permission(self, request):
        return False
