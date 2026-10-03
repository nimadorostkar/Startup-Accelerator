# Fundup Club — Testing

As of 2026-10-03. Three layers, from fastest to most complete:

| Layer | Where | What it proves | Run it |
| --- | --- | --- | --- |
| API tests | `backend/tests/` (pytest, 144 tests) | Every rule, against a real PostgreSQL, including requests racing on separate connections | `cd backend && pytest` |
| End-to-end: API | `e2e/api/` (Playwright, 43 tests) | Every endpoint over real HTTP against a running stack: Postgres, Redis, the Celery worker, real emails (read back from Mailpit), rate limits, cache refresh | `npm run test:e2e:api` |
| End-to-end: website | `e2e/web/` (Playwright, 23 tests) | The site in a real browser: public pages fed by the API, sign-up to sign-out, returning to the page asked for after signing in, account settings, every form, and a whole application lifecycle with a founder and a reviewer side by side | `npm run test:e2e` (runs both) |

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

**Against another stack** (staging, or the production setup on your machine), point it there:

| Variable | Default | What |
| --- | --- | --- |
| `E2E_SITE_URL` | `http://localhost:3000` | The website |
| `E2E_API_URL` | `$BACKEND_URL/api/v1` (from `.env`) | The API, called directly |
| `E2E_MAILPIT_URL` | `http://localhost:8025` | Where the stack's emails can be read |
| `E2E_REVIEWER_EMAIL`, `E2E_REVIEWER_PASSWORD` | the `seed_dev_accounts` reviewer | A verified reviewer |
| `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` | the `seed_dev_accounts` admin | A back-office superuser (a `createsuperuser` account works for both) |
| `E2E_PURGE` | on | `0` to skip the clean-up |

The API tests give each test its own visitor address (`X-Forwarded-For`, which the API believes only from the private network) so their rate limits never collide; the website tests do the same through the browser (the `test` exported by `e2e/support/web.ts`), which the dev website passes on to the API. Through Caddy that header is replaced by the real address, so point `E2E_API_URL` at the API's own port rather than through the proxy; the website tests go through Caddy as visitors do. The emails need a Mailpit (or any server with Mailpit's API) receiving the stack's mail.

On 2026-10-03 all 61 tests passed against the dev stack (twice in a row) and against the production setup: the production Next.js build behind Caddy, Gunicorn with `DJANGO_DEBUG=false`, the worker sending real SMTP. After the integration review later that day, all 66 passed against the dev stack, and the production build was checked by hand for the proxy's sign-in redirect, the start-up wait for the API, and public pages staying up (serving their last copy) when the API is down.

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
| `e2e/web/form-state.spec.ts` | A save the server refuses keeps everything typed or picked, dropdowns and choice cards included |
| `e2e/web/session.spec.ts` | Signed-out visitors come back to the page they asked for after signing in (`?next=`), and `next` never leads off the site or into the wrong area; a refused sign-in keeps "Keep me signed in" ticked; account settings (rename, wrong then right current password, other sessions ended, sign in with the new one); a session ending mid-edit keeps what was typed and offers a way back in |

Left to the API tests (they need setup the running stack doesn't expose): a successful Google sign-in (Google's token endpoint is mocked there), full events, the daily review digest and event reminders.
