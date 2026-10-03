"""Gunicorn settings. Sized for ~1,000 active users on 2 vCPUs; raise WEB_CONCURRENCY with the CPU count."""

import multiprocessing
import os

bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"
workers = int(os.environ.get("WEB_CONCURRENCY", min(4, multiprocessing.cpu_count() * 2 + 1)))
# Gunicorn 26's control socket (gunicornc) isn't used, and its default home,
# /app/.gunicorn, isn't writable by the app user: it only logged an error.
control_socket_disable = True
worker_class = "gthread"
threads = int(os.environ.get("WEB_THREADS", "4"))
timeout = 30
graceful_timeout = 30
# Longer than Caddy keeps an idle connection to us (30 s, deploy/Caddyfile) and than
# the website's server does (4 s), so we are never the one to close a connection the
# other side is about to send a request on (that request would be lost: a 502).
keepalive = 75
# Recycle workers now and then, so a slow leak can never grow without bound.
max_requests = 2000
max_requests_jitter = 200
accesslog = "-"
errorlog = "-"
access_log_format = '%(h)s "%(r)s" %(s)s %(b)s %(M)sms rid=%({x-request-id}o)s'
forwarded_allow_ips = "*"
