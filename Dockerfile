# syntax=docker/dockerfile:1.7
# Fundup Club website (Next.js). Talks to the API over the private network (BACKEND_URL).

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Inlined into the build (links, previews, Google redirect URL), so it's a build argument.
ARG NEXT_PUBLIC_SITE_URL=http://localhost
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Pages read the API at request time, so the build never needs it.
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    KEEP_ALIVE_TIMEOUT=75000
# KEEP_ALIVE_TIMEOUT (ms): how long the server keeps an idle connection. Node's 5 s
# default is shorter than Caddy's (30 s, deploy/Caddyfile), so Caddy would now and then
# send a request just as the connection closed and answer 502; a form post isn't retried.
RUN addgroup -S -g 10001 app && adduser -S -u 10001 -G app app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
COPY --from=build --chown=app:app /app/scripts/start.mjs ./start.mjs
USER app
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=120s --retries=5 \
    CMD wget -q -O /dev/null http://127.0.0.1:3000/robots.txt || exit 1
# Waits (up to 90 s) for the API, then runs Next's server.js.
CMD ["node", "start.mjs"]
