from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from proposal.models import Proposal
from proposal.tasks import proposal_received_email, proposal_declined_email


@receiver(post_save, sender=Proposal)
def proposal_received(sender, instance, created, **kwargs):
    if created:
        proposal_received_email.delay(instance.id)
        notify.send(
            instance.submitter,
            recipient=instance.project.project_manager,
            verb=u'sent you a proposal for',
            action_object=instance.message,
            target=instance.project
        )

@receiver(pre_save, sender=Proposal)
def proposal_declined(sender, instance, **kwargs):
    old_status = Proposal.objects.get(id=instance.id).status
    if instance.status != old_status and instance.status.lower() == 'declined':
        proposal_declined_email.delay(instance.id)
        notify.send(
            recipient=instance.submitter,
            verb=u'Your proposal was declined',
            target=instance.project
        )