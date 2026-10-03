"""Request and response shapes, for the OpenAPI docs only. Validation itself
lives in services.py so its messages match the website's forms word for word."""

from rest_framework import serializers


class RegisterBody(serializers.Serializer):
    name = serializers.CharField(max_length=80)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=200)
    terms = serializers.BooleanField()


class LoginBody(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    remember = serializers.BooleanField(required=False)


class PasswordResetBody(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmBody(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(min_length=8, max_length=200)


class TokenBody(serializers.Serializer):
    token = serializers.CharField()


class GoogleBody(serializers.Serializer):
    code = serializers.CharField(help_text="The `code` Google sent to /api/auth/callback/google")


class ProfileBody(serializers.Serializer):
    name = serializers.CharField(max_length=80, required=False)


class ChangePasswordBody(serializers.Serializer):
    currentPassword = serializers.CharField(required=False)  # noqa: N815
    newPassword = serializers.CharField(min_length=8, max_length=200)  # noqa: N815


class _User(serializers.Serializer):
    id = serializers.UUIDField()
    email = serializers.EmailField()
    name = serializers.CharField()
    role = serializers.ChoiceField(choices=["founder", "reviewer"])
    isReviewer = serializers.BooleanField()  # noqa: N815
    emailVerified = serializers.BooleanField()  # noqa: N815
    hasPassword = serializers.BooleanField()  # noqa: N815
    createdAt = serializers.DateTimeField()  # noqa: N815


class UserSchema(serializers.Serializer):
    user = _User()
