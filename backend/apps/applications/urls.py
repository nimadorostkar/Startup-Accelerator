from django.urls import path

from . import views

urlpatterns = [
    # The signed-in founder's own application. Never takes a user id: identity comes from the session.
    path("me/application", views.MyApplicationView.as_view()),
    path("me/application/profile", views.ProfileSectionView.as_view()),
    path("me/application/startup", views.StartupSectionView.as_view()),
    path("me/application/team", views.TeamSectionView.as_view()),
    path("me/application/team/members", views.MembersView.as_view()),
    path("me/application/team/members/<uuid:member_id>", views.MemberView.as_view()),
    path("me/application/logo", views.ImageView.as_view(kind="logo")),
    path("me/application/photo", views.ImageView.as_view(kind="photo")),
    path("me/application/submit", views.SubmitView.as_view()),
    path("me/application/withdraw", views.WithdrawView.as_view()),
    # Reviewers only; everyone else gets 404.
    path("admin/applications", views.QueueView.as_view()),
    path("admin/applications/<str:app_id>", views.ReviewApplicationView.as_view()),
    path("admin/applications/<str:app_id>/decisions", views.DecisionView.as_view()),
    path("admin/applications/<str:app_id>/assignee", views.AssigneeView.as_view()),
    path("admin/applications/<str:app_id>/scorecard", views.ScorecardView.as_view()),
    path("admin/applications/<str:app_id>/notes", views.NotesView.as_view()),
    path("admin/export.csv", views.ExportView.as_view()),
    # Public
    path("startups", views.StartupListView.as_view()),
    path("startups/<str:slug>", views.StartupDetailView.as_view()),
    path("options", views.OptionsView.as_view()),
]
