from celery import shared_task

from . import services


@shared_task
def send_event_reminders() -> int:
    """Hourly: the day-before reminder for upcoming events."""
    return services.send_reminders()
