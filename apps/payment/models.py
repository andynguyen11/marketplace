from datetime import datetime, date
from decimal import Decimal
from django.db import models
from django.conf import settings
from payment.helpers import stripe_helpers 


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
            return amount - self.dollars_off
        if self.percent_off:
            return round(amount - (amount * Decimal(self.percent_off * 0.01)), 2)
        return amount if amount > 0 else 0.00


def get_promo(code):
    try:
        return Promo.objects.get(code=code)
    except Promo.DoesNotExist:
        return None


class Order(models.Model):
    date_created = models.DateTimeField(auto_now=True)
    date_charged = models.DateTimeField(blank=True, null=True)
    job = models.OneToOneField('business.Job')
    promo = models.ForeignKey(Promo, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=100, default='pending')

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

