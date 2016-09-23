from __future__ import absolute_import
from datetime import datetime, timedelta
import pytz

from celery import shared_task

from accounts.models import Profile
from postman.models import Message
from generics.utils import send_mail

utc=pytz.UTC

@shared_task
def account_confirmation(user_id, role=None):
    user = Profile.objects.get(id=user_id)
    email_template = 'welcome-developer' if role else 'welcome-entrepreneur'
    send_mail(email_template, [user], {
        'fname': user.first_name,
        'email': user.email
    })


@shared_task
def new_message_notification(recipient_id, thread_id):
    recipient = Profile.objects.get(id=recipient_id)
    unread_messages = Message.objects.filter(
        recipient = recipient_id,
        thread = thread_id,
        read_at__isnull = True
    ).order_by('-sent_at')
    thread = Message.objects.get(
        id = thread_id
    )
    email_threshold = datetime.now() - timedelta(hours=6)
    last_emailed = thread.last_emailed_bidder if recipient_id == thread.job.contractor.id else thread.last_emailed_owner
    last_emailed = last_emailed if last_emailed else utc.localize(datetime.now() - timedelta(hours=7))
    if unread_messages.count() >= 1 and last_emailed < utc.localize(email_threshold):
        send_mail('message-received', [recipient], {
            'projectname': thread.job.project.title,
            'email': recipient.email
        })
        if recipient_id == thread.job.contractor.id:
            thread.last_emailed_bidder = datetime.now()
        else:
            thread.last_emailed_owner = datetime.now()
        thread.save()

@shared_task
def contact_card_email(job, d):
    users = [job.project.project_manager, job.contractor]
    context = {
        'fname': job.contractor.first_name,
        'lname': job.contractor.last_name,
        'email': job.contractor.email,
    }
    send_mail('new_contact', users, context)