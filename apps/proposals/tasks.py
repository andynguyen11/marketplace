from celery import shared_task

from django.conf import settings
from django.core.urlresolvers import reverse

from accounts.models import Profile
from business.models import Project
from proposals.models import Proposal
from generics.utils import send_mail


@shared_task
def proposal_updated_email(template, proposal_id):
    proposal = Proposal.objects.get(id=proposal_id)
    pm_context = {
        'fname': proposal.project.project_manager.name,
        'project': proposal.project.title
    }
    send_mail(template, [proposal.submitter], pm_context)

@shared_task
def proposal_received_email(proposal_id):
    proposal = Proposal.objects.get(id=proposal_id)
    pm_context = {
        'project': proposal.project.title,
        'url': '{0}{1}'.format(settings.BASE_URL, reverse('view-proposal', kwargs={'proposal_id': proposal_id}))
    }
    send_mail('proposal-received', [proposal.project.project_manager], pm_context)

@shared_task
def proposal_reminder(project_id):
    project = Project.objects.get(id=project_id)
    proposals = Proposal.objects.filter(project__project_manager=project.project_manager, status='pending')
    if proposals:
        send_mail('pending-proposals', [user], context={})