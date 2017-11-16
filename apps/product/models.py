from datetime import date
from decimal import Decimal

import stripe
from django.conf import settings
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

from generics.utils import percentage


stripe.api_key = settings.STRIPE_KEY

def get_promo(code):
    try:
        return Promo.objects.get(code=code.lower())
    except Promo.DoesNotExist:
        return None


class Promo(models.Model):
    code = models.CharField(max_length=15)
    expire_date = models.DateField()
    cents_off = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    percent_off = models.IntegerField(blank=True, null=True)
    single_use = models.BooleanField(default=False)
    used = models.BooleanField(default=False)
    customers = models.ManyToManyField('accounts.Profile', blank=True)

    @property
    def value_off(self):
        return str(self.percent_off) + '%' if self.percent_off else '$' + str(self.cents_off)

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
        if self.cents_off:
            amount = ((amount*100) - self.cents_off)/100
        elif self.percent_off:
            amount = percentage(base=amount, percent=self.percent_off, operation='removed')
        return amount if amount > 0 else 0.00


class Product(models.Model):
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=255)
    price = models.IntegerField()
    sku = models.CharField(max_length=50)
    interval = models.IntegerField(blank=True, null=True)


class Order(models.Model):
    #TODO figure out a way to uniquely separate project posting fee renewal
    date_created = models.DateTimeField(auto_now=True)
    product = models.ForeignKey('product.Product')
    stripe_charge = models.CharField(max_length=128)
    status = models.CharField(max_length=50)
    card_type = models.CharField(max_length=20)
    card_last_4 = models.CharField(max_length=4)
    user = models.ForeignKey('accounts.Profile')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    promo = models.ForeignKey('product.Promo', blank=True, null=True)
    amount_charged = models.IntegerField(blank=True, null=True)

    def charge(self, capture=False):
        price = self.product.price - self.promo.apply_to(self.product.price) if self.promo else self.product.price
        charge = stripe.Charge.create(
                    amount = int(price),
                    customer = self.user.stripe,
                    description = self.product.description,
                    currency = 'usd',
                    capture = capture
                )
        self.stripe_charge = charge.id
        if self.promo:
            self.promo.mark_used_by(self.user)
        self.save()
        return charge

    def capture(self):
        try:
            charge = stripe.Charge.retrieve(self.stripe_charge)
            price_check = self.product.price - self.promo.apply_to(self.product.price) if self.promo else self.product.price
            if int(charge.amount) != int(price_check):
                charge.amount = price_check
            self.card_type = charge.source.brand
            self.card_last_4 = charge.source.last4
            self.status = 'active'
            self.amount_charged = charge.amount
            self.save()
            return charge.capture()
        except stripe.error.CardError as e:
            body = e.json_body
            return body['error']