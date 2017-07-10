import json
import uuid
import traceback
from datetime import datetime, date
from decimal import Decimal

import six
from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.postgres.fields import JSONField
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from business.products import products, ProductType, PRODUCT_CHOICES
from generics.utils import percentage
from payment.helpers import stripe_helpers
from payment.enums import *
from payment.signals import webhook_processing_error, WEBHOOK_SIGNALS


class Promo(models.Model):
    code = models.CharField(max_length=15)
    expire_date = models.DateField()
    dollars_off = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    percent_off = models.IntegerField(blank=True, null=True)
    single_use = models.BooleanField(default=False)
    used = models.BooleanField(default=False)
    customers = models.ManyToManyField('accounts.Profile', blank=True)

    @property
    def value_off(self):
        return str(self.percent_off) + '%' if self.percent_off else '$' + str(self.dollars_off)

    def __str__(self):
        return self.code

    def is_valid_for(self, user):
        return (not user in self.customers.all()) and not (self.single_use and self.used)

    def not_expired(self):
        return self.expire_date >= date.today()

    def is_valid(self, user):
        if not self.is_valid_for(user):
            raise ValidationError({"promo": ["This promo code has already been used."]})
        if not self.not_expired():
            raise ValidationError({"promo": ["This promo code has expired."]})
        return True

    def mark_used_by(self, user):
        if self.is_valid_for(user):
            if self.single_use:
                self.used = True
            self.customers.add(user)
            self.save()
            return True
        else:
            return False

    def apply_to(self, amount):
        amount = Decimal(amount)
        if self.dollars_off:
            amount = amount - self.dollars_off
        elif self.percent_off:
            amount = percentage(base=amount, percent=self.percent_off, operation='removed')
        return amount if amount > 0 else 0.00


def get_promo(code):
    try:
        return Promo.objects.get(code=code)
    except Promo.DoesNotExist:
        return None


class Invoice(models.Model):
    reference_id = models.UUIDField(default=uuid.uuid4, editable=False)
    sender = models.ForeignKey('accounts.Profile', related_name='invoice_sender')
    recipient = models.ForeignKey('accounts.Profile', related_name='invoice_recipient')
    date_created = models.DateTimeField(auto_now_add=True)
    sent_date = models.DateField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=100, default='pending')
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


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='invoice_items')
    description = models.CharField(max_length=255)
    hours = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    rate = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2)

    def save(self, *args, **kwargs):
        if self.hours and self.rate and not self.amount:
            self.amount = self.hours * self.rate
        super(InvoiceItem, self).save(*args, **kwargs)


class StripeObject(models.Model):
    stripe_id = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:  # pylint: disable=E0012,C1001
        abstract = True


class EventProcessingException(models.Model):
    event = models.ForeignKey("Event", null=True)
    data = models.TextField()
    message = models.CharField(max_length=500)
    traceback = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    @classmethod
    def log(cls, data, exception, event):
        cls.objects.create(
            event=event,
            data=data or "",
            message=str(exception),
            traceback=traceback.format_exc()
        )

    def __unicode__(self):
        return six.u("<{}, pk={}, Event={}>").format(self.message, self.pk, self.event)


class Event(StripeObject):
    kind = models.CharField(max_length=250)
    livemode = models.BooleanField(default=False)
    #customer = models.ForeignKey("Customer", null=True)
    webhook_message = JSONField()
    validated_message = JSONField(null=True)
    valid = models.NullBooleanField(null=True)
    processed = models.BooleanField(default=False)

    @property
    def message(self):
        return self.validated_message

    def __unicode__(self):
        return "%s - %s" % (self.kind, self.stripe_id)

    def link_customer(self):
        cus_id = None
        customer_crud_events = [
            "customer.created",
            "customer.updated",
            "customer.deleted"
        ]
        if self.kind in customer_crud_events:
            cus_id = self.message["data"]["object"]["id"]
        else:
            cus_id = self.message["data"]["object"].get("customer", None)

        #if cus_id is not None:
        #    try:
        #        self.customer = Customer.objects.get(stripe_id=cus_id)
        #        self.save()
        #    except Customer.DoesNotExist:
        #        pass

    def validate(self):
        evt = stripe.Event.retrieve(self.stripe_id)
        self.validated_message = json.loads(
            json.dumps(
                evt.to_dict(),
                sort_keys=True,
                cls=stripe.StripeObjectEncoder
            )
        )
        if self.webhook_message["data"] == self.validated_message["data"]:
            self.valid = True
        else:
            self.valid = False
        self.save()

    def process(self):  # @@@ to complex, fix later  # noqa
        """
            "account.updated",
            "account.application.deauthorized",
            "charge.succeeded",
            "charge.failed",
            "charge.refunded",
            "charge.dispute.created",
            "charge.dispute.updated",
            "charge.dispute.closed",
            "customer.created",
            "customer.updated",
            "customer.deleted",
            "customer.subscription.created",
            "customer.subscription.updated",
            "customer.subscription.deleted",
            "customer.subscription.trial_will_end",
            "customer.discount.created",
            "customer.discount.updated",
            "customer.discount.deleted",
            "invoice.created",
            "invoice.updated",
            "invoice.payment_succeeded",
            "invoice.payment_failed",
            "invoiceitem.created",
            "invoiceitem.updated",
            "invoiceitem.deleted",
            "plan.created",
            "plan.updated",
            "plan.deleted",
            "coupon.created",
            "coupon.updated",
            "coupon.deleted",
            "transfer.created",
            "transfer.updated",
            "transfer.failed",
            "ping"
        """
        if not self.valid or self.processed:
            return
        try:
            if not self.kind.startswith("plan.") and not self.kind.startswith("transfer."):
                self.link_customer()
            #if self.kind.startswith("invoice."):
            #    Invoice.handle_event(self)
            #elif self.kind.startswith("charge."):
            #    self.customer.record_charge(
            #        self.message["data"]["object"]["id"]
            #    )
            elif self.kind.startswith("transfer."):
                Transfer.process_transfer(
                    self,
                    self.message["data"]["object"]
                )
            #elif self.kind.startswith("customer.subscription."):
            #    if self.customer:
            #        self.customer.sync_current_subscription()
            #elif self.kind == "customer.deleted":
            #    self.customer.purge()
            self.send_signal()
            self.processed = True
            self.save()
        except stripe.StripeError as e:
            EventProcessingException.log(
                data=e.http_body,
                exception=e,
                event=self
            )
            webhook_processing_error.send(
                sender=Event,
                data=e.http_body,
                exception=e
            )

    def send_signal(self):
        signal = WEBHOOK_SIGNALS.get(self.kind)
        if signal:
            return signal.send(sender=Event, event=self)