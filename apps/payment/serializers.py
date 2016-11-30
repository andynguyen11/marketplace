from rest_framework import serializers

from business.serializers import JobSerializer
from payment.models import Order, ProductOrder
from accounts.models import Profile
from payment.helpers import stripe_helpers 


class OrderSerializer(serializers.ModelSerializer):
    job = JobSerializer()

    class Meta:
        model = Order

class ProductOrderSerializer(serializers.ModelSerializer):
    recipient = serializers.PrimaryKeyRelatedField(required=False, queryset=Profile.objects.all())
    payer = serializers.PrimaryKeyRelatedField(required=False, queryset=Profile.objects.all())

    stripe_token = serializers.CharField(required=False)
    _product = serializers.CharField(write_only=True)
    product = serializers.SerializerMethodField()

    class Meta:
        model = ProductOrder
        read_only_fields = (
                'date_created',
                'date_charged',
                'related_model',
                'related_object',
                'promo',
                'price',
                'fee',
                'status',
                'stripe_charge_id',
                'details',
                'product')

    def create(self, data):
        stripe_token = data.pop('stripe_token', None)
        order = ProductOrder.objects.create(**data)
        if(stripe_token):
            customer, card = stripe_helpers.get_customer_and_card(order.payer, stripe_token)
            return order.pay(customer, card)
        else:
            return order

    def get_product(self, obj):
        return obj.product.id

