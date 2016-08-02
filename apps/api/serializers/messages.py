from rest_framework import serializers

from postman.models import Message
from api.serializers.projects import DocumentSerializer, TermsSerializer


class MessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message


class ConversationSerializer(serializers.ModelSerializer):
    is_owner = serializers.SerializerMethodField()
    nda = DocumentSerializer()
    terms = TermsSerializer()

    class Meta:
        model = Message

    def get_is_owner(self, obj):
        return self.context['request'].user == obj.job.project.project_manager