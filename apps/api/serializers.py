from rest_framework import serializers

from business.models import Company, Document, Job, Project
from postman.api import MessageSerializer


class JobSerializer(serializers.ModelSerializer):
    job_messages = MessageSerializer(required=False, many=True, read_only=True)

    class Meta:
        model = Job
        fields = ('id', 'project', 'developer', 'equity', 'cash',
                  'hours', 'bid_message', 'files', 'job_messages')


class CompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = Company


class PaymentSerializer(serializers.Serializer):
    brand = serializers.CharField(max_length=100)
    last4 = serializers.CharField(max_length=10)
    exp_month = serializers.CharField(max_length=10)
    exp_year = serializers.CharField(max_length=10)

