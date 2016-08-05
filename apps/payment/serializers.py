from rest_framework import serializers

from business.serializers import JobSerializer
from payment.models import Order


class OrderSerializer(serializers.ModelSerializer):
    job = JobSerializer()

    class Meta:
        model = Order