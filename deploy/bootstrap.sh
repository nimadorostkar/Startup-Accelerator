#!/bin/sh
# One-time setup of a Debian/Ubuntu server for Fundup Club. Safe to run again.
#
#   ssh root@<server> 'sh -s' < deploy/bootstrap.sh fundupclub.com
#
# On a server where another reverse proxy already owns ports 80/443, say where
# that proxy can reach this site (see deploy/docker-compose.behind-proxy.yml):
#
#   ssh root@<server> 'BEHIND_PROXY=172.18.0.1:8081 sh -s' < deploy/bootstrap.sh fundupclub.com
#
# - Docker Engine + Compose plugin (from Docker's own apt repository), if missing
# - with FIREWALL=1: a firewall allowing only SSH, HTTP and HTTPS (left alone by
#   default: on a shared server it would cut off the other sites' ports)
# - swap, if the machine has little memory (building the website needs ~2 GB)
# - the code in /opt/fundup (a clone of the public GitHub repository)
# - /opt/fundup/.env with freshly generated secrets; they never leave the server
# - a nightly database backup, kept for 14 days
#
# It never overwrites an existing .env. Deploys then run deploy/deploy.sh.
set -eu

DOMAIN=${1:?usage: bootstrap.sh <domain>}
REPO=${REPO:-https://github.com/nimadorostkar/Startup-Accelerator.git}
APP_DIR=${APP_DIR:-/opt/fundup}
BEHIND_PROXY=${BEHIND_PROXY:-}
FIREWALL=${FIREWALL:-0}
export DEBIAN_FRONTEND=noninteractive

echo "==> Packages"
apt-get update -qq
apt-get install -y -qq ca-certificates curl git gnupg openssl ufw cron >/dev/null

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Docker"
  . /etc/os-release
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL "https://download.docker.com/linux/$ID/gpg" -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/$ID ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin >/dev/null
  systemctl enable --now docker
fi

if [ "$FIREWALL" = 1 ]; then
  echo "==> Firewall"
  ufw allow OpenSSH >/dev/null
  ufw allow 80/tcp >/dev/null
  ufw allow 443/tcp >/dev/null
  ufw allow 443/udp >/dev/null
  ufw --force enable >/dev/null
fi

mem_mb=$(awk '/MemTotal/ {print int($2 / 1024)}' /proc/meminfo)
if [ "$mem_mb" -lt 4000 ] && [ "$(swapon --noheadings | wc -l)" -eq 0 ]; then
  echo "==> Swap (${mem_mb} MB of memory)"
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Code in $APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone --quiet "$REPO" "$APP_DIR"
fi
chmod +x "$APP_DIR/deploy/"*.sh

if [ ! -f "$APP_DIR/.env" ]; then
  echo "==> $APP_DIR/.env (new secrets)"
  secret() { openssl rand -hex 32; }
  if [ -n "$BEHIND_PROXY" ]; then
    proxy_settings="# Behind the server's other reverse proxy, which terminates HTTPS
# (deploy/docker-compose.behind-proxy.yml).
COMPOSE_FILE=docker-compose.yml:deploy/docker-compose.behind-proxy.yml
SITE_ADDRESS=:80
CADDY_BIND=$BEHIND_PROXY"
  else
    proxy_settings="SITE_ADDRESS=$DOMAIN"
  fi
  umask 077
  cat > "$APP_DIR/.env" <<EOF
# Fundup Club production settings. Created by deploy/bootstrap.sh on $(date -u +%F).
# Every variable is explained in .env.example. Never commit this file.

SITE_URL=https://$DOMAIN
$proxy_settings
COOKIE_SECURE=true

DJANGO_SECRET_KEY=$(secret)
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=
CSRF_TRUSTED_ORIGINS=
SEED_CONTENT=1
API_DOCS_PUBLIC=
WEB_CONCURRENCY=3
WEB_THREADS=4
CELERY_CONCURRENCY=2
LOG_LEVEL=INFO

POSTGRES_DB=fundup
POSTGRES_USER=fundup
POSTGRES_PASSWORD=$(secret)

# Email: until EMAIL_HOST is set, emails (sign-up confirmation, password reset,
# notifications) are only written to the worker's log, not sent.
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=Fundup Club <hello@$DOMAIN>
SUPPORT_EMAILS=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

REVALIDATE_SECRET=$(secret)

SENTRY_DSN=
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.0
EOF
fi

echo "==> Nightly backup"
mkdir -p "$APP_DIR/backups"
cat > /etc/cron.d/fundup-backup <<EOF
# Fundup Club: database dump every night at 02:30, kept for 14 days.
30 2 * * * root cd $APP_DIR && docker compose exec -T db pg_dump -U fundup -Fc fundup > backups/fundup-\$(date +\%F).dump && find backups -name 'fundup-*.dump' -mtime +14 -delete
EOF

echo "==> Ready. Deploy with: $APP_DIR/deploy/deploy.sh"
