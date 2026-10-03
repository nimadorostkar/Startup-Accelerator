# Fundup Club — Deployment

As of 2026-10-03. How to run the whole site in production with Docker Compose, sized for about 1,000 users. How the pieces fit together is in [backend-integration.md](backend-integration.md).

## What runs

`docker compose up -d --build` starts seven containers from [docker-compose.yml](../docker-compose.yml):

| Service | Image | Role | Exposed |
| --- | --- | --- | --- |
| `caddy` | `caddy:2-alpine` | HTTPS (automatic Let's Encrypt certificates), compression, security headers; routes `/api/v1/*` and `/backoffice/*` to the API (`/backoffice` redirects to `/backoffice/`), everything else to the website ([deploy/Caddyfile](../deploy/Caddyfile)) | 80, 443 |
| `frontend` | built from [Dockerfile](../Dockerfile) | The Next.js website (standalone server, non-root). Waits up to 90 s for the API to be ready before it starts serving ([scripts/start.mjs](../scripts/start.mjs)) | — |
| `backend` | built from [backend/Dockerfile](../backend/Dockerfile) | The Django API on Gunicorn; applies database migrations on start | — |
| `worker` | same image | Celery: emails, page refreshes | — |
| `beat` | same image | Celery beat: daily review digest, hourly event reminders, nightly clean-up | — |
| `db` | `postgres:17-alpine` | PostgreSQL, data in the `pgdata` volume | — |
| `redis` | `redis:7.4-alpine` | Cache, rate limits and the job queue (append-only file in `redisdata`) | — |

Startup logos and founder photos are files in the `media` volume: the API writes them, Caddy serves them (`/api/v1/media/…`, cached for good, since a file never changes once written).

Only Caddy is reachable from outside. **Never publish the API's port**: it trusts the forwarding headers that Caddy and the website set.

**Connections between the containers:** Caddy drops an idle connection to the website or the API after 30 s, and both keep theirs open for 75 s (`keepalive` in the Caddyfile; `KEEP_ALIVE_TIMEOUT` in the website's Dockerfile; `keepalive` in [gunicorn.conf.py](../backend/gunicorn.conf.py)). Keep it that way round if you change any of them: when the website or the API closes first (both default to 5 s), Caddy now and then sends a request down a connection that is just closing and answers 502, and a form being submitted can't be retried, so the visitor gets an error page.

Rate limits count each visitor by the address Caddy sees. With Docker's default networking, visitors arriving over **IPv6** reach Caddy as the Docker gateway's address and would share one count; if you publish an AAAA record, enable IPv6 in Docker (`"ipv6": true` in the daemon config) or put Caddy on the host network.

## Sizing

For ~1,000 registered users (a few hundred active a day, peaks of tens at once) one server is plenty:

- **2 vCPU, 4 GB RAM, 40 GB SSD** (any VPS: Hetzner CX22/CPX21, DigitalOcean, Lightsail…). The stack idles at about 1 GB.
- Defaults: 3 Gunicorn processes × 4 threads (`WEB_CONCURRENCY`, `WEB_THREADS`), 2 Celery processes, Postgres with 100 connections and 256 MB shared buffers, Redis capped at 256 MB.
- Measured on a laptop running the stack in Docker: public pages are served from cache at 140–190 requests a second; the API answers its public lists at 300+ a second. Signed-in pages render per request.

To grow: raise `WEB_CONCURRENCY` to `2 × CPUs + 1` on a bigger server; move Postgres to a managed database (just change `DATABASE_URL`); for more than one website container, give Next a shared cache (see the Next.js self-hosting guide in `node_modules/next/dist/docs/01-app/02-guides/self-hosting.md`).

## First deploy

[deploy/bootstrap.sh](../deploy/bootstrap.sh) does steps 1–3 on a Debian or Ubuntu server, and is safe to run again: it installs Docker if missing, adds swap on small machines, clones the repository to `/opt/fundup`, writes `/opt/fundup/.env` with secrets generated on the server (they never leave it), and schedules the nightly backup. It leaves the firewall alone unless run with `FIREWALL=1`.

```bash
ssh root@<server> 'sh -s' < deploy/bootstrap.sh your-domain
```

Then fill in the email settings in `/opt/fundup/.env` and deploy with `/opt/fundup/deploy/deploy.sh`. By hand:

1. **Server:** install Docker Engine with the Compose plugin. Open ports 80 and 443. Point your domain's DNS (A/AAAA) at the server.
2. **Code:** `git clone` the repository onto the server.
3. **Settings:** `cp .env.example .env`, then set at least:
   - `SITE_URL=https://your-domain` and `SITE_ADDRESS=your-domain` (the API answers to that domain automatically)
   - `COOKIE_SECURE=true` (the default)
   - `DJANGO_SECRET_KEY`, `REVALIDATE_SECRET`: `openssl rand -hex 32` each
   - `POSTGRES_PASSWORD`: `openssl rand -hex 24` (letters and digits only)
   - the `EMAIL_*` settings and `DEFAULT_FROM_EMAIL` from your email provider, and `SUPPORT_EMAILS`
   - optionally `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and `SENTRY_DSN`
4. **Start:** `docker compose up -d --build`. The first start creates the database tables and, with `SEED_CONTENT=1`, loads the launch events and newsletter issues. Caddy gets the certificate on the first request.
5. **First admin:** `docker compose exec backend python manage.py createsuperuser`. Sign in to the back office at `https://your-domain/backoffice/`. A superuser is also a reviewer, so `/admin` (the review panel) works with the same account once you sign in on the website.
6. **Reviewers:** have them create an account on the website, then in the back office → Users select them → *Make reviewer*. The panel opens for them once they've confirmed their email with the emailed link (they're sent a fresh one if needed); the back office can't confirm an address for someone, so an account registered by someone else with their address can't become a reviewer.
7. **Check:** `curl https://your-domain/api/v1/health/ready` answers `{"status":"ok",…}`; `docker compose ps` shows everything healthy.

## Email

Any SMTP provider works (Postmark, Resend, Amazon SES, Mailgun…): set `EMAIL_HOST`, `EMAIL_PORT` (587 for STARTTLS, 465 for TLS), `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` and a `DEFAULT_FROM_EMAIL` on a domain you've verified with the provider (SPF, DKIM and DMARC records). Without `EMAIL_HOST`, emails are written to the worker's log (`docker compose logs worker`), which is handy for a staging server.

## Updating

Every push to `main` deploys itself once its tests pass (see *Continuous deployment*). By hand, on the server:

```bash
/opt/fundup/deploy/deploy.sh            # the latest main
/opt/fundup/deploy/deploy.sh <commit>   # a given commit, e.g. to roll back
```

[deploy/deploy.sh](../deploy/deploy.sh) checks out the commit, builds the images on the server, restarts what changed, and waits up to 5 minutes for the site to answer through its public address, printing the logs and the command to roll back if it doesn't. One deploy runs at a time.

The API applies new migrations as it starts (under a database lock, so it's safe if several start at once). Both images build without contacting the API; public pages fill in from the API on their first visit after the deploy (which is why the website waits for the API on start: after a host reboot, Docker restarts containers without regard to `depends_on`). There is a few seconds' gap while containers are replaced; for zero-downtime deploys, run two website and API containers behind Caddy and replace them one at a time.

## Continuous deployment

[.github/workflows/ci-deploy.yml](../.github/workflows/ci-deploy.yml) runs on every push and pull request:

| Job | What it checks |
| --- | --- |
| API tests | `ruff`, that no model change lacks a migration, and the whole pytest suite against a PostgreSQL service |
| Website checks | `next typegen` + `tsc`, ESLint, and the production build |
| Deploy to production | Only for `main`, once both pass: connects to the server and runs `deploy/deploy.sh <commit>`, then checks the live site answers. Deploys queue one behind another, never cancel each other |

The end-to-end suite isn't in CI (it needs the whole stack); run it before merging anything that changes behaviour ([testing.md](testing.md)).

**Repository secrets** (GitHub → Settings → Secrets and variables → Actions):

| Secret | Value |
| --- | --- |
| `DEPLOY_HOST` | The server's address |
| `DEPLOY_SSH_KEY` | The private half of a key used only for deploys |
| `DEPLOY_KNOWN_HOSTS` | `ssh-keyscan <server>` output, so CI only ever talks to the real server |

The deploy key is installed on the server with a forced command, [deploy/ci-ssh.sh](../deploy/ci-ssh.sh), in root's `~/.ssh/authorized_keys`:

```
command="/opt/fundup/deploy/ci-ssh.sh",restrict ssh-ed25519 AAAA… github-actions-deploy@fundupclub
```

so whoever holds it can only ask for `deploy <commit id>`: never a shell, a file transfer or a tunnel. The site's own secrets stay in the server's `.env`; nothing secret is in the repository (it is public).

## Production: fundupclub.com

| | |
| --- | --- |
| Server | `217.65.145.161`, Ubuntu 24.04, 2 vCPUs, 8 GB, shared with two other projects (`/opt/tradeplatform`, `/root/financebot`) |
| Code and settings | `/opt/fundup` (a checkout of `main`), `/opt/fundup/.env` |
| Backups | `/opt/fundup/backups/`, nightly at 02:30 UTC (`/etc/cron.d/fundup-backup`), 14 days |
| HTTPS | The server's ports 80/443 belong to the `financebot` project's Caddy, which gets the certificates for every site on the machine. Its Caddyfile (`/root/financebot/Caddyfile`) forwards `fundupclub.com` to Fundup's own Caddy |

Because another proxy owns 80/443, Fundup runs in *behind-proxy* mode ([deploy/docker-compose.behind-proxy.yml](../deploy/docker-compose.behind-proxy.yml), switched on by `COMPOSE_FILE` in the server's `.env`): its Caddy keeps all of Fundup's routing (website, API, back office, uploaded images) but listens on plain HTTP at `172.18.0.1:8081`, the host's address on the front proxy's Docker network, which the internet can't reach. It trusts the forwarding headers only from private addresses ([deploy/Caddyfile.behind-proxy](../deploy/Caddyfile.behind-proxy)), so rate limits still count each visitor. The front proxy's block for the site:

```
fundupclub.com {
	reverse_proxy 172.18.0.1:8081 {
		flush_interval -1
		transport http {
			keepalive 30s
		}
	}
}
```

To serve `www.fundupclub.com` too, point its DNS at the server and add `www.fundupclub.com { redir https://fundupclub.com{uri} 308 }` to the front proxy. On a server of its own, leave `COMPOSE_FILE`, `SITE_ADDRESS=:80` and `CADDY_BIND` out of `.env`, set `SITE_ADDRESS=fundupclub.com`, and Fundup's Caddy takes ports 80/443 itself.

## Backups

Everything that matters is in Postgres, plus the uploaded logos and photos in the `media` volume. A nightly dump and a copy of the images, kept for 14 days:

```bash
docker compose exec -T db pg_dump -U fundup -Fc fundup > backups/fundup-$(date +%F).dump
docker compose exec -T backend tar -czf - -C /app media > backups/media-$(date +%F).tar.gz
find backups \( -name 'fundup-*.dump' -o -name 'media-*.tar.gz' \) -mtime +14 -delete
```

Run it from cron, and copy `backups/` off the server (object storage). Restore into an empty database with `pg_restore -U fundup -d fundup --clean`. Test a restore before you need one. Redis holds only the cache and queued jobs; losing it loses at most a few unsent emails.

## Monitoring

- **Health:** `/api/v1/health` (process up) and `/api/v1/health/ready` (database and Redis reachable). The website, API, worker, Postgres and Redis containers have Docker healthchecks (beat and Caddy don't).
- **Logs:** `docker compose logs -f backend worker frontend caddy`. The API writes one JSON object per line; every request carries an `X-Request-ID` that Caddy creates and the website and API log, so one id follows a request through all three. Logs rotate at 10 MB × 5 files per container.
- **Errors:** set `SENTRY_DSN` to send API and worker errors to Sentry.
- **Slow queries:** Postgres logs any statement over 500 ms.

## Checking a deployment

The end-to-end suite runs against any stack, production included: see [testing.md](testing.md#running-the-end-to-end-suite) for the variables that point it there.

## Security checklist

- [ ] `DJANGO_DEBUG=false`, long random `DJANGO_SECRET_KEY` and `REVALIDATE_SECRET`
- [ ] `COOKIE_SECURE=true` and an `https://` `SITE_URL`
- [ ] Only ports 80/443 open on the server
- [ ] Strong passwords for back-office accounts; few superusers
- [ ] Off-server backups, restore tested
- [ ] `API_DOCS_PUBLIC` left empty or `false` (docs off in production) unless you want the API docs public

Built in: Argon2 password hashing; sessions stored as hashes and revocable; rate limits on sign-in (including the back office), sign-up, reset and the public forms, counting failures per account so nobody can lock a founder out; cross-site protection on cookie-authenticated writes; HSTS and other security headers; non-root containers; reviewer-only data never sent to founders; the public directory built from an allowlist.

## Local development

```bash
cp .env.example .env    # set POSTGRES_PASSWORD; DJANGO_DEBUG=true
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py seed_dev_accounts
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py seed_demo
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py seed_startups
npm install && npm run dev
```

That runs Postgres, Redis, the API (auto-reloading, at http://localhost:8000), a worker and Mailpit (every email lands at http://localhost:8025); the website runs on your machine at http://localhost:3000. `seed_dev_accounts` creates `founder@example.com`, `reviewer@example.com` and a back-office admin, `admin@example.com` (password in [the command](../backend/apps/accounts/management/commands/seed_dev_accounts.py)); `seed_demo` adds 23 sample applications for the review queue (`seed_demo --reset` removes them), and `seed_startups` fills the public directory with 50 complete startups with logos (`seed_startups --reset` removes them). If ports clash with other projects, move them with `DEV_DB_PORT`, `DEV_REDIS_PORT`, `DEV_API_PORT` and `DEV_MAIL_PORT` in `.env`, and point the website at the API with `BACKEND_URL`. The dev API keeps no database connections open between requests (`DATABASE_CONN_MAX_AGE=0`): Django's development server starts a thread per request, and kept-open connections from finished threads used to pile up until Postgres refused new ones ("too many clients"). Gunicorn's threads are long-lived, so production keeps them for 60 s.

To try the production setup locally: set `SITE_URL=http://localhost`, `SITE_ADDRESS=http://localhost` and `COOKIE_SECURE=false` in `.env`, then `docker compose up -d --build` and open http://localhost. To run the end-to-end suite against the production build without touching `.env` or your dev data, use the test overlay instead: [testing.md → Against the production build](testing.md#against-the-production-build).
