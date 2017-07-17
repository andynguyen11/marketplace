from celery import shared_task

from generics.utils import send_to_emails
from notifications.signals import notify


@shared_task
def invoice_notification_email(template, name, email, reference_id):
    send_to_emails(
        template,
        emails=[email],
        context={
            'name': name,
            'url': '{0}/invoices/{1}/'.format(settings.BASE_URL, reference_id)
        }
    )

@shared_task
def payment_notification_email(template, name, email, reference_id, amount, net, fee)
    send_to_emails(
        template,
        emails=[email],
        context={
            'name': name,
            'reference_id': reference_id,
            'amount': amount,
            'fee': fee,
            'net': net,
            'url': '{0}/invoices/{1}/'.format(settings.BASE_URL, reference_id)
        }
    )

def invoice_due():
    pass

def invoice_overdue():
    pass