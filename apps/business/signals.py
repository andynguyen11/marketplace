from django.db.models.signals import pre_save
from django.dispatch import receiver
from business.models import Document, Terms
from postman.models import Message
from notifications.signals import notify

from generics.tasks import nda_sent_email, nda_signed_email, terms_sent_email, terms_approved_email

@receiver(pre_save, sender=Document)
def nda_update_event(sender, instance, **kwargs):
    if not hasattr(instance, 'id') or instance.id is None or instance.type != 'NDA':
        return
    old_status = Document.objects.get(id=instance.id).status
    thread = Message.objects.get(nda=instance)
    if instance.status != old_status and instance.status.lower() == 'sent':
        notify.send(thread, recipient=instance.contractor, verb=u'An NDA document signature needed', action_object=thread)
        nda_sent_email.delay(thread.job.id)

    if instance.status != old_status and instance.status.lower() == 'signed':
        notify.send(thread, recipient=instance.manager, verb=u'An NDA document has been signed', action_object=thread)
        nda_signed_email.delay(thread.job.id)

@receiver(pre_save, sender=Terms)
def terms_update_event(sender, instance, **kwargs):
    if not hasattr(instance, 'id') or instance.id is None:
        return
    old_status = Terms.objects.get(id=instance.id).status
    thread = Message.objects.get(terms=instance)
    if instance.status != old_status and instance.status.lower() == 'sent':
        notify.send(thread, recipient=instance.job.contractor, verb=u'There are contract terms to preview and approve', action_object=thread)
        terms_sent_email.delay(thread.job.id)

    if instance.status != old_status and instance.status.lower() == 'agreed':
        notify.send(thread, recipient=instance.job.project.project_manager, verb=u'Contract terms have been agreed', action_object=thread)
        terms_approved_email.delay(thread.job.id)