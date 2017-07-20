from celery import shared_task
from django.conf import settings
from django.core.urlresolvers import reverse
from django.utils.http import urlencode

from accounts.models import Profile
from business.models import Document
from generics.utils import send_mail, send_to_emails, sign_data, create_auth_token
from market.celery import app as celery_app


def generate_confirmation_signature(user, instance, field):
    return sign_data(user_id=user.id, id=instance.id, field=field, value=getattr(instance, field))

def absolute_url(url, query):
    base_url = settings.BASE_URL if settings.BASE_URL.startswith('http') else (
            ('http://' if settings.DEBUG else 'https://') + settings.BASE_URL)
    return '%s%s?%s' % (base_url, url, urlencode(query))

def generate_confirmation_url(user, instance, field,
        base_name=None, reverse_pattern='api:%s-confirm-email', **kwargs):
    if not base_name:
        base_name = instance._meta.model_name
    kwargs['signature'] = generate_confirmation_signature(user, instance, field=field)
    kwargs['token'] = create_auth_token(user)
    url = reverse(reverse_pattern % base_name, args=(instance.id,))
    return absolute_url(url, kwargs)

@shared_task
def connection_request(this_id, that_id, thread_id, template):
    this_user = Profile.objects.get(id=this_id)
    that_user = Profile.objects.get(id=that_id)
    send_mail(template, [this_user], {
        'fname': that_user.first_name,
        'thread_id': thread_id,
    })

@shared_task
def connection_made(this_id, that_id, thread_id, order_context=None):
    template = 'connection-made-freelancer'
    this_user = Profile.objects.get(id=this_id)
    that_user = Profile.objects.get(id=that_id)
    context = {
        'fname': that_user.first_name,
        'thread_id': thread_id,
    }
    if order_context:
        context.update(order_context)
        template = 'connection-made-entrepreneur'
    send_mail(template, [this_user], context)

@shared_task
def send_email_confirmation(template, email, context):
    send_to_emails(template, emails=[email], context=context)

def email_confirmation(user, instance=None, email_field='email', template='verify-email'):
    if not instance:
        instance = user
    send_email_confirmation.delay(template, email=getattr(instance, email_field), context={
        'fname': user.first_name,
        'url': generate_confirmation_url(user, instance, field=email_field)
    })

@shared_task
def password_updated(user_id):
    user = Profile.objects.get(id=user_id)
    send_mail('password-updated', [user], context={})

@celery_app.task
def freelancer_project_matching():
    pass

