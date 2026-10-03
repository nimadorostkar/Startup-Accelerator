from django.utils import timezone
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.net import client_ip, user_agent
from apps.core.throttles import ip_throttle

from . import google, services
from .cookies import clear_session_cookie, set_session_cookie
from .models import AuthSession
from .permissions import IsSignedIn
from .schemas import (
    AccountProfileBody,
    ChangePasswordBody,
    GoogleBody,
    LoginBody,
    PasswordResetBody,
    PasswordResetConfirmBody,
    RegisterBody,
    TokenBody,
    UserSchema,
)


def signed_in(request, user, *, remember: bool, status_code=status.HTTP_200_OK) -> Response:
    """Starts a session and returns the user with the session cookie set."""
    session, token = AuthSession.start(
        user, remember=remember, ip=client_ip(request), user_agent=user_agent(request)
    )
    response = Response({"user": services.user_payload(user)}, status=status_code)
    set_session_cookie(response, token, session)
    return response


class RegisterView(APIView):
    authentication_classes = []
    throttle_classes = [ip_throttle("register")]

    @extend_schema(request=RegisterBody, responses={201: UserSchema}, tags=["auth"])
    def post(self, request):
        user = services.register(request.data)
        return signed_in(request, user, remember=False, status_code=status.HTTP_201_CREATED)


class LoginView(APIView):
    authentication_classes = []
    throttle_classes = [ip_throttle("login")]  # failed attempts per account: services.authenticate

    @extend_schema(request=LoginBody, responses={200: UserSchema}, tags=["auth"])
    def post(self, request):
        user, remember = services.authenticate(request.data, ip=client_ip(request))
        return signed_in(request, user, remember=remember)


class LogoutView(APIView):
    @extend_schema(request=None, responses={204: None}, tags=["auth"])
    def post(self, request):
        if isinstance(request.auth, AuthSession) and request.auth.revoked_at is None:
            AuthSession.objects.filter(pk=request.auth.pk).update(revoked_at=timezone.now())
        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_session_cookie(response)
        return response


class PasswordResetView(APIView):
    authentication_classes = []
    throttle_classes = [ip_throttle("password_reset")]  # emails per inbox: services.email_password_reset

    @extend_schema(request=PasswordResetBody, responses={202: None}, tags=["auth"])
    def post(self, request):
        services.request_password_reset(request.data)
        return Response(status=status.HTTP_202_ACCEPTED)


class PasswordResetConfirmView(APIView):
    authentication_classes = []
    throttle_classes = [ip_throttle("password_reset_confirm")]

    @extend_schema(request=PasswordResetConfirmBody, responses={200: UserSchema}, tags=["auth"])
    def post(self, request):
        user = services.reset_password(request.data)
        return signed_in(request, user, remember=False)


class VerifyEmailView(APIView):
    authentication_classes = []
    throttle_classes = [ip_throttle("verify_email")]

    @extend_schema(request=TokenBody, responses={200: UserSchema}, tags=["auth"])
    def post(self, request):
        user = services.verify_email(request.data)
        return Response({"user": services.user_payload(user)})


class ResendVerificationView(APIView):
    permission_classes = [IsSignedIn]
    throttle_classes = [ip_throttle("verify_email")]

    @extend_schema(request=None, responses={202: None, 200: None}, tags=["auth"])
    def post(self, request):
        if request.user.email_verified:
            return Response({"message": "Your email is already confirmed."})
        services.send_verification(request.user)
        return Response({"message": f"We sent a new link to {request.user.email}."}, status=202)


class GoogleSignInView(APIView):
    authentication_classes = []
    throttle_classes = [ip_throttle("google")]

    @extend_schema(
        request=GoogleBody,
        responses={200: UserSchema, 400: OpenApiResponse(description="Code refused by Google")},
        tags=["auth"],
    )
    def post(self, request):
        user = google.sign_in(request.data)
        return signed_in(request, user, remember=True)


class MeView(APIView):
    permission_classes = [IsSignedIn]

    @extend_schema(responses={200: UserSchema}, tags=["account"])
    def get(self, request):
        return Response({"user": services.user_payload(request.user)})

    @extend_schema(request=AccountProfileBody, responses={200: UserSchema}, tags=["account"])
    def patch(self, request):
        user = services.update_profile(request.user, request.data)
        return Response({"user": services.user_payload(user)})


class ChangePasswordView(APIView):
    permission_classes = [IsSignedIn]
    throttle_classes = [ip_throttle("login")]

    @extend_schema(request=ChangePasswordBody, responses={204: None}, tags=["account"])
    def post(self, request):
        services.change_password(request.user, request.auth, request.data)
        return Response(status=status.HTTP_204_NO_CONTENT)
