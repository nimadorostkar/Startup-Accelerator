# Fundup Club

The Fundup Club accelerator site: a public website (landing page, startup directory, events, newsletter, Demo Day), a founder dashboard where startups apply, and a review panel where the team decides.

- **Website:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 — in this folder
- **API:** Django 5.2 LTS · Django REST Framework · PostgreSQL · Redis · Celery — in [`backend/`](backend/)
- **Production:** Docker Compose behind Caddy (automatic HTTPS)

Docs: [docs/README.md](docs/README.md) — pages and features, the backend and its API, deployment.

## Run it locally

```bash
cp .env.example .env            # set POSTGRES_PASSWORD, and DJANGO_DEBUG=true
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py seed_dev_accounts
npm install
npm run dev                     # http://localhost:3000
```

The API runs at http://localhost:8000 (back office at `/backoffice/`, API docs at `/api/v1/docs/`), and every email lands in Mailpit at http://localhost:8025. Test sign-ins and sample data: [docs/deployment.md → Local development](docs/deployment.md#local-development).

## Run it in production

```bash
cp .env.example .env            # fill in: domain, secrets, email (see the file)
docker compose up -d --build
docker compose exec backend python manage.py createsuperuser
```

Full guide, sizing, backups and updates: [docs/deployment.md](docs/deployment.md).

## Structure

- `src/app/` — routes: public pages, `(auth)` sign-in pages, `dashboard/` (founders), `admin/` (reviewers), `api/` (Google sign-in callback, cache refresh)
- `src/lib/api.ts` — the website's only door to the API; `src/lib/auth.ts` — sessions and sign-in; `src/lib/application/` — application types, rules shown in the UI, founder/reviewer/public reads
- `src/components/` — sections and UI. `Hero.tsx` and `hero/` for the landing hero; `Navbar.tsx`, `MobileMenu.tsx`, `nav-links.ts` for the header
- `src/components/Logo.tsx` — Fundup Club logo as SVG: `BrandLogo` (wordmark + fox tag) for headers and footers, `BrandMark` (fox tag alone) for small spaces; `src/app/icon.svg` is the favicon
- `src/app/globals.css` — the palette: `--brand` (logo orange: accents, large text), `--brand-strong` (buttons, links, small orange text), `--brand-soft` (orange on dark), `--night`/`--ember` (dark bands), `--green-*` (success states only), with contrast notes
- `public/images/hero.webp` — **clean background plate**: every piece of text, button and line in the hero is rendered in code. Don't replace it with an image that has UI baked in.
- `backend/` — the Django API ([backend/README.md](backend/README.md)); `deploy/Caddyfile` — the reverse proxy; `docker-compose.yml` / `docker-compose.dev.yml` — production and development stacks

## Layout notes

Desktop (`lg+`) sizing is expressed in container-query units (`cqw`) against a 1920px-max container, so the composition scales proportionally with the viewport and freezes above 1920px.

The landing hero follows the same idea in `hero/Hero.module.css`: from 1101px it is laid out on a 1440×900 frame, every length `N × --u` (one design pixel, scaled by width or by height, whichever is tighter, so it fits the first screen on 16:9 too), with px floors on small text. Gutters follow width only, to stay aligned with the nav. Below 1101px it stacks.

If you swap `hero.webp`, clear Next's optimizer cache or you'll keep seeing the old image:

```bash
rm -rf .next/dev/cache/images .next/cache/images
```

Security headers, AVIF/WebP image negotiation and `poweredByHeader: false` are set in `next.config.ts`.
