from rest_framework import serializers

from business.models import Company

class CompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = Company


class PaymentSerializer(serializers.Serializer):
    brand = serializers.CharField(max_length=100)
    last4 = serializers.CharField(max_length=10)
    exp_month = serializers.CharField(max_length=10)
    exp_year = serializers.CharField(max_length=10)