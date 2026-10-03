import pytest
from django.test import override_settings
from rest_framework.test import APIClient

from apps.core.net import client_ip
from apps.core.validation import optional_url

pytestmark = pytest.mark.django_db


def test_health_and_readiness():
    client = APIClient()
    assert client.get("/api/v1/health").json() == {"status": "ok"}
    ready = client.get("/api/v1/health/ready")
    assert ready.status_code == 200 and ready.json()["database"] == "ok"


def test_responses_carry_a_request_id():
    response = APIClient().get("/api/v1/health", HTTP_X_REQUEST_ID="abc123def456")
    assert response["X-Request-ID"] == "abc123def456"
    assert len(APIClient().get("/api/v1/health")["X-Request-ID"]) == 32


def test_bad_json_is_a_400_with_a_message():
    response = APIClient().post("/api/v1/contact", data="{not json", content_type="application/json")
    assert response.status_code == 400 and "message" in response.json()


def test_unknown_api_path_is_404():
    assert APIClient().get("/api/v1/nope").status_code == 404


class FakeRequest:
    def __init__(self, remote, forwarded=""):
        self.META = {"REMOTE_ADDR": remote, "HTTP_X_FORWARDED_FOR": forwarded}


def test_client_ip_trusts_forwarding_only_from_our_own_network():
    assert client_ip(FakeRequest("172.18.0.5", "203.0.113.7")) == "203.0.113.7"
    assert client_ip(FakeRequest("172.18.0.5", "198.51.100.1, 203.0.113.7, 172.18.0.2")) == "203.0.113.7"
    assert client_ip(FakeRequest("203.0.113.9", "1.2.3.4")) == "203.0.113.9"  # forged header ignored
    assert client_ip(FakeRequest("172.18.0.5", "garbage")) == "172.18.0.5"


@pytest.mark.parametrize(
    ("value", "ok"),
    [
        ("acme.com", True),
        ("https://docsend.com/view/abc", True),
        ("http://münchen.de", True),
        ("https://my_site.example.org/x", True),
        ("localhost", False),
        ("not a link", False),
        ("https://exa mple.com", False),
        ("https://acme.com:99999", False),
        ("https://-bad-.com", False),
    ],
)
def test_url_check(value, ok):
    assert (optional_url(value) is None) is ok


@override_settings(API_DOCS_PUBLIC=True)
def test_openapi_schema_generates():
    from drf_spectacular.generators import SchemaGenerator

    schema = SchemaGenerator().get_schema(request=None, public=True)
    assert "/api/v1/me/application/submit" in schema["paths"]
