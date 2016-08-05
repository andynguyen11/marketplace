from django.db import models
from django.conf import settings


class Promo(models.Model):
    code = models.CharField(max_length=15)
    expire_date = models.DateField()
    dollars_off = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    percent_off = models.IntegerField(blank=True, null=True)
    single_use = models.BooleanField(default=False)
    used = models.BooleanField(default=False)
    customers = models.ManyToManyField('accounts.Profile', blank=True)

    def __str__(self):
        return self.code


class Order(models.Model):
    date_created = models.DateTimeField(auto_now=True)
    date_charged = models.DateTimeField(blank=True, null=True)
    job = models.OneToOneField('business.Job')
    promo = models.ForeignKey(Promo, blank=True, null=True)
    date_created = models.DateTimeField(auto_now=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=100, default='pending')

    def __str__(self):
        return 'Transaction: {0}'.format(self.job)

    def save(self, *args, **kwargs):
        if not self.price:
            self.price = self.job.hours * settings.LOOM_FEE
        super(Order, self).save(*args, **kwargs)
