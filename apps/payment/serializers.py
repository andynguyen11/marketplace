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
        customer, card = stripe_helpers.get_customer_and_card(order.payer, stripe_token, metadata={'order': order.id})
    except StripeError, e:
        return False, e.message
    return card, 'is payable'

class ProductOrderSerializer(serializers.ModelSerializer):
    recipient = serializers.PrimaryKeyRelatedField(required=False, queryset=Profile.objects.all())
    payer = serializers.PrimaryKeyRelatedField(required=False, queryset=Profile.objects.all())

    stripe_token = serializers.CharField(required=False, allow_null=True)
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
        return order

    def get_product(self, obj):
        return obj.product.id

