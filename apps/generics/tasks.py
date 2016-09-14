from __future__ import absolute_import

from celery import shared_task
from generics.utils import send_mail


@shared_task
def account_confirmation(user, role=None):
    email_template = 'welcome-developer' if role else 'welcome-entrepreneur'
    send_mail(email_template, [user], {
        'fname': user.first_name,
        'email': job.user.email
    })