from datetime import datetime, timedelta

from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from notifications.models import Notification
from notifications.signals import notify

from business.tasks import project_in_review, project_posted, complete_project, project_approved_email
from generics.tasks import nda_sent_email, nda_signed_freelancer_email, nda_signed_entrepreneur_email


@receiver(pre_save, sender='business.NDA')
def nda_update_event(sender, instance, **kwargs):
    if not hasattr(instance, 'id') or instance.id is None:
        return

    old_status = sender.objects.get(id=instance.id).status
    thread = instance.proposal.message

    if instance.status != old_status and instance.status.lower() == 'sent':
        notify.send(
            instance.sender,
            recipient=instance.receiver,
            verb=u'sent a non-disclosure agreement for',
            action_object=thread,
            target=instance.proposal.project,
            type=u'ndaRequest'
        )
        nda_sent_email.delay(instance.id)

    if instance.status != old_status and instance.status.lower() == 'signed':
        notify.send(
            instance.receiver,
            recipient=instance.sender,
            verb=u'signed a non-disclosure agreement for',
            action_object=thread,
            target=instance.proposal.project,
            type=u'ndaSigned'
        )
        clear_alerts = Notification.objects.filter(action_object_object_id=thread.id, data={"type":"ndaRequest"})
        for alert in clear_alerts:
            alert.unread = False
            alert.save()
        nda_signed_freelancer_email.delay(instance.id)
        nda_signed_entrepreneur_email.delay(instance.id)


@receiver(post_save, sender='business.Project')
def project_post_save(sender, instance, created, **kwargs):
    today = datetime.utcnow()
    if created and instance.sku != 'free':
        complete_project.apply_async((instance.id, ), eta=today + timedelta(days=4))
    if instance.approved and instance.published and not instance.status and not instance.expire_date:
        if instance.sku == 'free' or not instance.sku:
            instance.activate()
        else:
            instance.subscribe()
        project_approved_email.delay(
            instance.id
        )


@receiver(pre_save, sender='business.Project')
def project_pre_save(sender, instance, **kwargs):
    if not hasattr(instance, 'id') or instance.id is None:
        return
    old_project = sender.objects.get(pk=instance.id)
    if not old_project.approved and not old_project.published and instance.published:
        project_in_review.delay(instance.id)
        project_posted.delay(instance.id)
        return