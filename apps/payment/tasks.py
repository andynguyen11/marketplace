from celery import shared_task
from django.conf import settings

from generics.utils import send_to_emails


@shared_task
def invoice_notification_email(template, name, email, reference_id):
    return send_to_emails(
        template,
        emails=[email],
        context={
            'name': name,
            'url': '{0}/invoices/{1}/'.format(settings.BASE_URL, reference_id)
        }
    )

@shared_task
def payment_notification_email(template, name, email, reference_id, amount, net, fee):
    return send_to_emails(
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