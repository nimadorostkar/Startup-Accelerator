from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.exceptions import NotFound
from apps.core.net import client_ip, user_agent
from apps.core.throttles import ip_throttle

from . import services
from .models import CONTACT_TOPICS


class ContactBody(serializers.Serializer):
    name = serializers.CharField(max_length=80)
    email = serializers.EmailField()
    company = serializers.CharField(required=False, max_length=120)
    topic = serializers.ChoiceField(choices=CONTACT_TOPICS)
    message = serializers.CharField(min_length=10, max_length=2000)
    website = serializers.CharField(required=False, help_text="Leave empty (bot trap)")


class RegistrationBody(serializers.Serializer):
    name = serializers.CharField(max_length=80)
    email = serializers.EmailField()
    company = serializers.CharField(required=False, max_length=120)
    website = serializers.CharField(required=False, help_text="Leave empty (bot trap)")


class SubscribeBody(serializers.Serializer):
    email = serializers.EmailField()
    source = serializers.CharField(required=False, max_length=80)
    website = serializers.CharField(required=False, help_text="Leave empty (bot trap)")


class TokenBody(serializers.Serializer):
    token = serializers.CharField()


class EventListView(APIView):
    authentication_classes = []

    @extend_schema(
        responses={200: OpenApiTypes.OBJECT, 201: OpenApiTypes.OBJECT},
        parameters=[OpenApiParameter("when", enum=["upcoming", "past", "all"])],
        tags=["events"],
        description="Upcoming events soonest first, then past events most recent first.",
    )
    def get(self, request):
        when = request.query_params.get("when", "all")
        return Response({"events": services.list_events(when)})


class EventDetailView(APIView):
    authentication_classes = []

    @extend_schema(responses={200: OpenApiTypes.OBJECT, 201: OpenApiTypes.OBJECT}, tags=["events"])
    def get(self, request, slug):
        found = services.find_event(slug)
        if found is None:
            raise NotFound()
        return Response({"event": found})


class EventRegistrationView(APIView):
    authentication_classes = []
    throttle_classes = [ip_throttle("event_register")]

    @extend_schema(
        responses={200: OpenApiTypes.OBJECT, 201: OpenApiTypes.OBJECT},
        request=RegistrationBody,
        tags=["events"],
        description="201 for a new registration, 200 with existing=true if that email already "
        "registered. 409 once the event has ended or is full.",
    )
    def post(self, request, slug):
        created, payload = services.register_for_event(slug, request.data, ip=client_ip(request))
        return Response(payload, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class PostListView(APIView):
    authentication_classes = []

    @extend_schema(
        responses={200: OpenApiTypes.OBJECT, 201: OpenApiTypes.OBJECT},
        tags=["newsletter"],
        description="Published issues, newest first (without their text).",
    )
    def get(self, request):
        return Response({"posts": services.list_posts()})


class PostDetailView(APIView):
    authentication_classes = []

    @extend_schema(responses={200: OpenApiTypes.OBJECT, 201: OpenApiTypes.OBJECT}, tags=["newsletter"])
    def get(self, request, slug):
        found = services.find_post(slug)
        if found is None:
            raise NotFound()
        return Response({"post": found})


class SubscribeView(APIView):
    authentication_classes = []
    throttle_classes = [ip_throttle("subscribe")]

    @extend_schema(
        responses={200: OpenApiTypes.OBJECT, 201: OpenApiTypes.OBJECT},
        request=SubscribeBody,
        tags=["newsletter"],
        description='201 {"status": "new"}, or 200 {"status": "existing"} if already on the list.',
    )
    def post(self, request):
        result = services.subscribe(request.data, ip=client_ip(request))
        return Response(
            {"status": result}, status=status.HTTP_201_CREATED if result == "new" else status.HTTP_200_OK
        )


class UnsubscribeView(APIView):
    authentication_classes = []
    throttle_classes = [ip_throttle("subscribe")]

    @extend_schema(
        responses={200: OpenApiTypes.OBJECT, 201: OpenApiTypes.OBJECT}, request=TokenBody, tags=["newsletter"]
    )
    def post(self, request):
        return Response({"email": services.unsubscribe(request.data)})


class ContactView(APIView):
    authentication_classes = []
    throttle_classes = [ip_throttle("contact")]

    @extend_schema(
        responses={200: OpenApiTypes.OBJECT, 201: OpenApiTypes.OBJECT}, request=ContactBody, tags=["contact"]
    )
    def post(self, request):
        sent = services.send_contact_message(
            request.data, ip=client_ip(request), user_agent=user_agent(request)
        )
        return Response({"sent": sent}, status=status.HTTP_201_CREATED)
