import json
import uuid

from rest_framework import serializers
from stripe.error import StripeError

from accounts.models import Profile
from accounts.serializers import ObfuscatedProfileSerializer
from generics.serializers import JSONSerializerField
from payment.helpers import stripe_helpers
from payment.models import Promo, Invoice, InvoiceItem, EventProcessingException, Event


class InvoiceItemSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=InvoiceItem()._meta.get_field('id'))

    class Meta:
        model = InvoiceItem
        fields = ('id', 'description', 'hours', 'rate', 'amount',)


class InvoiceSerializer(serializers.ModelSerializer):
    # TODO add sender and recipient
    # check to make sure recipient is valid
    recipient = ObfuscatedProfileSerializer()
    sender = ObfuscatedProfileSerializer()
    hourly_items = serializers.SerializerMethodField()
    fixed_items = serializers.SerializerMethodField()
    invoice_items = InvoiceItemSerializer(many=True)

    class Meta:
        model = Invoice
        fields = ('reference_id', 'title', 'sent_date', 'start_date', 'end_date', 'due_date', 'hourly_items', 'fixed_items',
                  'invoice_items', 'sender_name', 'sender_email', 'sender_phone', 'sender_address', 'sender_address2', 'sender_location',
                  'recipient_name', 'recipient_email', 'recipient_phone', 'recipient_address', 'recipient_address2', 'recipient_location',
                  'status', 'logo', 'recipient', 'sender', 'viewed', )
        lookup_field = 'reference_id'

    def get_hourly_items(self, obj):
        serializer = InvoiceItemSerializer(InvoiceItem.objects.filter(invoice=obj).exclude(rate__isnull=True), many=True)
        return serializer.data

    def get_fixed_items(self, obj):
        serializer = InvoiceItemSerializer(InvoiceItem.objects.filter(invoice=obj).exclude(rate__isnull=False), many=True)
        return serializer.data

    def create(self, validated_data):
        invoice_items = validated_data.pop('invoice_items')
        validated_data['sender'] = Profile.objects.get(id=validated_data['sender']['id'])
        validated_data['recipient'] = Profile.objects.get(id=validated_data['recipient']['id'])
        invoice = Invoice.objects.create(**validated_data)
        for invoice_item in invoice_items:
            item = InvoiceItem.objects.create(invoice=invoice, **invoice_item)
            item.save()
        return invoice

    def update(self, instance, validated_data):
        if 'invoice_items' in validated_data:
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


class StripeJSONSerializer(serializers.Serializer):
    data = JSONSerializerField(required=True, allow_null=False)


class EventProcessingExceptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventProcessingException


class EventSerializer(serializers.ModelSerializer):
    event_processing_exceptions = EventProcessingExceptionSerializer(source='event_processing_exception_serializer_set', many=True, read_only=True)

    class Meta:
        model = Event