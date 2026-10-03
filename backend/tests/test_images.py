from io import BytesIO

import pytest
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from PIL import Image
from rest_framework.test import APIClient

from apps.applications.models import Application

from .conftest import client_for, make_user

pytestmark = pytest.mark.django_db

LOGO = "/api/v1/me/application/logo"
PHOTO = "/api/v1/me/application/photo"


def picture(size=(900, 600), fmt="PNG", name="logo.png") -> SimpleUploadedFile:
    out = BytesIO()
    Image.new("RGB", size, "#c2470a").save(out, fmt)
    return SimpleUploadedFile(name, out.getvalue(), content_type=f"image/{fmt.lower()}")


def upload(client, url, file):
    return client.put(url, {"file": file}, format="multipart")


def stored(url: str) -> Image.Image:
    return Image.open(default_storage.open(url.removeprefix("/api/v1/media/")))


def test_an_uploaded_logo_is_resized_stored_as_webp_and_served(founder_client):
    response = upload(founder_client, LOGO, picture())
    assert response.status_code == 200
    url = response.json()["application"]["logo"]
    assert url.startswith("/api/v1/media/startups/") and url.endswith(".webp")
    image = stored(url)
    assert image.format == "WEBP" and image.size == (512, 341)  # kept whole, never cropped

    served = APIClient().get(url)
    assert served.status_code == 200
    assert served["Content-Type"] == "image/webp" and "immutable" in served["Cache-Control"]


def test_a_founder_photo_is_cropped_square(founder_client):
    url = upload(founder_client, PHOTO, picture((800, 1200), "JPEG", "me.jpg")).json()["application"]["photo"]
    assert url.startswith("/api/v1/media/founders/")
    assert stored(url).size == (512, 512)


def test_a_new_upload_replaces_the_old_file_and_removing_deletes_it(founder_client):
    first = upload(founder_client, LOGO, picture()).json()["application"]["logo"]
    second = upload(founder_client, LOGO, picture((300, 300))).json()["application"]["logo"]
    assert first != second
    assert not default_storage.exists(first.removeprefix("/api/v1/media/"))

    removed = founder_client.delete(LOGO)
    assert removed.status_code == 200 and removed.json()["application"]["logo"] == ""
    assert not default_storage.exists(second.removeprefix("/api/v1/media/"))


def test_files_that_are_not_images_are_refused(founder_client):
    not_an_image = SimpleUploadedFile("logo.png", b"<script>alert(1)</script>", content_type="image/png")
    response = upload(founder_client, LOGO, not_an_image)
    assert response.status_code == 422
    assert response.json()["errors"] == {"file": "Use a PNG, JPEG or WebP image."}

    gif = upload(founder_client, LOGO, picture(fmt="GIF", name="logo.gif"))
    assert gif.status_code == 422 and gif.json()["errors"]["file"] == "Use a PNG, JPEG or WebP image."

    assert founder_client.put(LOGO, {}, format="multipart").json()["errors"] == {
        "file": "Choose an image to upload."
    }
    assert founder_client.get("/api/v1/me/application").json()["application"]["logo"] == ""


def test_images_are_locked_with_the_rest_of_the_application(submitted, founder):
    client = client_for(founder)
    assert upload(client, LOGO, picture()).status_code == 409
    assert client.delete(PHOTO).status_code == 409
    assert Application.objects.get(pk=founder.pk).logo.name == ""


def test_uploads_need_a_session(db):
    assert upload(APIClient(), LOGO, picture()).status_code == 401


def test_the_directory_shows_the_logo_and_the_founder(founder, founder_client):
    from .conftest import fill_application, submit

    fill_application(founder_client)
    logo = upload(founder_client, LOGO, picture()).json()["application"]["logo"]
    photo = upload(founder_client, PHOTO, picture()).json()["application"]["photo"]
    assert submit(founder_client).status_code == 200

    [card] = APIClient().get("/api/v1/startups").json()["startups"]
    assert card["logo"] == logo
    assert card["founder"] == {"name": "Maya Rosen", "role": "CEO & co-founder", "photo": photo}
    detail = APIClient().get(f"/api/v1/startups/{card['slug']}").json()["startup"]
    assert detail["logo"] == logo and detail["applicant"]["photo"] == photo


def test_deleting_an_account_deletes_its_images(founder, founder_client):
    url = upload(founder_client, LOGO, picture()).json()["application"]["logo"]
    founder.delete()
    assert not default_storage.exists(url.removeprefix("/api/v1/media/"))


def test_made_up_media_addresses_are_not_found(db):
    for path in ("startups/../../etc/passwd", "startups/nope.webp", "other/" + "a" * 32 + ".webp"):
        assert APIClient().get(f"/api/v1/media/{path}").status_code == 404


def test_seed_startups_fills_the_directory(settings, db):
    settings.DEBUG = True
    make_user("real@example.com")  # never touched
    default_storage.save("startups/keep.webp", BytesIO(b"someone else's"))
    before = sorted(default_storage.listdir("startups")[1])
    call_command("seed_startups")
    cards = APIClient().get("/api/v1/startups").json()["startups"]
    assert len(cards) == 50
    assert all(card["logo"] and card["founder"]["name"] and card["tagline"] for card in cards)
    assert sum(1 for card in cards if card["status"] == "cohort") == 22
    assert sum(1 for card in cards if card["founder"]["photo"]) == 5
    # Every one is complete: it could have been submitted through the form.
    assert all(app.progress()["ready"] for app in Application.objects.all())

    call_command("seed_startups")  # again: refreshed, not doubled
    assert Application.objects.count() == 50
    call_command("seed_startups", reset=True)
    assert Application.objects.count() == 0
    assert sorted(default_storage.listdir("startups")[1]) == before  # its images went with it
