from celery import shared_task

from accounts.models import Profile
from business.models import Job, Document
from generics.utils import send_mail


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