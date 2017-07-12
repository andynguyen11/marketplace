from celery import shared_task

from generics.utils import send_to_emails
from notifications.signals import notify


@shared_task
def invoice_notification_email(template, name, email, invoice_id):
    send_to_emails(
        template,
        emails=[email],
        context={
            'name': name,
            'url': '{0}/invoices/{1}/'.format(settings.BASE_URL, invoice_id)
        }
    )

def invoice_due():
    pass

def invoice_overdue():
    pass