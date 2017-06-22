import json

from rest_framework import serializers
from stripe.error import StripeError

from business.serializers import JobSerializer
from accounts.models import Profile
from payment.helpers import stripe_helpers
from payment.models import Order, ProductOrder, Promo, Invoice, InvoiceItem


class OrderSerializer(serializers.ModelSerializer):
    job = JobSerializer()

    class Meta:
        model = Order

def ensure_order_is_payable(order, stripe_token=None):
    try: 
        return order.stripe_charge_id or order.prepare_payment(source=stripe_token), 'is payable'
    except StripeError, e:
        return False, e.message

def default_error_details(order):
    if (not order.details) or not len(order.details):
        order.details = 'Payment method required for payers to request orders.'

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
        promo_code = data.pop('promo', None)
        payable = False
        order = ProductOrder.objects.create(**data)
        # TODO This stuff is pretty brittle, revisit when refactoring for pay to respond to proposal
        if promo_code:
            promo = Promo.objects.get(code=promo_code)
            order.promo = promo_code
            if promo.percent_off == 100:
                payable = True
        if(stripe_token):
            payable, order.details = ensure_order_is_payable(order, stripe_token)

        if(order.payer == order.requester and not payable):
            order.status = 'failed'
            default_error_details(order)
        order.save()
        return order

    def get_product(self, obj):
        return obj.product.id


class InvoiceItemSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=InvoiceItem()._meta.get_field('id'))

    class Meta:
        model = InvoiceItem
        fields = ('id', 'description', 'hours', 'rate', 'amount',)


class InvoiceSerializer(serializers.ModelSerializer):
    # TODO add sender and recipient
    # check to make sure recipient is valid
    hourly_items = serializers.SerializerMethodField()
    fixed_items = serializers.SerializerMethodField()
    invoice_items = InvoiceItemSerializer(many=True)

    class Meta:
        model = Invoice
        fields = ('id', 'title', 'sent_date', 'start_date', 'end_date', 'due_date', 'hourly_items', 'fixed_items',
                  'invoice_items', 'sender_name', 'sender_address', 'sender_address2', 'sender_location',
                  'recipient_name', 'recipient_address', 'recipient_address2', 'recipient_location', 'status',
                  'logo', 'recipient', 'sender', 'viewed', )

    def get_hourly_items(self, obj):
        serializer = InvoiceItemSerializer(InvoiceItem.objects.filter(invoice=obj).exclude(rate__isnull=True), many=True)
        return serializer.data

    def get_fixed_items(self, obj):
        serializer = InvoiceItemSerializer(InvoiceItem.objects.filter(invoice=obj).exclude(rate__isnull=False), many=True)
        return serializer.data

    def create(self, validated_data):
        invoice_items = validated_data.pop('invoice_items')
        invoice = Invoice.objects.create(**validated_data)
        for invoice_item in invoice_items:
            item = InvoiceItem.objects.create(invoice=invoice, **invoice_item)
            item.save()
        return invoice

    def update(self, instance, validated_data):
        invoice_items = validated_data.pop('invoice_items')
        current_items = [item.id for item in instance.invoice_items.all()]
        new_items = [int(item['id']) for item in invoice_items if 'id' in invoice_items]
        delete_items = list(set(current_items) - set(new_items))
        for item_id in delete_items:
            item = InvoiceItem.objects.get(id=item_id)
            item.delete()
        for invoice_item in invoice_items:
            item, created = InvoiceItem.objects.update_or_create(invoice=instance, **invoice_item)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance