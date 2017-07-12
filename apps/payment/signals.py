from django.db.models.signals import pre_save, post_save
from django.dispatch import Signal, receiver

from payment.models import Invoice
from payment.tasks import invoice_notification_email


def field_changed(instance, field, id_field='id'):
    try:
        return (not (hasattr(instance, id_field) and getattr(instance, id_field))) or (getattr(instance, field) != getattr(type(instance).objects.get(**{id_field: getattr(instance,id_field)}), field))
    except type(instance).DoesNotExist:
        return False

@receiver(post_save, sender='payment.Invoice')
def invoice_notifications(sender, instance, created, **kwargs):
    old_instance = Invoice.objects.get(id=instance.id)
    if created and instance.status == 'sent':
        invoice_notification_email('invoice-received', instance.sender_name, instance.recipient_email, instance.id)

    if old_instance.status == 'draft' and instance.status == 'sent':
        invoice_notification_email('invoice-received', instance.sender_name, instance.recipient_email, instance.id)

    if not old_instance.viewed and instance.viewed:
        invoice_notification_email('invoice-read', instance.recipient_name, instance.sender_email, instance.id)

    if old_instance.status == 'sent' and instance.status == 'sent':
        invoice_notification_email('invoice-updated', instance.sender_name, instance.recipient_email, instance.id)