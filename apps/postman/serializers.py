from itertools import chain
from operator import attrgetter

from django.db.models import Q
from notifications.models import Notification
from rest_framework import serializers

from accounts.models import ContactDetails
from accounts.serializers import ObfuscatedProfileSerializer, ContactDetailsSerializer, ProfileSerializer
from business.serializers import DocumentSerializer, TermsSerializer, JobSerializer, ProjectSummarySerializer
from business.models import Document
from payment.models import ProductOrder
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


class MessageAlertSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ('id', 'timestamp', 'unread', 'type', )

    def get_type(self, obj):
        return obj.data['type']


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
    sender = serializers.SerializerMethodField()
    recipient = ObfuscatedProfileSerializer()
    connection_contact_details = serializers.SerializerMethodField()
    contact_details = serializers.SerializerMethodField()
    connection_status = serializers.SerializerMethodField()
    alerts = serializers.SerializerMethodField()

    class Meta:
        model = Message
        exclude = ('email', 'sent_at', 'read_at', 'replied_at', 'sender_bookmarked', 'recipient_bookmarked',
                   'sender_archived', 'recipient_archived', 'sender_deleted_at', 'recipient_deleted_at',
                   'moderation_status', 'moderation_date', 'moderation_reason', 'parent', 'moderation_by')

    # Helpers used in SerializerMethodFields
    def requesting_user(self, obj):
        return self.context['request'].user

    def other_user(self, obj):
        return obj.job.contractor if self.get_is_owner(obj) else obj.job.project.project_manager

    def is_connected(self, obj):
        return len(self.requesting_user(obj).connections.filter(id=self.other_user(obj).id))

    def get_is_owner(self, obj):
        return self.requesting_user(obj) == obj.job.project.project_manager

    def get_current_user(self, obj):
        return self.requesting_user(obj).id

    def get_sender(self, obj):
        if self.is_connected(obj):
            sender = ProfileSerializer(obj.sender).data
            fields = [ 'id', 'first_name', 'last_name', 'photo_url', 'role', 'city', 'state', 'country' ]
            return { k: v for k, v in sender.items() if k in fields }
        else:
            sender = ObfuscatedProfileSerializer(obj.sender).data
        return sender

    def get_connection_contact_details(self, obj):
        other_user = self.other_user(obj)
        if self.is_connected(obj):
            return ContactDetailsSerializer(self.other_user(obj).contact_details).data

    def get_contact_details(self, obj):
        return ContactDetailsSerializer(self.requesting_user(obj).contact_details).data

    def get_alerts(self, obj):
        alerts = Notification.objects.filter(
            recipient=self.context['request'].user,
            action_object_object_id=obj.id,
            data__isnull=False
        )
        return MessageAlertSerializer(alerts, many=True).data

    def get_signing_url(self, obj):
        try:
            document = Document.objects.get(job=obj.job, type='MSA')
            return document.docusign_document.get_signer_url(self.requesting_user(obj))
        except Document.DoesNotExist:
            return None

    def get_interactions(self, obj):
        mark_read(self.requesting_user(obj), obj.id)
        interactions = sorted(chain(*[
            BaseModel.objects.filter(thread=obj.id).order_by('sent_at') for BaseModel
            in [Message, AttachmentInteraction]
        ]), key=attrgetter('sent_at'))
        mapped_interactions = map(serialize_interaction, interactions)
        serializer = InteractionSerializer(mapped_interactions, many=True)
        return serializer.data

    def get_connection_status(self, obj):
        if(obj.job.status != 'pending'):
            return 'connected'
        try:
            if(ProductOrder.objects.get(status='pending', _product='connect_job', related_object_id=obj.job.id)):
                return 'requested'
        except ProductOrder.DoesNotExist:
            pass

