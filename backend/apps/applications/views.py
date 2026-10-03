import uuid

from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsReviewer, IsSignedIn
from apps.content.models import CONTACT_TOPICS
from apps.core.exceptions import NotFound

from . import directory, export, payloads, queue, rules, services
from .schemas import (
    ApplicationSchema,
    DecisionBody,
    MemberBody,
    NoteBody,
    ProfileBody,
    QueueSchema,
    ScorecardBody,
    StartupBody,
    SubmitBody,
    TeamBody,
)


def founder_response(user, status_code=status.HTTP_200_OK, **extra) -> Response:
    app = payloads.founder_queryset().get(pk=user.pk)
    return Response({"application": payloads.application(app), **extra}, status=status_code)


def reviewer_response(app_id, status_code=status.HTTP_200_OK) -> Response:
    app = payloads.reviewer_queryset().filter(pk=app_id).first()
    if app is None:
        raise NotFound()
    return Response({"application": payloads.application(app, include_review=True)}, status=status_code)


def _app_id(raw: str) -> uuid.UUID:
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        raise NotFound() from None


# ---------------------------------------------------------------- founder: /me/application


class MyApplicationView(APIView):
    permission_classes = [IsSignedIn]

    @extend_schema(
        responses={200: ApplicationSchema},
        tags=["founder"],
        description="The signed-in founder's application, created as a blank draft on first visit. "
        "Never contains reviewer data.",
    )
    def get(self, request):
        services.ensure_application(request.user)
        return founder_response(request.user)


class ProfileSectionView(APIView):
    permission_classes = [IsSignedIn]

    @extend_schema(request=ProfileBody, responses={200: ApplicationSchema}, tags=["founder"])
    def patch(self, request):
        services.save_profile(request.user, request.data)
        return founder_response(request.user)


class StartupSectionView(APIView):
    permission_classes = [IsSignedIn]

    @extend_schema(request=StartupBody, responses={200: ApplicationSchema}, tags=["founder"])
    def patch(self, request):
        services.save_startup(request.user, request.data)
        return founder_response(request.user)


class TeamSectionView(APIView):
    permission_classes = [IsSignedIn]

    @extend_schema(request=TeamBody, responses={200: ApplicationSchema}, tags=["founder"])
    def patch(self, request):
        services.save_team_details(request.user, request.data)
        return founder_response(request.user)


class MembersView(APIView):
    permission_classes = [IsSignedIn]

    @extend_schema(request=MemberBody, responses={201: ApplicationSchema}, tags=["founder"])
    def post(self, request):
        _, member_id = services.add_member(request.user, request.data)
        return founder_response(request.user, status.HTTP_201_CREATED, memberId=member_id)


class MemberView(APIView):
    permission_classes = [IsSignedIn]

    @extend_schema(request=MemberBody, responses={200: ApplicationSchema}, tags=["founder"])
    def patch(self, request, member_id):
        services.update_member(request.user, str(member_id), request.data)
        return founder_response(request.user)

    @extend_schema(responses={200: ApplicationSchema}, tags=["founder"])
    def delete(self, request, member_id):
        services.remove_member(request.user, str(member_id))
        return founder_response(request.user)


class ImageView(APIView):
    """The startup's logo or the founder's photo: `kind` comes from the route."""

    permission_classes = [IsSignedIn]
    parser_classes = [MultiPartParser]
    kind = "logo"

    @extend_schema(
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {"file": {"type": "string", "format": "binary"}},
            }
        },
        responses={200: ApplicationSchema},
        tags=["founder"],
        description="A PNG, JPEG or WebP of up to 5 MB, stored as a WebP of at most 512 × 512.",
    )
    def put(self, request):
        services.set_image(request.user, self.kind, request.FILES.get("file"))
        return founder_response(request.user)

    @extend_schema(responses={200: ApplicationSchema}, tags=["founder"])
    def delete(self, request):
        services.remove_image(request.user, self.kind)
        return founder_response(request.user)


class SubmitView(APIView):
    permission_classes = [IsSignedIn]

    @extend_schema(
        request=SubmitBody,
        responses={200: ApplicationSchema},
        tags=["founder"],
        description="422 with `missing` lists every required answer still missing.",
    )
    def post(self, request):
        services.submit(request.user, request.data)
        return founder_response(request.user)


class WithdrawView(APIView):
    permission_classes = [IsSignedIn]

    @extend_schema(request=None, responses={200: ApplicationSchema}, tags=["founder"])
    def post(self, request):
        services.withdraw(request.user)
        return founder_response(request.user)


# ---------------------------------------------------------------- reviewers: /admin/applications


class QueueView(APIView):
    permission_classes = [IsReviewer]

    @extend_schema(
        parameters=[
            OpenApiParameter("status", enum=queue.TABS),
            OpenApiParameter("q", str),
            OpenApiParameter("stage", enum=rules.STAGE_IDS),
            OpenApiParameter("industry", enum=rules.INDUSTRIES),
            OpenApiParameter("mine", enum=["1"]),
            OpenApiParameter("sort", enum=queue.SORTS),
            OpenApiParameter("page", int),
            OpenApiParameter("pageSize", int),
        ],
        responses={200: QueueSchema},
        tags=["review"],
    )
    def get(self, request):
        return Response(queue.run(request.user, request.query_params))


class ReviewApplicationView(APIView):
    permission_classes = [IsReviewer]

    @extend_schema(responses={200: ApplicationSchema}, tags=["review"])
    def get(self, request, app_id):
        return reviewer_response(_app_id(app_id))


class DecisionView(APIView):
    permission_classes = [IsReviewer]

    @extend_schema(
        request=DecisionBody,
        responses={200: ApplicationSchema},
        tags=["review"],
        description="409 when the status changed underneath you (another reviewer decided first).",
    )
    def post(self, request, app_id):
        app_id = _app_id(app_id)
        services.decide(app_id, request.user, request.data)
        return reviewer_response(app_id)


class AssigneeView(APIView):
    permission_classes = [IsReviewer]

    @extend_schema(
        request=None,
        responses={200: ApplicationSchema},
        tags=["review"],
        description="Assigns the application to the signed-in reviewer.",
    )
    def put(self, request, app_id):
        app_id = _app_id(app_id)
        services.assign(app_id, request.user)
        return reviewer_response(app_id)

    @extend_schema(responses={200: ApplicationSchema}, tags=["review"])
    def delete(self, request, app_id):
        app_id = _app_id(app_id)
        services.unassign(app_id)
        return reviewer_response(app_id)


class ScorecardView(APIView):
    permission_classes = [IsReviewer]

    @extend_schema(
        request=ScorecardBody,
        responses={200: ApplicationSchema},
        tags=["review"],
        description="Saves the caller's own scorecard, replacing their previous one.",
    )
    def put(self, request, app_id):
        app_id = _app_id(app_id)
        services.save_scorecard(app_id, request.user, request.data)
        return reviewer_response(app_id)


class NotesView(APIView):
    permission_classes = [IsReviewer]

    @extend_schema(request=NoteBody, responses={201: ApplicationSchema}, tags=["review"])
    def post(self, request, app_id):
        app_id = _app_id(app_id)
        services.add_note(app_id, request.user, request.data)
        return reviewer_response(app_id, status.HTTP_201_CREATED)


class ExportView(APIView):
    permission_classes = [IsReviewer]

    @extend_schema(responses={(200, "text/csv"): str}, tags=["review"])
    def get(self, request):
        return export.response()


# ---------------------------------------------------------------- public: /startups


class StartupListView(APIView):
    authentication_classes = []

    @extend_schema(
        tags=["public"],
        operation_id="startups_list",
        responses={200: OpenApiTypes.OBJECT},
        description="Every submitted startup, newest first. Drafts never appear.",
    )
    def get(self, request):
        cards = directory.list_cards()
        return Response({"startups": cards, "count": len(cards)})


class StartupDetailView(APIView):
    authentication_classes = []

    @extend_schema(tags=["public"], responses={200: OpenApiTypes.OBJECT})
    def get(self, request, slug):
        found = directory.find(slug)
        if found is None:
            raise NotFound()
        return Response({"startup": found})


class OptionsView(APIView):
    authentication_classes = []

    @extend_schema(
        tags=["public"],
        responses={200: OpenApiTypes.OBJECT},
        description="Every option list the forms use (the application, and the contact form's topics).",
    )
    def get(self, request):
        return Response(
            {
                "stages": [{"id": i, "label": label, "hint": hint} for i, label, hint in rules.STAGES],
                "industries": rules.INDUSTRIES,
                "businessModels": rules.BUSINESS_MODELS,
                "commitments": [{"id": k, "label": v} for k, v in rules.COMMITMENTS.items()],
                "workedTogether": rules.WORKED_TOGETHER,
                "heardFrom": rules.HEARD_FROM,
                "contactTopics": CONTACT_TOPICS,
                "statuses": [{"id": k, "label": v} for k, v in rules.STATUS_LABELS.items()],
                "scoreAreas": rules.SCORE_AREAS,
                "recommendations": rules.RECOMMENDATIONS,
                "decisions": [
                    {
                        "id": k,
                        "label": d.label,
                        "from": list(d.allowed_from),
                        "to": d.to,
                        "messageRequired": d.message_required,
                    }
                    for k, d in rules.DECISIONS.items()
                ],
            }
        )
