from __future__ import absolute_import

from celery import shared_task

from accounts.models import Profile
from postman.models import Message
from generics.utils import send_mail


@shared_task
def account_confirmation(user_id, role=None):
    user = Profile.objects.get(id=user_id)
    email_template = 'welcome-developer' if role else 'welcome-entrepreneur'
    send_mail(email_template, [user], {
        'fname': user.first_name,
        'email': user.email
    })


@shared_task
def new_message_notification(user_id, thread_id):
    unread_messages = Message.objects.filter(
        recipient = user_id,
        thread=thread_id,
        read_at__isnull=True
    ).order_by('-read_at')