# Fundup Club — Project Docs

Start here before changing the app, the API or how it's deployed.

| Doc | Read it when | What's in it |
| --- | --- | --- |
| [pages-and-features.md](pages-and-features.md) | Changing any page, form or rule | Every route, every field with its form name and validation, the application lifecycle, the admin panel, emails, security rules |
| [backend-integration.md](backend-integration.md) | Working on the API or how the website talks to it | Architecture, the full API reference, data model, the rules the API enforces (and their tests), notifications, caching, rate limits, environment variables |
| [deployment.md](deployment.md) | Running it in production (or locally) | The Docker Compose stack, sizing for ~1,000 users, first deploy, email, updates, backups, monitoring, security checklist, local development |
| [../backend/README.md](../backend/README.md) | Working inside `backend/` | Apps, commands, tests, lint |

**Keep them current:** update the relevant doc in the same commit as the change it describes. The online copy of the pages reference ([claude.ai doc](https://claude.ai/code/artifact/2a03db74-a0d6-470e-8f68-c69424658a6b)) is for sharing and comments. It does not sync automatically; these files are the source of truth.

## Quick facts

- **Website:** Next.js 16 (App Router, Server Actions), React 19, Tailwind CSS 4, TypeScript. Calls the API from the server only ([src/lib/api.ts](../src/lib/api.ts)).
- **API:** Django 5.2 LTS + Django REST Framework, PostgreSQL 17, Redis, Celery ([backend/](../backend/)). Owns all data and enforces every rule; sends every email.
- **Areas:** landing page `/` · public pages (`/startups`, `/events`, `/newsletter`, `/demo-day`…) · sign-in `/login` `/register` `/forgot-password` `/reset-password` `/verify-email` · founder dashboard `/dashboard/*` · review panel `/admin/*` · back office (Django admin) `/backoffice/`.
- **Run it locally:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d`, then `npm run dev`. Details, test accounts and sample data: [deployment.md → Local development](deployment.md#local-development).
- **Production:** `docker compose up -d --build` behind Caddy with automatic HTTPS: [deployment.md](deployment.md).
- **Tests:** `cd backend && pytest` (121 tests, real Postgres) · `npx tsc --noEmit && npm run lint` for the website.
