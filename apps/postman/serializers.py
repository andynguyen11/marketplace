from rest_framework import serializers

from business.serializers import DocumentSerializer, TermsSerializer, JobSerializer
from business.models import Document
from docusign.models import DocumentSigner
from postman.models import Message


class MessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message


class ConversationSerializer(serializers.ModelSerializer):
    is_owner = serializers.SerializerMethodField()
    nda = DocumentSerializer()
    terms = TermsSerializer()
    job = JobSerializer()
    signing_url = serializers.SerializerMethodField()

    class Meta:
        model = Message

    def get_is_owner(self, obj):
        return self.context['request'].user == obj.job.project.project_manager

    def get_signing_url(self, obj):
        try:
            document = Document.objects.get(job=obj.job, type='MSA')
            signer = DocumentSigner.objects.get(document=document.docusign_document, profile=self.context['request'].user)
            return signer.get_signing_url()
        except Document.DoesNotExist:
            return None