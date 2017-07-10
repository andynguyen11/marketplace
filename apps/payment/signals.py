from django.db.models.signals import pre_save, post_save
from django.dispatch import Signal, receiver

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

webhook_processing_error = Signal(providing_args=["data", "exception"])

WEBHOOK_SIGNALS = dict([
    (hook, Signal(providing_args=["event"]))
    for hook in [
        "account.application.deauthorized",
        "account.updated",
        "charge.dispute.closed",
        "charge.dispute.created",
        "charge.dispute.updated",
        "charge.failed",
        "charge.refunded",
        "charge.succeeded",
        "coupon.created",
        "coupon.deleted",
        "coupon.updated",
        "customer.created",
        "customer.deleted",
        "customer.discount.created",
        "customer.discount.deleted",
        "customer.discount.updated",
        "customer.subscription.created",
        "customer.subscription.deleted",
        "customer.subscription.trial_will_end",
        "customer.subscription.updated",
        "customer.updated",
        "invoice.created",
        "invoice.payment_failed",
        "invoice.payment_succeeded",
        "invoice.updated",
        "invoiceitem.created",
        "invoiceitem.deleted",
        "invoiceitem.updated",
        "ping",
        "plan.created",
        "plan.deleted",
        "plan.updated",
        "transfer.created",
        "transfer.failed",
        "transfer.updated",
    ]
])