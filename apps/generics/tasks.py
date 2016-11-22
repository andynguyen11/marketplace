from __future__ import absolute_import
from datetime import datetime, timedelta
import pytz
import simplejson

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from celery import shared_task

from accounts.models import Profile
from business.models import Job, Document, Project, Employee
from postman.models import Message
from generics.models import Attachment
from expertratings.models import SkillTestResult
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
        'fname': job.project.contractor.first_name,
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