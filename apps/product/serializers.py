from rest_framework import serializers

from product.models import Order


class OrderSerializer(serializers.ModelSerializer):


    class Meta:
        model = Order