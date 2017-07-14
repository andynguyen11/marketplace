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

    # Invoice sent
    if created and instance.status == 'sent':
        return invoice_notification_email('invoice-received', instance.sender_name, instance.recipient_email, instance.id)

    # Invoice sent
    if old_instance.status == 'draft' and instance.status == 'sent':
        return invoice_notification_email('invoice-received', instance.sender_name, instance.recipient_email, instance.id)

    # Invoice viewed
    if not old_instance.viewed and instance.viewed:
        return invoice_notification_email('invoice-read', instance.recipient_name, instance.sender_email, instance.id)

    # Invoice updated
    if old_instance.status == 'sent' and instance.status == 'sent':
        return invoice_notification_email('invoice-updated', instance.sender_name, instance.recipient_email, instance.id)

    # Invoice paid
    if old_instance.status == 'sent' and instance.status == 'paid':
        invoice_notification_email('payment-sent', instance.sender_name, instance.recipient_email, instance.id)
        paid_invoices =  Invoice.objects.filter(sender=instance.sender, status='paid')
        number_of_invoices = len(paid_invoices)
        if number_of_invoices == 1:
            return invoice_notification_email('first-payment-received', instance.recipient_name, instance.sender_email, instance.id)
        else if number_of_invoices > 1:
            return invoice_notification_email('payment-received', instance.recipient_name, instance.sender_email, instance.id)