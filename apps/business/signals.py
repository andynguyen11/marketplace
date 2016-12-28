from datetime import datetime, timedelta

from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from notifications.models import Notification
from notifications.signals import notify

from accounts.models import Profile
from business.models import Document, Terms, Project
from generics.tasks import nda_sent_email, nda_signed_freelancer_email, nda_signed_entrepreneur_email, terms_sent_email,\
    terms_approved_email, project_in_review, project_posted, account_confirmation, add_work_examples, add_work_history, verify_skills,\
    post_a_project, complete_project
from postman.models import Message


@receiver(pre_save, sender=Document)
def nda_update_event(sender, instance, **kwargs):
    if not hasattr(instance, 'id') or instance.id is None or instance.type != 'NDA':
        return
    old_status = Document.objects.get(id=instance.id).status
    thread = Message.objects.get(nda=instance)
    if instance.status != old_status and instance.status.lower() == 'sent':
        notify.send(
            instance.manager,
            recipient=instance.contractor,
            verb=u'sent a non-disclosure agreement for',
            action_object=thread,
            target=instance.job.project,
            type=u'ndaRequest'
        )
        nda_sent_email.delay(thread.job.id)

    if instance.status != old_status and instance.status.lower() == 'signed':
        notify.send(
            instance.contractor,
            recipient=instance.manager,
            verb=u'signed a non-disclosure agreement for',
            action_object=thread,
            target=instance.job.project,
            type=u'ndaSigned'
        )
        clear_alerts = Notification.objects.filter(action_object_object_id=thread.id, data={"type":"ndaRequest"})
        for alert in clear_alerts:
            alert.unread = False
            alert.save()
        nda_signed_freelancer_email.delay(thread.job.id)
        nda_signed_entrepreneur_email.delay(thread.job.id)

@receiver(pre_save, sender=Terms)
def terms_update_event(sender, instance, **kwargs):
    if not hasattr(instance, 'id') or instance.id is None:
        return
    old_status = Terms.objects.get(id=instance.id).status
    thread = Message.objects.get(terms=instance)
    if instance.status != old_status and instance.status.lower() == 'sent':
        notify.send(
            instance.job.project.project_manager,
            recipient=instance.job.contractor,
            verb=u'sent contract terms to preview and approve for',
            action_object=thread,
            target=instance.job.project
        )
        terms_sent_email.delay(thread.job.id)

    if instance.status != old_status and instance.status.lower() == 'agreed':
        notify.send(
            instance.job.contractor,
            recipient=instance.job.project.project_manager,
            verb=u'agreed to contract terms for',
            action_object=thread,
            target=instance.job.project
        )
        terms_approved_email.delay(thread.job.id)

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
    if created:
        today = datetime.utcnow()
        complete_project.apply_async((instance.id, ), eta=today + timedelta(days=2))


@receiver(pre_save, sender=Profile)
def new_account(sender, instance, **kwargs):
    if not hasattr(instance, 'id') or instance.id is None:
        return
    old_profile = Profile.objects.get(pk=instance.id)

    if not old_profile.country and instance.country:
        account_confirmation.delay(
                instance.id,
                instance.role
            )

        if instance.role:
            today = datetime.utcnow()
            add_work_examples.apply_async((instance.id, ), eta=today + timedelta(days=1))
            add_work_history.apply_async((instance.id, ), eta=today + timedelta(days=2))
            verify_skills.apply_async((instance.id, ), eta=today + timedelta(days=3))
        else:
            today = datetime.utcnow()
            post_a_project.apply_async((instance.id, ), eta=today + timedelta(days=5))
