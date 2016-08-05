from rest_framework import serializers

from business.serializers import DocumentSerializer, TermsSerializer, JobSerializer
from postman.models import Message


class MessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message


class ConversationSerializer(serializers.ModelSerializer):
    is_owner = serializers.SerializerMethodField()
    nda = DocumentSerializer()
    terms = TermsSerializer()
    job = JobSerializer()

    class Meta:
        model = Message

    def get_is_owner(self, obj):
        return self.context['request'].user == obj.job.project.project_manager