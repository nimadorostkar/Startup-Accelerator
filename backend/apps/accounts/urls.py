from django.urls import path

from . import views

urlpatterns = [
    path("auth/register", views.RegisterView.as_view()),
    path("auth/login", views.LoginView.as_view()),
    path("auth/logout", views.LogoutView.as_view()),
    path("auth/password-reset", views.PasswordResetView.as_view()),
    path("auth/password-reset/confirm", views.PasswordResetConfirmView.as_view()),
    path("auth/verify-email", views.VerifyEmailView.as_view()),
    path("auth/verify-email/resend", views.ResendVerificationView.as_view()),
    path("auth/google", views.GoogleSignInView.as_view()),
    path("me", views.MeView.as_view()),
    path("me/password", views.ChangePasswordView.as_view()),
]
