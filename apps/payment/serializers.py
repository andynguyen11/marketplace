import json
from rest_framework import serializers

from business.serializers import JobSerializer
from payment.models import Order, ProductOrder
from accounts.models import Profile
from payment.helpers import stripe_helpers 
from stripe.error import StripeError


class OrderSerializer(serializers.ModelSerializer):
    job = JobSerializer()

    class Meta:
        model = Order

def ensure_order_is_payable(order, stripe_token=None):
    try: 
        return order.stripe_charge_id or order.prepare_payment(source=stripe_token), 'is payable'
    except StripeError, e:
        return False, e.message

class ProductOrderSerializer(serializers.ModelSerializer):
    recipient = serializers.PrimaryKeyRelatedField(required=False, queryset=Profile.objects.all())
    payer = serializers.PrimaryKeyRelatedField(required=False, queryset=Profile.objects.all())

    stripe_token = serializers.CharField(required=False, allow_null=True)
    _product = serializers.CharField(write_only=True)
    product = serializers.SerializerMethodField()

    _promo = serializers.CharField(write_only=True, required=False)
    promo = serializers.CharField(required=False, allow_null=True)

    final_price = serializers.CharField(read_only=True)#required=False)

    class Meta:
        model = ProductOrder
        read_only_fields = (
            'date_created',
            'date_charged',
            'related_model',
            'related_object',
            'price',
            'final_price',
            'fee',
            'status',
            'stripe_charge_id',
            'details',
            'product')

    def create(self, data):
        stripe_token = data.pop('stripe_token', None)
        promo = data.pop('promo', None)
        order = ProductOrder.objects.create(**data)
        order.promo = promo
        payable = False
        if(stripe_token):
            payable, order.details = ensure_order_is_payable(order, stripe_token)

        if(order.payer == order.requester and not payable):
            order.status = 'failed'
            order.details = json.dumps({
                'failure_message': {
                    'stripe_token': [
                        'Payment method required for payers to request orders.'
                        ] } })
        order.save()
        return order

    def get_product(self, obj):
        return obj.product.id

