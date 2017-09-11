import stripe
from django.conf import settings
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


stripe.api_key = settings.STRIPE_KEY

class Product(models.Model):
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=255)
    price = models.IntegerField()
    sku = models.CharField(max_length=50)


class Order(models.Model):
    #TODO figure out a way to uniquely separate project posting fee renewal
    date_created = models.DateTimeField(auto_now=True)
    product = models.ForeignKey('product.Product')
    stripe_charge = models.CharField(max_length=128)
    status = models.CharField(max_length=50)
    card_type = models.CharField(max_length=20)
    card_last_4 = models.IntegerField()
    user = models.ForeignKey('accounts.Profile')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    def capture(self):
        try:
            charge = stripe.Charge.retrieve(self.stripe_charge)
            self.card_type = charge.source.brand
            self.card_last_4 = charge.source.last4
            self.save()
            return charge.capture()
        except stripe.error.CardError as e:
            body = e.json_body
            return body['error']