"""Gunicorn settings. Sized for ~1,000 active users on 2 vCPUs; raise WEB_CONCURRENCY with the CPU count."""

import multiprocessing
import os

bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"
workers = int(os.environ.get("WEB_CONCURRENCY", min(4, multiprocessing.cpu_count() * 2 + 1)))
worker_class = "gthread"
threads = int(os.environ.get("WEB_THREADS", "4"))
timeout = 30
graceful_timeout = 30
keepalive = 5
# Recycle workers now and then, so a slow leak can never grow without bound.
max_requests = 2000
max_requests_jitter = 200
accesslog = "-"
errorlog = "-"
access_log_format = '%(h)s "%(r)s" %(s)s %(b)s %(M)sms rid=%({x-request-id}o)s'
forwarded_allow_ips = "*"
