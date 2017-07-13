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

    @property
    def application_fee(self):
        """
        :return: Invoice app fee
        """
        stripe_fee = (float(self.total_amount) * .029) + .30
        application_fee = round((self.loom_fee - stripe_fee), 2)
        return application_fee


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='invoice_items')
    description = models.CharField(max_length=255)
    hours = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    rate = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2)