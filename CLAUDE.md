@AGENTS.md

## Project docs

Read `docs/README.md` before changing features, the API or the deployment:

- `docs/pages-and-features.md` — every page, field (with form names), validation rule, status and permission.
- `docs/backend-integration.md` — the Django API in `backend/`: architecture, endpoints, data model, the rules it enforces (rules live in both `backend/apps/applications/rules.py` and `src/lib/application/` — change both), emails, caching.
- `docs/deployment.md` — the Docker Compose stack, production setup, local development.

Update the relevant doc in the same commit as any change it describes.
