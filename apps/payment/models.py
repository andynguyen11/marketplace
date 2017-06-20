from datetime import datetime, date
from django.db import models
from django.conf import settings
from rest_framework.exceptions import ValidationError
from payment.helpers import stripe_helpers
from payment.enums import *
from business.products import products, ProductType, PRODUCT_CHOICES
from generics.utils import percentage
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from decimal import Decimal

def noop(*args, **kwargs):
    pass

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


class Order(models.Model):
    date_created = models.DateTimeField(auto_now_add=True)
    date_charged = models.DateTimeField(blank=True, null=True)
    _product = models.CharField(max_length=20, choices=PRODUCT_CHOICES)
    job = models.OneToOneField('business.Job')
    promo = models.ForeignKey(Promo, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='pending', choices=ORDER_STATUSES)

    def __str__(self):
        return 'Transaction: {0}'.format(self.job)

    def save(self, *args, **kwargs):
        if not self.price:
            self.price = self.job.hours * settings.LOOM_FEE
        super(Order, self).save(*args, **kwargs)

    @property
    def payer(self):
        return self.job.project.project_manager

    @property
    def final_price(self):
        return self.promo.apply_to(self.price) if self.promo else self.price

    def add_promo(self, code): # TODO: Should an incorrect promo fail silently like this?
        if code:
            promo = get_promo(code)
            if promo and promo.is_valid(self.payer):
                self.promo = promo
            else:
                return False

    def can_pay(self, user):
        return user == self.payer

    def pay(self, customer, card):
        stripe_helpers.charge_source(
            amount=self.final_price,
            source=card,
            customer=customer,
            description='Loom fee for "{0}"'.format(self.job.project.title)
        )
        if self.promo:
            self.promo.mark_used_by(self.payer)
        self.date_charged = datetime.now()
        self.status = 'paid'
        self.save()


class ProductOrder(models.Model):
    date_created = models.DateTimeField(auto_now_add=True)
    date_charged = models.DateTimeField(blank=True, null=True)

    _product = models.CharField(max_length=20, choices=PRODUCT_CHOICES)

    requester = models.ForeignKey('accounts.Profile', related_name='requester')
    payer = models.ForeignKey('accounts.Profile', related_name='payer')
    recipient = models.ForeignKey('accounts.Profile', related_name='recipient', null=True)

    related_model = models.ForeignKey(ContentType)
    related_object = GenericForeignKey('related_model', 'related_object_id')
    related_object_id = models.PositiveIntegerField()

    _promo = models.ForeignKey(Promo, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    fee = models.DecimalField(max_digits=10, decimal_places=2, null=True)

    status = models.CharField(max_length=20, default='pending', choices=ORDER_STATUSES)
    request_status = models.CharField(max_length=50, null=True)

    stripe_charge_id = models.CharField(max_length=50, null=True)
    details = models.CharField(max_length=250, null=True)
    result = models.CharField(max_length=250, null=True)
    brand = models.CharField(max_length=25, null=True)
    last4 =  models.CharField(max_length=10, null=True)

    @property
    def product(self):
        return products[self._product]

    @product.setter
    def product(self, product):
        self._product = product.id

    @property
    def promo(self):
        return self._promo

    @promo.setter
    def promo(self, code):
        if code:
            promo = get_promo(code)
            if not promo:
                raise ValidationError({"promo": ["This promo code is invalid."]})
            if promo.is_valid(self.payer):
                self._promo = promo
        else: self._promo = None

    @property
    def final_price(self):
        return self.promo.apply_to(self.price) if self.promo else self.price

    def set_status(self, status):
        """
        This allows Products to implement logic that is stored in request_status.
        request_statuses are usually substatuses of pending.
        Products can implement on_{status} hooks for ORDER_STATUSES and request_statuses
        """
        valid_order_status = status in { t[0] for t in ORDER_STATUSES }
        valid_request_status = status in self.product.status_flow

        if valid_order_status:
            self.status = status
        if valid_request_status:
            self.request_status = status
        if not (valid_order_status or valid_request_status):
            raise TypeError('status "%s" is not an ORDER_STATUS or defined by product %s' % (status, self.product))
        return getattr(self.product, 'on_%s' % status, noop)(self)

    def change_status(self, status, user):
        return self.product.change_status(status, self, user)

    @property
    def full_status(self):
        return '%s.%s' % (self.status, self.request_status)

    def __str__(self):
        return 'Product {0}, Order #{1} on {2}'.format(self.product, self.id, self.related_object)

    @property
    def involved_users(self):
        if hasattr(self.product, 'involved_users'):
            return self.product.involved_users(self)
        return { self.payer, self.requester, self.recipient }

    def resolve_product_fields(self):
        if not hasattr(self, 'related_model'):
            self.related_model = self.product.related_model
        self.price, self.fee = self.product.calculate_costs(self)
        self.product.validate_order(self)

    def save(self, *args, **kwargs):
        self.resolve_product_fields()
        return super(ProductOrder, self).save(*args, **kwargs)

    def apply_promo(self, amount):
        return self.promo.apply_to(amount) if self.promo else amount

    @property
    def final_costs(self):
        if(self.product.type == ProductType.percentage):
            return self.price, self.apply_promo(self.fee)
        return self.apply_promo(self.price), None

    def prepare_payment(self, customer=None, source=None):
        if self.stripe_charge_id:
            return self.stripe_charge_id

        if not (customer and source):
            customer, source = stripe_helpers.get_customer_and_card(
                    self.payer, source)
        amount, fee = self.final_costs
        payload = dict(
            capture=False,
            amount=amount,
            source=source,
            customer=customer,
            description= 'Loom fee for {0}'.format(self),
            metadata={'order': self.id})

        if(self.product.type == ProductType.percentage):
            payload['amount'] = fee # amount is the fee until connect integration

        charge = stripe_helpers.charge_source(**payload)

        self.stripe_charge_id = charge.id
        self.brand = charge.source.brand
        self.last4 = charge.source.last4
        self.save()
        return self.stripe_charge_id

    def pay(self, customer=None, source=None):
        self.prepare_payment(customer, source)
        self.product.can_pay(self, self.payer)

        charge = stripe_helpers.capture_charge(self.stripe_charge_id)

        self.set_status('paid' if charge.paid else charge.status)

        if self.status == 'paid':
            if self.promo:
                self.promo.mark_used_by(self.payer)
            self.details = self.product.display_value
            self.date_charged = datetime.now()

        if self.status == 'failed':
            self.details = '''
            failure_code: %s,
            failure_message: %s
            ''' % (charge.failure_code, charge.failure_message)

        self.save()
        return self


class Invoice(models.Model):
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
    rate = models.IntegerField(blank=True, null=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2)

    def save(self, *args, **kwargs):
        if self.hours and self.rate and not self.amount:
            self.amount = self.hours * self.rate
        super(InvoiceItem, self).save(*args, **kwargs)
