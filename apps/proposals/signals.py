from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from notifications.signals import notify

from proposals.models import Proposal
from proposals.tasks import proposal_received_email, proposal_declined_email


@receiver(post_save, sender=Proposal)
def proposal_received(sender, instance, created, **kwargs):
    if created:
        proposal_received_email.delay(instance.id)
        notify.send(
            instance.submitter,
            recipient=instance.project.project_manager,
            verb=u'submited a proposal for',
            action_object=instance,
            target=instance.project,
            type=u'proposalReceived'
        )

@receiver(pre_save, sender=Proposal)
def proposal_declined(sender, instance, **kwargs):
    if not hasattr(instance, 'id') or instance.id is None:
        return
    old_status = Proposal.objects.get(id=instance.id).status
    if instance.status != old_status and instance.status.lower() == 'declined':
        proposal_declined_email.delay(instance.id)
        notify.send(
            instance.project.project_manager,
            recipient=instance.submitter,
            verb=u'Your proposal was declined',
            target=instance.project
        )