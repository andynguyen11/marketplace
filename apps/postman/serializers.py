from itertools import chain
from operator import attrgetter

from django.db.models import Q
from rest_framework import serializers

from accounts.serializers import ObfuscatedProfileSerializer
from business.serializers import DocumentSerializer, TermsSerializer, JobSerializer, ProjectSummarySerializer
from business.models import Document
from docusign.models import DocumentSigner
from generics.serializers import AttachmentSerializer
from postman.models import Message, AttachmentInteraction


class Interaction(object):
    def __init__(self, id, sender, recipient, content, timestamp):
        self.id = id
        self.sender = sender
        self.recipient = recipient
        self.content = content
        self.timestamp = timestamp

class MessageInteraction(Interaction):
    def __init__(self, *args, **kwargs):
        self.interactionType = 'message'
        super(MessageInteraction, self).__init__(*args, **kwargs)


class FileInteraction(Interaction):
    def __init__(self, attachment, *args, **kwargs):
        self.interactionType = 'attachment'
        self.attachment = attachment
        super(FileInteraction, self).__init__(*args, **kwargs)


class MessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message


class InteractionSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    interactionType = serializers.CharField(max_length=100)
    sender = ObfuscatedProfileSerializer(required=False, allow_null=True)
    recipient = ObfuscatedProfileSerializer(required=False, allow_null=True)
    content = serializers.CharField(max_length=None)
    timestamp = serializers.DateTimeField(format='iso-8601')
    attachment = AttachmentSerializer(required=False, allow_null=True)


def mark_read(user, thread):
    filter = Q(thread=thread)
    for BaseModel in [Message, AttachmentInteraction]:
        BaseModel.objects.set_read(user, filter)


def serialize_interaction(message):
    if isinstance(message, AttachmentInteraction):
        return FileInteraction(
                id=message.id,
                sender=message.sender,
                recipient=message.recipient,
                timestamp=message.sent_at,
                content=message.attachment and message.attachment.url,
                attachment=message.attachment)
    else:
        return MessageInteraction(
                id=message.id,
                sender=message.sender,
                recipient=message.recipient,
                timestamp=message.sent_at,
                content=message.body)


class ConversationSerializer(serializers.ModelSerializer):
    is_owner = serializers.SerializerMethodField()
    nda = DocumentSerializer()
    terms = TermsSerializer()
    job = JobSerializer()
    signing_url = serializers.SerializerMethodField()
    current_user = serializers.SerializerMethodField()
    attachments = AttachmentSerializer(many=True)
    interactions = serializers.SerializerMethodField()
    sender = ObfuscatedProfileSerializer()
    recipient = ObfuscatedProfileSerializer()

    class Meta:
        model = Message
        exclude = ('email', 'sent_at', 'read_at', 'replied_at', 'sender_bookmarked', 'recipient_bookmarked',
                   'sender_archived', 'recipient_archived', 'sender_deleted_at', 'recipient_deleted_at',
                   'moderation_status', 'moderation_date', 'moderation_reason', 'parent', 'moderation_by')

    def get_current_user(self, obj):
        return self.context['request'].user.id

    def get_is_owner(self, obj):
        return self.context['request'].user == obj.job.project.project_manager

    def get_signing_url(self, obj):
        try:
            document = Document.objects.get(job=obj.job, type='MSA')
            return document.docusign_document.get_signer_url(self.context['request'].user)
        except Document.DoesNotExist:
            return None

    def get_interactions(self, obj):
        mark_read(self.context['request'].user, obj.id)
        interactions = sorted(chain(*[
            BaseModel.objects.filter(thread=obj.id).order_by('sent_at') for BaseModel
            in [Message, AttachmentInteraction]
        ]), key=attrgetter('sent_at'))
        mapped_interactions = map(serialize_interaction, interactions)
        serializer = InteractionSerializer(mapped_interactions, many=True)
        return serializer.data
