# Fundup Club — Testing

As of 2026-10-03. Three layers, from fastest to most complete:

| Layer | Where | What it proves | Run it |
| --- | --- | --- | --- |
| API tests | `backend/tests/` (pytest, 248 tests) | Every rule, against a real PostgreSQL, including requests racing on separate connections | `cd backend && pytest` |
| End-to-end: API | `e2e/api/` (Playwright, 43 tests) | Every endpoint over real HTTP against a running stack: Postgres, Redis, the Celery worker, real emails (read back from Mailpit), rate limits, cache refresh | `npm run test:e2e:api` |
| End-to-end: website | `e2e/web/` (Playwright, 30 tests) | The site in a real browser: public pages fed by the API, sign-up to sign-out, returning to the page asked for after signing in, account settings, every form, and a whole application lifecycle with a founder and a reviewer side by side | `npm run test:e2e` (runs both) |

Plus `npx tsc --noEmit && npm run lint` for the website, and `ruff check . && ruff format --check .` in `backend/`.

## Running the end-to-end suite

Against the dev stack:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py seed_dev_accounts
npm run dev
npx playwright install chromium        # once
npm run test:e2e
```

The suite checks first that the website, the API (with its database and Redis), Mailpit and the test reviewer all answer, and says what to start if not. Results print as they run; the HTML report (with a trace and screenshot for any failure) is written to `e2e-report/` — open it with `npx playwright show-report e2e-report`.

**Test data:** every account, registration, subscriber and message the suite creates uses an `@e2e.fundup.example` address. `python manage.py purge_e2e_data` removes them; the suite runs it before and after itself against the dev stack (set `E2E_PURGE=0` to keep the data for a look), with `--rate-limits`, which also resets every rate-limit counter: on the dev stack every visitor of the website shares one address, so an hour of clicking around would otherwise leave the suite's sign-ups refused.

### Against the production build

[docker-compose.e2e.yml](../docker-compose.e2e.yml) runs the real production stack on your machine (the same images, Gunicorn, Celery, Caddy and production Next.js build, at http://localhost) as a separate Compose project with its own database, so neither the dev stack nor `.env` is touched. For testing only, it adds Mailpit (port 8026), gives the API a port (8002) for the API tests, and has Caddy pass on each test browser's address ([deploy/Caddyfile.e2e](../deploy/Caddyfile.e2e)), so rate limits count every test as its own visitor. Run it after any change to the Dockerfiles, the Caddyfile, `next.config.ts` or how the website caches: some problems only exist there (see the note at the end of this section).

```bash
E2E="docker compose -p fundup-e2e -f docker-compose.yml -f docker-compose.e2e.yml"
$E2E up -d --build
# A reviewer who is also a back-office admin, for the suite to sign in as (asks for a password):
$E2E exec backend python manage.py createsuperuser --email reviewer@e2e-admin.example --name "E2E Reviewer"

export E2E_SITE_URL=http://localhost E2E_API_URL=http://localhost:8002/api/v1 E2E_MAILPIT_URL=http://localhost:8026
export E2E_REVIEWER_EMAIL=reviewer@e2e-admin.example E2E_ADMIN_EMAIL=reviewer@e2e-admin.example
export E2E_REVIEWER_PASSWORD=… E2E_ADMIN_PASSWORD=…        # the password you chose
E2E_PURGE=0 npm run test:e2e

$E2E exec backend python manage.py purge_e2e_data --force --rate-limits   # between runs
$E2E down -v                                                              # when done
```

`E2E_PURGE=0` because the suite's own clean-up talks to the dev stack; clean this one with the `purge_e2e_data` line. Ports 80 and 443 must be free; move the others with `E2E_API_PORT` and `E2E_MAIL_PORT`.

**Against another stack** (staging, say), point it there:

| Variable | Default | What |
| --- | --- | --- |
| `E2E_SITE_URL` | `http://localhost:3000` | The website |
| `E2E_API_URL` | `$BACKEND_URL/api/v1` (from `.env`) | The API, called directly |
| `E2E_MAILPIT_URL` | `http://localhost:8025` | Where the stack's emails can be read |
| `E2E_REVIEWER_EMAIL`, `E2E_REVIEWER_PASSWORD` | the `seed_dev_accounts` reviewer | A verified reviewer |
| `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` | the `seed_dev_accounts` admin | A back-office superuser (a `createsuperuser` account works for both) |
| `E2E_PURGE` | on | `0` to skip the clean-up |

The API tests give each test its own visitor address (`X-Forwarded-For`, which the API believes only from the private network) so their rate limits never collide; the website tests do the same through the browser (the `test` exported by `e2e/support/web.ts`), which the dev website passes on to the API. Through Caddy that header is replaced by the real address, so point `E2E_API_URL` at the API's own port rather than through the proxy; the website tests go through Caddy as visitors do, and unless that Caddy passes their addresses on (as the test overlay's does) they all share one: the tests that sign in repeatedly (`session.spec.ts`) then run into the sign-in limit of 10 a minute, so run the website tests with `--workers=1` there and expect those to need a retry. The emails need a Mailpit (or any server with Mailpit's API) receiving the stack's mail.

On 2026-10-03 all 61 tests passed against the dev stack (twice in a row) and against the production setup: the production Next.js build behind Caddy, Gunicorn with `DJANGO_DEBUG=false`, the worker sending real SMTP. After the integration review later that day, all 66 passed against the dev stack, and the production build was checked by hand for the proxy's sign-in redirect, the start-up wait for the API, and public pages staying up (serving their last copy) when the API is down.

Later still, the whole suite was run against the production build with the test overlay, which found two problems that never show on the dev stack: Caddy reusing connections the website had just closed (an occasional 502 on a form post), and optimised images not being cached at all (each request re-encoded its image, stalling the website for seconds under load). Both are fixed ([deployment.md](deployment.md#what-runs), [backend-integration.md](backend-integration.md#caching-and-refresh)); with the fixes, all 66 passed four times in a row against the production build, with no 502 in Caddy's log. After logos and founder photos were added (uploads through the website, files served by Caddy from the `media` volume), all 69 passed twice in a row there, with the 50 sample startups loaded. After the second integration review (emails, the back office, public forms, a production deployment to fundupclub.com), all 69 passed against the dev stack with 248 API tests, and CI runs the API tests and the website checks on every push ([deployment.md](deployment.md#continuous-deployment)).

## What the end-to-end suite covers

| File | Covers |
| --- | --- |
| `e2e/api/health.spec.ts` | Liveness and readiness, option lists, request ids, the error shape, malformed and non-object JSON |
| `e2e/api/auth.spec.ts` | Sign-up (cookie attributes, every validation message, taken addresses), sign-in and "keep me signed in", one message for every wrong answer, `/me`, renaming, password change (other sessions end), sign-out, email confirmation, password reset (same answer for unknown addresses, single-use link), Google sign-in errors, rate limits per address and failed sign-ins per account |
| `e2e/api/application.spec.ts` | First visit, saves and normalising, every field error, team members and the equity cap (including parallel saves), submit/lock/withdraw/resubmit, founders reaching only their own application, signed-out access |
| `e2e/api/review.spec.ts` | The 404 wall for everyone but reviewers, the queue (search, filters, counts, sorting, paging), every decision and the founder's emails, two reviewers deciding at once, assignment, scorecards and notes never reaching the founder, the CSV export (BOM, 33 columns, formulas defused) |
| `e2e/api/public.spec.ts` | The startup directory and its allowlist, events and registration (repeat, invalid, ended, unknown, bot trap, calendar invite), newsletter issues, subscribe/unsubscribe, the contact form |
| `e2e/api/security.spec.ts` | Cookie sessions only changing data from the site's own origin, forged and stale tokens, non-JSON bodies |
| `e2e/web/public-pages.spec.ts` | The landing page, events, newsletter and directory showing the API's data (a new submission and a decision show up within seconds), 404s, legal pages, robots.txt and the sitemap |
| `e2e/web/account.spec.ts` | Sign-up through the form, confirming the email from the link, sign-out, sign-in, server errors under their fields, forgot/reset password, Google error messages, the review panel's 404 for founders |
| `e2e/web/lifecycle.spec.ts` | A founder fills in and submits; a reviewer starts a review and requests changes; the founder sees it and resubmits; the reviewer scores, notes and accepts; the founder and the public directory see the result; the export includes it |
| `e2e/web/forms.spec.ts` | Event registration (and the repeat), newsletter sign-up and unsubscribe from the email, the contact form, the back office |
| `e2e/web/images.spec.ts` | A founder uploads a logo and a photo from the dashboard (and a file that isn't an image is refused); the directory and the startup's page show them; removing a logo; every card in the hero's featured-founders panel is a startup from the directory |
| `e2e/web/form-state.spec.ts` | A save the server refuses keeps everything typed or picked, dropdowns and choice cards included |
| `e2e/web/languages.spec.ts` | English, Turkish and Persian addresses, `lang` and `dir`, translated navigation with links that keep the language, `/en/…` redirecting, the switcher keeping the page and its filters (desktop and phone), localized 404s, the sitemap's languages |
| `e2e/web/session.spec.ts` | Signed-out visitors come back to the page they asked for after signing in (`?next=`), and `next` never leads off the site or into the wrong area; a refused sign-in keeps "Keep me signed in" ticked; account settings (rename, wrong then right current password, other sessions ended, sign in with the new one); a session ending mid-edit keeps what was typed and offers a way back in |

Left to the API tests (they need setup the running stack doesn't expose): a successful Google sign-in (Google's token endpoint is mocked there), full events, the daily review digest and event reminders.
