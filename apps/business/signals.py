from django.db.models.signals import pre_save
from django.dispatch import receiver
from business.models import Document
from notifications.signals import notify

@receiver(pre_save, sender=Document)
def signature_event(sender, instance, **kwargs):
    if not hasattr(instance, 'id') or instance.id is None:
        return
    old_status = Document.objects.get(id=instance.id).status
    if instance.status != old_status and instance.status.lower() == 'sent':
        recipient = instance.signers[0] if(instance.signers and len(instance.signers)) else instance.contractor
        notify.send(instance.manager, recipient=recipient, verb=u'have a document signature needed', action_object=instance)

    if instance.status != old_status and instance.status.lower() == 'signed':
        signer = instance.signers[0] if(instance.signers and len(instance.signers)) else instance.contractor
        notify.send(signer, recipient=instance.manager, verb=u'have a signed document', action_object=instance)


