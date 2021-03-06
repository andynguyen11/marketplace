import stripe
import uuid

from django.db import models
from django.db.models.signals import pre_save
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.postgres.fields import JSONField
from django.dispatch import receiver
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from payment.helpers import stripe_helpers
from payment.enums import EU_ISO
from payment.tasks import invoice_notification_email, payment_notification_email


class Invoice(models.Model):
    reference_id = models.UUIDField(default=uuid.uuid4, editable=False)
    sender = models.ForeignKey('accounts.Profile', related_name='invoice_sender')
    recipient = models.ForeignKey('accounts.Profile', related_name='invoice_recipient')
    date_created = models.DateTimeField(auto_now_add=True)
    date_paid = models.DateTimeField(blank=True, null=True)
    sent_date = models.DateField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=100, default='draft')
    title = models.CharField(max_length=255, blank=True, null=True)
    logo = models.ImageField(blank=True, null=True, upload_to='invoice/logo')
    sender_name = models.CharField(max_length=255, blank=True, null=True)
    sender_email = models.CharField(max_length=255, blank=True, null=True)
    sender_phone = models.CharField(max_length=255, blank=True, null=True)
    sender_address = models.CharField(max_length=255, blank=True, null=True)
    sender_address2 = models.CharField(max_length=255, blank=True, null=True)
    sender_location = models.CharField(max_length=255, blank=True, null=True)
    recipient_name = models.CharField(max_length=255, blank=True, null=True)
    recipient_email = models.CharField(max_length=255, blank=True, null=True)
    recipient_phone = models.CharField(max_length=255, blank=True, null=True)
    recipient_address = models.CharField(max_length=255, blank=True, null=True)
    recipient_address2 = models.CharField(max_length=255, blank=True, null=True)
    recipient_location = models.CharField(max_length=255, blank=True, null=True)
    viewed = models.BooleanField(default=False)

    class Meta:
        ordering = ['-sent_date']

    @property
    def total_amount(self):
        """
        :return: Invoice total
        """
        total = 0
        for item in self.invoice_items.all():
            total += item.amount
        return total

    @property
    def loom_fee(self):
        """
        :return: Invoice Loom fee
        """
        fee = round((float(self.total_amount) * settings.LOOM_FEE), 2)
        return fee

    def application_fee(self, card_country='US'):
        """
        :return: Invoice app fee
        """
        rate = .029
        connect = stripe.Account.retrieve(self.sender.stripe_connect)
        #TODO Refactor with fee map
        if connect.country == 'GB' and card_country in EU_ISO:
            rate = .014
        stripe_fee = (float(self.total_amount) * rate) + .30
        application_fee = round((self.loom_fee - stripe_fee), 2)
        return application_fee


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='invoice_items')
    description = models.CharField(max_length=255, blank=True, null=True)
    hours = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    rate = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2)





# TODO figure out why if this lives in it's own payments/signals.py file it doesn't ever fire
# Circular import?
@receiver(pre_save, sender=Invoice)
def invoice_notifications(sender, instance, **kwargs):
    if not hasattr(instance, 'id') or instance.id is None:
        return

    old_instance = Invoice.objects.get(id=instance.id)

    # Invoice sent
    if old_instance.status == 'draft' and instance.status == 'sent':
        invoice_notification_email.delay('invoice-received', instance.sender_name, instance.recipient_email, instance.reference_id)

    # Invoice viewed
    if not old_instance.viewed and instance.viewed:
        invoice_notification_email.delay('invoice-viewed', instance.recipient_name, instance.sender_email, instance.reference_id)

    # Invoice updated
    if old_instance.status == 'sent' and instance.status == 'sent' and instance.viewed and old_instance.viewed:
        invoice_notification_email.delay('invoice-updated', instance.sender_name, instance.recipient_email, instance.reference_id)

    # Invoice paid
    if old_instance.status == 'sent' and instance.status == 'paid':
        invoice_net = round((float(instance.total_amount)-instance.loom_fee), 2)
        payment_notification_email.delay('payment-sent', instance.sender_name, instance.recipient_email, instance.reference_id, '{0:.2f}'.format(instance.total_amount), '{0:.2f}'.format(invoice_net), '{0:.2f}'.format(instance.loom_fee))
        paid_invoices =  Invoice.objects.filter(sender=instance.sender, status='paid')
        number_of_invoices = len(paid_invoices)
        if number_of_invoices == 0:
            payment_notification_email.delay('first-payment-received', instance.recipient_name, instance.sender_email, instance.reference_id, '{0:.2f}'.format(instance.total_amount), '{0:.2f}'.format(invoice_net), '{0:.2f}'.format(instance.loom_fee))
        elif number_of_invoices > 0:
            payment_notification_email.delay('payment-received', instance.recipient_name, instance.sender_email, instance.reference_id, '{0:.2f}'.format(instance.total_amount), '{0:.2f}'.format(invoice_net), '{0:.2f}'.format(instance.loom_fee))