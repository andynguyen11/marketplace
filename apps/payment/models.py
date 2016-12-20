from datetime import datetime, date
from django.db import models
from django.conf import settings
from payment.helpers import stripe_helpers 
from payment.enums import *
from business.products import products, ProductType, PRODUCT_CHOICES
from generics.utils import percentage 
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

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
        return self.is_valid_for(user) and self.not_expired()

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
    date_created = models.DateTimeField(auto_now=True)
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


"""
class StripeAccount(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    profile = models.OneToOneField('accounts.Profile')
    secret_key = models.CharField(max_length=50)
    publishable_key = models.CharField(max_length=50)

    def save(self, *args, **kwargs):
        if not self.id:
            account = stripe_helpers.create_account(self.profile)
            self.id = account.id
            self.secret_key = account.keys.secret
            self.publishable_key = account.keys.publishable
        return super(StripeAccount, self).save(*args, **kwargs)
"""


class ProductOrder(models.Model):
    date_created = models.DateTimeField(auto_now=True)
    date_charged = models.DateTimeField(blank=True, null=True)
    _product = models.CharField(max_length=20, choices=PRODUCT_CHOICES)

    requester = models.ForeignKey('accounts.Profile', related_name='requester')
    payer = models.ForeignKey('accounts.Profile', related_name='payer')
    recipient = models.ForeignKey('accounts.Profile', related_name='recipient', null=True)

    related_model = models.ForeignKey(ContentType)
    related_object = GenericForeignKey('related_model', 'related_object_id')
    related_object_id = models.PositiveIntegerField()

    promo = models.ForeignKey(Promo, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    fee = models.DecimalField(max_digits=10, decimal_places=2, null=True)

    status = models.CharField(max_length=20, default='pending', choices=ORDER_STATUSES)
    request_status = models.CharField(max_length=50, null=True)

    stripe_charge_id = models.CharField(max_length=50, null=True)
    details = models.CharField(max_length=250, null=True)
    result = models.CharField(max_length=100, null=True)

    @property
    def product(self):
        return products[self._product]

    @product.setter
    def product(self, product):
        self._product = product.id

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

    def add_promo(self, code):
        # TODO: Should an incorrect promo fail silently like this?
        if code:
            promo = get_promo(code)
            if promo and promo.is_valid(self.payer):
                self.promo = promo
            else:
                return False

    def pay(self, customer=None, source=None):
        if not (customer and source):
            customer, source = stripe_helpers.get_customer_and_card(
                    self.payer, metadata={'order': self.id})
        self.product.can_pay(self, self.payer)
        amount, fee = self.final_costs
        payload = dict(
            amount=amount,
            source=source,
            customer=customer,
            description= 'Loom fee for {0}'.format(self))

        if(self.product.type == ProductType.percentage):
            payload['amount'] = fee # amount is the fee until connect integration

        charge = stripe_helpers.charge_source(**payload)

        self.stripe_charge_id = charge.id
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


