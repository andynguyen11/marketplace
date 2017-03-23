from celery import shared_task

from django.conf import settings

from proposals.models import Proposal
from generics.utils import send_mail


@shared_task
def proposal_declined_email(proposal_id):
    proposal = Proposal.objects.get(id=proposal_id)
    pm_context = {
        'entrepreneur_first_name': proposal.project.project_manager.first_name,
        'project': proposal.project.title
    }
    send_mail('proposal-declined', [proposal.submitter], pm_context)

@shared_task
def proposal_received_email(proposal_id):
    proposal = Proposal.objects.get(id=proposal_id)
    pm_context = {
        'project': proposal.project.title,
        'url': '{0}/{1}'.format(settings.BASE_URL, reverse('view-proposal', kwargs={'proposal_id': proposal_id}))
    }
    send_mail('proposal-received', [proposal.project.project_manager], pm_context)