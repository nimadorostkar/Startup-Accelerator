import hashlib
import secrets
import uuid

from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


def hash_token(token: str) -> str:
    """Only this hash is stored; the raw token lives in the cookie or the emailed link."""
    return hashlib.sha256(token.encode()).hexdigest()


def new_token() -> str:
    return secrets.token_urlsafe(32)  # 256 bits


class UserManager(BaseUserManager):
    use_in_migrations = True

    def normalize_email(self, email):
        return (email or "").strip().lower()

    def create_user(self, email, name, password=None, **extra):
        user = self.model(email=self.normalize_email(email), name=name.strip(), **extra)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra):
        extra.update(is_staff=True, is_superuser=True, role=User.Role.REVIEWER)
        extra.setdefault("email_verified_at", timezone.now())
        return self.create_user(email, name, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        FOUNDER = "founder", "Founder"
        REVIEWER = "reviewer", "Reviewer"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Always stored lower-cased (see save()), so this is a case-insensitive unique check.
    email = models.EmailField(max_length=254, unique=True)
    name = models.CharField(max_length=80)
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.FOUNDER)
    google_sub = models.CharField("Google account id", max_length=255, unique=True, null=True, blank=True)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    terms_accepted_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField("back-office access", default=False)
    created_at = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} <{self.email}>"

    def save(self, *args, **kwargs):
        self.email = (self.email or "").strip().lower()
        update_fields = kwargs.get("update_fields")
        changed = False
        if not self._state.adding and (update_fields is None or "email" in update_fields):
            previous = User.objects.filter(pk=self.pk).values_list("email", flat=True).first()
            changed = previous is not None and previous != self.email
        if changed:
            # A new address is unconfirmed until its owner follows the link (so review access
            # pauses too), and links already emailed to the old address stop working.
            self.email_verified_at = None
            if update_fields is not None:
                kwargs["update_fields"] = {*update_fields, "email_verified_at"}
        super().save(*args, **kwargs)
        if changed:
            UserToken.objects.filter(user=self, used_at__isnull=True).update(used_at=timezone.now())
            from .services import send_verification

            send_verification(self, reason="changed")  # sent once the change commits

    @property
    def email_verified(self) -> bool:
        return self.email_verified_at is not None

    @property
    def is_reviewer(self) -> bool:
        """Reviewer role, and only on a verified address: the role is as safe as the inbox behind it."""
        return self.is_active and self.role == self.Role.REVIEWER and self.email_verified


class AuthSession(models.Model):
    """A signed-in browser or device. The cookie holds the raw token; we keep its hash."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessions")
    token_hash = models.CharField(max_length=64, unique=True)
    remember = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    last_used_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "revoked_at"]), models.Index(fields=["expires_at"])]

    def __str__(self):
        return f"Session for {self.user_id} (expires {self.expires_at:%Y-%m-%d %H:%M})"

    @property
    def is_valid(self) -> bool:
        return self.revoked_at is None and self.expires_at > timezone.now() and self.user.is_active

    @classmethod
    def start(
        cls, user: User, *, remember: bool, ip: str | None, user_agent: str
    ) -> tuple["AuthSession", str]:
        token = new_token()
        ttl = settings.AUTH_SESSION_REMEMBER_TTL if remember else settings.AUTH_SESSION_TTL
        session = cls.objects.create(
            user=user,
            token_hash=hash_token(token),
            remember=remember,
            expires_at=timezone.now() + ttl,
            ip=ip or None,
            user_agent=user_agent,
        )
        return session, token

    @classmethod
    def revoke_all(cls, user: User, *, keep: "AuthSession | None" = None) -> int:
        sessions = cls.objects.filter(user=user, revoked_at__isnull=True)
        if keep is not None:
            sessions = sessions.exclude(pk=keep.pk)
        return sessions.update(revoked_at=timezone.now())


class UserToken(models.Model):
    """Single-use, expiring tokens sent by email (password reset, email verification)."""

    class Purpose(models.TextChoices):
        PASSWORD_RESET = "password_reset", "Password reset"
        VERIFY_EMAIL = "verify_email", "Email verification"

    token_hash = models.CharField(max_length=64, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tokens")
    purpose = models.CharField(max_length=32, choices=Purpose.choices)
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["user", "purpose"]), models.Index(fields=["expires_at"])]

    def __str__(self):
        return f"{self.get_purpose_display()} for {self.user_id}"

    @classmethod
    def issue(cls, user: User, purpose: str) -> str:
        """A fresh token; earlier unused tokens for the same purpose stop working."""
        ttl = (
            settings.PASSWORD_RESET_TTL
            if purpose == cls.Purpose.PASSWORD_RESET
            else settings.EMAIL_VERIFICATION_TTL
        )
        now = timezone.now()
        cls.objects.filter(user=user, purpose=purpose, used_at__isnull=True).update(used_at=now)
        token = new_token()
        cls.objects.create(token_hash=hash_token(token), user=user, purpose=purpose, expires_at=now + ttl)
        return token

    @classmethod
    def redeem(cls, token: str, purpose: str) -> User | None:
        """Marks the token used and returns its user, or None if it's unknown, used or expired.

        Call inside a transaction: the row is locked so a token can't be redeemed twice.
        """
        if not isinstance(token, str) or not token or len(token) > 200:
            return None
        row = (
            cls.objects.select_for_update()
            .select_related("user")
            .filter(token_hash=hash_token(token), purpose=purpose)
            .first()
        )
        now = timezone.now()
        if row is None or row.used_at is not None or row.expires_at <= now or not row.user.is_active:
            return None
        row.used_at = now
        row.save(update_fields=["used_at"])
        return row.user
