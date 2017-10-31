from datetime import datetime, timedelta

from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from notifications.models import Notification
from notifications.signals import notify

from accounts.models import Profile
from business.models import Project, NDA
from business.tasks import project_in_review, project_posted, post_a_project, complete_project, project_approved_email
from generics.tasks import nda_sent_email, nda_signed_freelancer_email, nda_signed_entrepreneur_email, account_confirmation, add_work_examples, add_work_history

from postman.models import Message


@receiver(pre_save, sender=NDA)
def nda_update_event(sender, instance, **kwargs):
    if not hasattr(instance, 'id') or instance.id is None:
        return

    old_status = NDA.objects.get(id=instance.id).status
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


@receiver(pre_save, sender=Project)
def new_project_posted(sender, instance, **kwargs):
    if not hasattr(instance, 'id') or instance.id is None:
        return
    old_project = Project.objects.get(pk=instance.id)
    if not old_project.approved and not old_project.published and instance.published:
        project_in_review.delay(instance.id)
        project_posted.delay(instance.id)


@receiver(post_save, sender=Project)
def project_saved(sender, instance, created, **kwargs):
    if created and instance.sku != 'free':
        today = datetime.utcnow()
        complete_project.apply_async((instance.id, ), eta=today + timedelta(days=4))


@receiver(pre_save, sender=Profile)
def new_account(sender, instance, **kwargs):
    if not hasattr(instance, 'id') or instance.id is None:
        return
    old_profile = Profile.objects.get(pk=instance.id)

    if not old_profile.tos and instance.tos and instance.email_confirmed:
        if not instance.work_examples:
            today = datetime.utcnow()
            add_work_examples.apply_async((instance.id, ), eta=today + timedelta(days=7))


@receiver(pre_save, sender=Project)
def project_approved(sender, instance, **kwargs):
    if not hasattr(instance, 'id') or instance.id is None:
        return
    old_project = Project.objects.get(pk=instance.id)
    # if sku free - activate but not subscribe
    # if sku paid - activate and subscribe
    if not old_project.approved and instance.approved:
        project_approved_email.delay(
            instance.id
        )