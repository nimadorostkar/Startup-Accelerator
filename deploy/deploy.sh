#!/bin/sh
# Deploys one commit of Fundup Club on the production server.
#
#   deploy/deploy.sh <commit>      # what CI runs (.github/workflows/ci-deploy.yml)
#   deploy/deploy.sh               # the latest main
#   deploy/deploy.sh <older sha>   # roll back
#
# Runs in the server's checkout (/opt/fundup by default, APP_DIR to change it),
# next to the server's own .env, which never leaves the server. Builds the
# images there, restarts what changed (the API applies migrations as it starts),
# then waits until the site answers through Caddy, and fails if it doesn't.
set -eu

APP_DIR=${APP_DIR:-/opt/fundup}
TARGET=${1:-origin/main}

cd "$APP_DIR"
[ -f .env ] || { echo "No $APP_DIR/.env: run deploy/bootstrap.sh first." >&2; exit 1; }

# Only one deploy at a time (a CI run and someone by hand, say).
exec 9>"$APP_DIR/.deploy.lock"
flock -n 9 || { echo "Another deploy is running." >&2; exit 1; }

echo "==> Fetching $TARGET"
git fetch --quiet --prune origin
previous=$(git rev-parse --short HEAD)
git checkout --quiet --force --detach "$TARGET"
current=$(git rev-parse --short HEAD)
echo "    $previous -> $current"

echo "==> Building images"
docker compose build --pull

echo "==> Starting"
docker compose up -d --remove-orphans

# The domain Caddy serves, from .env (SITE_URL=https://example.com).
site=$(sed -n 's/^SITE_URL=//p' .env | tail -1)
echo "==> Waiting for $site"
i=0
until curl -fsS -o /dev/null --max-time 10 "$site/api/v1/health/ready" \
   && curl -fsS -o /dev/null --max-time 20 "$site/robots.txt"; do
  i=$((i + 1))
  if [ "$i" -ge 60 ]; then
    echo "The site didn't come up within 5 minutes. Recent logs:" >&2
    docker compose ps >&2
    docker compose logs --tail=60 backend frontend caddy >&2
    echo "Roll back with: deploy/deploy.sh $previous" >&2
    exit 1
  fi
  sleep 5
done

docker image prune -f >/dev/null
echo "==> Deployed $current ($site)"
