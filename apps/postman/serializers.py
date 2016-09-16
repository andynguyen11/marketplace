from django.db.models import Q
from rest_framework import serializers

from accounts.serializers import ObfuscatedProfileSerializer
from business.serializers import DocumentSerializer, TermsSerializer, JobSerializer, ProjectSummarySerializer
from business.models import Document
from docusign.models import DocumentSigner
from generics.serializers import AttachmentSerializer
from postman.models import Message, AttachmentInteraction
from django.db.models import Q

class Interaction(object):
    def __init__(self, sender, recipient, content, timestamp):
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
        self.interactionType = 'file'
        self.attachment_id = attachment.id
        super(FileInteraction, self).__init__(*args, **kwargs)

class MessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message


class InteractionSerializer(serializers.Serializer):
    interactionType = serializers.CharField(max_length=100)
    sender = ObfuscatedProfileSerializer(required=False, allow_null=True)
    recipient = ObfuscatedProfileSerializer(required=False, allow_null=True)
    content = serializers.CharField(max_length=None)
    timestamp = serializers.DateTimeField(format='iso-8601')

    attachment_id = serializers.IntegerField(required=False, allow_null=True)


def mark_read(user, thread):
    filter = Q(thread=thread)
    for BaseModel in [Message, AttachmentInteraction]:
        BaseModel.objects.set_read(user, filter)


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
        messages = Message.objects.filter(thread=obj.id).order_by('sent_at')
        mark_read(self.context['request'].user, obj.id)
        interactions = []
        for file in obj.attachments.filter(deleted=False):
            interaction = FileInteraction(
                timestamp=file.upload_date,
                content=file.url
            )
            interactions.append(interaction)
        for message in messages:
            interaction = MessageInteraction(
                sender=message.sender,
                recipient=message.recipient,
                timestamp=message.sent_at,
                content=message.body
            )
            interactions.append(interaction)
        ordered_interactions = sorted(interactions, key=lambda k: k.timestamp)
        serializer = InteractionSerializer(ordered_interactions, many=True)
        return serializer.data
