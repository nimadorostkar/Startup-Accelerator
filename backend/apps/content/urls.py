from django.urls import path

from . import views

urlpatterns = [
    path("events", views.EventListView.as_view()),
    path("events/<slug:slug>", views.EventDetailView.as_view()),
    path("events/<slug:slug>/registrations", views.EventRegistrationView.as_view()),
    path("newsletter/posts", views.PostListView.as_view()),
    path("newsletter/posts/<slug:slug>", views.PostDetailView.as_view()),
    path("newsletter/subscribers", views.SubscribeView.as_view()),
    path("newsletter/unsubscribe", views.UnsubscribeView.as_view()),
    path("contact", views.ContactView.as_view()),
]
