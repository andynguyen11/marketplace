from __future__ import absolute_import
from datetime import datetime, timedelta
import pytz
import simplejson

from celery import shared_task
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.core.urlresolvers import reverse
from django.utils.http import urlencode
from rest_framework.exceptions import ValidationError, PermissionDenied

from accounts.models import Profile
from business.models import Job, Document, Project, Employee
from expertratings.models import SkillTestResult
from generics.models import Attachment
from generics.utils import send_mail, send_to_emails, sign_data, parse_signature
#from payment.models import ProductOrder
from postman.models import Message


utc=pytz.UTC

def generate_confirmation_signature(user, instance, field):
    return sign_data(user_id=user.id, id=instance.id, field=field, value=getattr(instance, field))

def validate_confirmation_signature(instance, signature, confirm_on_success='%s_confirmed'):
    """
    validates tokens generated with generate_confirmation_signature.
    sets '%(field)s_confirmed' = True by default, can be disabled with confirm_on_success=False
    """
    token_data = parse_signature(signature)
    if(token_data['id'] != instance.id):
        raise PermissionDenied(detail='signature used on incorrect instance')
    if(token_data['value'] != getattr(instance, token_data['field'])):
        raise ValidationError(detail={'signature': ['instance field value no longer matches signed field value']})
    if(confirm_on_success):
        setattr(instance, confirm_on_success % token_data['field'], True)
        instance.save()
    return token_data


def absolute_url(url, query):
    base_url = settings.BASE_URL if settings.BASE_URL.startswith('http') else (
            ('http://' if settings.DEBUG else 'https://') + settings.BASE_URL)
    return '%s%s?%s' % (base_url, url, urlencode(query))

def generate_confirmation_url(user, instance, field,
        base_name=None, reverse_pattern='api:%s-confirm-email', **kwargs):
    if not base_name:
        base_name = instance._meta.model_name
    kwargs['signature'] = generate_confirmation_signature(user, instance, field=field)
    url = reverse(reverse_pattern % base_name, args=(instance.id,))
    return absolute_url(url, kwargs)

@shared_task
def account_confirmation(user_id, role=None):
    user = Profile.objects.get(id=user_id)
    email_template = 'welcome-developer' if role else 'welcome-entrepreneur'
    send_mail(email_template, [user], {
        'fname': user.first_name,
        'email': user.email
    })

@shared_task
def email_confirmation(user, instance=None, email_field='email', template='verify-email'):
    if not instance:
        instance = user
    send_to_emails(template, email=getattr(instance, email_field), context={
        'fname': user.first_name,
        'url': generate_confirmation_url(user, instance, field=email_field)
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
def pm_contact_card_email(job_id):
    job = Job.objects.get(id=job_id)
    document = Document.objects.get(job=job, type='MSA')
    pm_context = {
        'fname': job.contractor.first_name,
        'lname': job.contractor.last_name,
        'email': job.contractor.email,
        'document': document.docusign_document.id,
        'project': job.project.title,
    }
    pm_context['phone'] = job.contractor.phone if job.contractor.phone else ''
    pm_context['role'] = job.contractor.role if job.contractor.role else ''
    send_mail('new-contract-entrepreneur', [job.project.project_manager], pm_context)

@shared_task
def dev_contact_card_email(job_id):
    job = Job.objects.get(id=job_id)
    document = Document.objects.get(job=job, type='MSA')
    dev_context = {
        'fname': job.project.project_manager.first_name,
        'lname': job.project.project_manager.last_name,
        'email': job.project.project_manager.email,
        'document': document.docusign_document.id,
        'project': job.project.title,
    }
    dev_context['phone'] = job.project.project_manager.phone if job.project.project_manager.phone else ''
    dev_context['title'] = job.project.project_manager.title if job.project.project_manager.title else ''
    dev_context['company'] = job.project.company.name if job.project.company else ''
    send_mail('new-contract', [job.contractor], dev_context)

@shared_task
def nda_sent_email(job_id):
    job = Job.objects.get(id=job_id)
    thread = Message.objects.get(job=job)
    merge_vars = {
        'fname': job.project.project_manager.first_name,
        'project': job.project.title,
        'email': job.contractor.email,
        'thread': thread.id,
    }
    send_mail('nda-sent', [job.contractor], merge_vars)

@shared_task
def nda_signed_entrepreneur_email(job_id):
    job = Job.objects.get(id=job_id)
    merge_vars = {
        'fname': job.contractor.first_name,
        'project': job.project.title,
        'email': job.project.project_manager.email,
    }
    send_mail('nda-signed-entrepreneur', [job.project.project_manager], merge_vars)

@shared_task
def nda_signed_freelancer_email(job_id):
    job = Job.objects.get(id=job_id)
    merge_vars = {
        'fname': job.project.project_manager.first_name,
        'project': job.project.title,
        'email': job.contractor.email,
    }
    send_mail('nda-signed-freelancer', [job.contractor], merge_vars)

@shared_task
def terms_sent_email(job_id):
    job = Job.objects.get(id=job_id)
    thread = Message.objects.get(job=job)
    send_mail('bid-accepted', [job.contractor], {
        'entrepreneur': job.project.project_manager.first_name,
        'developername': job.contractor.first_name,
        'projectname': job.project.title,
        'developertype': job.contractor.role.capitalize(),
        'cash': job.cash if job.cash else 0,
        'equity': simplejson.dumps(job.equity) if job.equity else 0,
        'hours': job.hours,
        'email': job.contractor.email,
        'thread': thread.id,
    })

@shared_task
def terms_approved_email(job_id):
    job = Job.objects.get(id=job_id)
    thread = Message.objects.get(job=job)
    merge_vars = {
        'fname': job.contractor.first_name,
        'project': job.project.title,
        'email': job.project.project_manager.email,
        'thread': thread.id,
    }
    send_mail('terms-approved', [job.project.project_manager], merge_vars)


@shared_task
def project_in_review(project_id):
    project = Project.objects.get(id=project_id)
    send_mail('project-in-review', [project.project_manager], {})


@shared_task
def project_posted(project_id):
    project = Project.objects.get(id=project_id)
    admin = Profile.objects.get(username='admin')
    send_mail('project-posted', [admin], {
        'project': project.title,
        'date': simplejson.dumps(datetime.now().isoformat()),
        'entrepreneur': project.project_manager.name,
        'email': project.project_manager.email,
        'url': '{0}/project/{1}/'.format(settings.BASE_URL, project.slug),
    })


@shared_task
def add_work_examples(profile_id):
    examples = Attachment.objects.filter(
                content_type= ContentType.objects.get_for_model(Profile),
                object_id=profile_id
            )
    if not examples:
        profile = Profile.objects.get(id=profile_id)
        send_mail('add-work-examples', [profile], {})


@shared_task
def add_work_history(profile_id):
    history = Employee.objects.filter(profile=profile_id)
    if not history:
        profile = Profile.objects.get(id=profile_id)
        send_mail('add-work-history', [profile], {})


@shared_task
def verify_skills(profile_id):
    results = SkillTestResult.objects.filter(user=profile_id)
    if not results:
        profile = Profile.objects.get(id=profile_id)
        send_mail('verify-skills', [profile], {})


@shared_task
def post_a_project(profile_id):
    user = Profile.objects.get(id=profile_id)
    project = Project.objects.filter(project_manager=user)
    if not len(project):
        send_mail('post-a-project', [user], {})


@shared_task
def complete_project(project_id):
    project = Project.objects.get(id=project_id)
    if not project.published and not project.deleted:
        send_mail('complete-project', [project.project_manager], {
            'url': '{0}/project/{1}/'.format(settings.BASE_URL, project.slug),
        })

@shared_task
def connection_request_to_freelancer(entrepreneur_id, thread_id):
    entrepreneur = Profile.objects.get(id=entrepreneur_id)
    send_mail('connection-request-freelancer', [freelancer], {
        'fname': freelancer.first_name,
        'thread_id': thread_id,
    })

@shared_task
def connection_request_to_entrepreneur(freelancer_id, thread_id):
    freelancer = Profile.objects.get(id=freelancer_id)
    send_mail('connection-request-entrepreneur', [freelancer], {
        'fname': freelancer.first_name,
        'thread_id': thread_id,
    })

@shared_task
def connection_made_freelancer(entrepreneur_id, thread_id):
    entrepreneur = Profile.objects.get(id=entrepreneur_id)
    send_mail('connection-made-freelancer', [entrepreneur], {
        'fname': entrepreneur.first_name,
        'thread_id': thread_id,
    })

@shared_task
def connection_made_entrepreneur(freelancer_id, thread_id, order_id):
    freelancer = Profile.objects.get(id=freelancer_id)
#    order = ProductOrder.objects.get(id=order_id)
    send_mail('connection-made-entrepreneur', [freelancer], {
        'fname': freelancer.first_name,
        'thread_id': thread_id,
#        'date': order.date_charged,
#        'order_id': order.id,
#        'connection_fee': order.price,
#        'total': order.price,
        'full_name': '{0} {1}'.format(freelancer.first_name, freelancer.last_name)
    })
