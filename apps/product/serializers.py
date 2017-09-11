from rest_framework import serializers

from product.models import Order, Product


class ProductSerializer(serializers.ModelSerializer):

    class Meta:
        model = Product
        exclude = ['sku', ]


class OrderSerializer(serializers.ModelSerializer):
    product = ProductSerializer()

    class Meta:
        model = Order
        exclude = ['stripe_charge', 'object_id', 'user', 'content_type', ]
