"""Request and response shapes, for the OpenAPI docs only (validation lives in rules.py)."""

from rest_framework import serializers

from . import rules


class ProfileBody(serializers.Serializer):
    fullName = serializers.CharField(required=False, max_length=80)  # noqa: N815
    title = serializers.CharField(required=False, max_length=80)
    phone = serializers.CharField(required=False)
    linkedin = serializers.CharField(required=False)
    experienceYears = serializers.IntegerField(required=False, min_value=0, max_value=60)  # noqa: N815
    country = serializers.CharField(required=False, max_length=60)
    city = serializers.CharField(required=False, max_length=60)
    commitment = serializers.ChoiceField(required=False, choices=list(rules.COMMITMENTS))
    heardFrom = serializers.ChoiceField(required=False, choices=rules.HEARD_FROM)  # noqa: N815
    bio = serializers.CharField(required=False, max_length=1200)


class StartupBody(serializers.Serializer):
    name = serializers.CharField(required=False, max_length=60)
    tagline = serializers.CharField(required=False, max_length=120)
    website = serializers.CharField(required=False)
    industry = serializers.ChoiceField(required=False, choices=rules.INDUSTRIES)
    businessModel = serializers.ChoiceField(required=False, choices=rules.BUSINESS_MODELS)  # noqa: N815
    country = serializers.CharField(required=False, max_length=60)
    foundedOn = serializers.CharField(required=False, help_text="YYYY-MM, not in the future")  # noqa: N815
    incorporated = serializers.ChoiceField(required=False, choices=["yes", "no"])
    stage = serializers.ChoiceField(required=False, choices=rules.STAGE_IDS)
    problem = serializers.CharField(required=False, max_length=1500)
    solution = serializers.CharField(required=False, max_length=1500)
    targetCustomer = serializers.CharField(required=False, max_length=600)  # noqa: N815
    marketSize = serializers.CharField(required=False, max_length=600)  # noqa: N815
    competitors = serializers.CharField(required=False, max_length=1000)
    advantage = serializers.CharField(required=False, max_length=1000)
    activeUsers = serializers.FloatField(required=False, min_value=0)  # noqa: N815
    payingCustomers = serializers.FloatField(required=False, min_value=0)  # noqa: N815
    monthlyRevenue = serializers.FloatField(required=False, min_value=0)  # noqa: N815
    growthRate = serializers.FloatField(required=False, min_value=0, max_value=1000)  # noqa: N815
    keyMetric = serializers.CharField(required=False, max_length=200)  # noqa: N815
    raisedToDate = serializers.FloatField(required=False, min_value=0)  # noqa: N815
    seeking = serializers.FloatField(required=False, min_value=0)
    useOfFunds = serializers.CharField(required=False, max_length=1000)  # noqa: N815
    deckUrl = serializers.CharField(required=False)  # noqa: N815
    demoUrl = serializers.CharField(required=False)  # noqa: N815
    videoUrl = serializers.CharField(required=False)  # noqa: N815


class TeamBody(serializers.Serializer):
    workedTogether = serializers.ChoiceField(required=False, choices=rules.WORKED_TOGETHER)  # noqa: N815
    whyUs = serializers.CharField(required=False, max_length=1200)  # noqa: N815
    hiringNeeds = serializers.CharField(required=False, max_length=800)  # noqa: N815


class MemberBody(serializers.Serializer):
    name = serializers.CharField(max_length=80)
    role = serializers.CharField(max_length=80)
    email = serializers.EmailField(required=False)
    linkedin = serializers.CharField(required=False)
    equity = serializers.FloatField(required=False, min_value=0, max_value=100)
    commitment = serializers.ChoiceField(required=False, choices=list(rules.COMMITMENTS))
    isFounder = serializers.BooleanField(required=False)  # noqa: N815


class SubmitBody(serializers.Serializer):
    confirm = serializers.BooleanField()


class DecisionBody(serializers.Serializer):
    decision = serializers.ChoiceField(choices=list(rules.DECISIONS))
    message = serializers.CharField(required=False, max_length=2000)


class ScorecardBody(serializers.Serializer):
    scores = serializers.DictField(child=serializers.IntegerField(min_value=1, max_value=5), required=False)
    recommendation = serializers.ChoiceField(required=False, choices=rules.RECOMMENDATIONS)
    summary = serializers.CharField(required=False, max_length=2000)


class NoteBody(serializers.Serializer):
    body = serializers.CharField(max_length=2000)


class ApplicationSchema(serializers.Serializer):
    application = serializers.DictField(help_text="Application (types.ts); reviewers also get `review`")


class QueueSchema(serializers.Serializer):
    rows = serializers.ListField(child=serializers.DictField(), help_text="QueueRow (review.ts)")
    counts = serializers.DictField(child=serializers.IntegerField())
    summary = serializers.DictField(child=serializers.IntegerField())
    page = serializers.IntegerField()
    pages = serializers.IntegerField()
    pageSize = serializers.IntegerField()  # noqa: N815
    total = serializers.IntegerField()
