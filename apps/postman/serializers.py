from itertools import chain
from operator import attrgetter

from django.db.models import Q
from django.conf import settings
from notifications.models import Notification
from rest_framework import serializers

from accounts.models import ContactDetails
from accounts.serializers import ObfuscatedProfileSerializer, ContactDetailsSerializer, ProfileSerializer
from business.serializers import DocumentSerializer, TermsSerializer, JobSerializer, ProjectSummarySerializer, NDASerializer
from business.models import Document, NDA
from generics.serializers import AttachmentSerializer
from payment.models import ProductOrder
from postman.models import Message, AttachmentInteraction
from proposals.models import Proposal


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



def free_messages(thread, user, legacy=True):
    if legacy:
        total = settings.UNCONNECTED_THREAD_REPLY_LIMIT if thread.job.project.project_manager == user \
                else settings.UNCONNECTED_THREAD_REPLY_LIMIT + 1
    else:
        total = settings.UNCONNECTED_THREAD_REPLY_LIMIT + 1 if thread.job.project.project_manager == user \
                else settings.UNCONNECTED_THREAD_REPLY_LIMIT
    remaining = total - thread.get_participant_replies_count(user)
    if remaining < 0:
        remaining = 0
    return dict(total=total, remaining=remaining)

class ConversationSerializer(serializers.ModelSerializer):
    is_legacy = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    nda = serializers.SerializerMethodField()
    current_user = serializers.SerializerMethodField()
    interactions = serializers.SerializerMethodField()
    sender = serializers.SerializerMethodField()
    recipient = serializers.SerializerMethodField()
    connection_contact_details = serializers.SerializerMethodField()
    contact_details = serializers.SerializerMethodField()
    connection_status = serializers.SerializerMethodField()
    alerts = serializers.SerializerMethodField()

    free_messages = serializers.SerializerMethodField()

    class Meta:
        model = Message

    # Helpers used in SerializerMethodFields
    def requesting_user(self, obj):
        return self.context['request'].user

    def other_user(self, obj):
        return obj.job.contractor if self.get_is_owner(obj) else obj.job.project.project_manager

    def is_connected(self, obj):
        return len(self.requesting_user(obj).connections.filter(id=self.other_user(obj).id))

    def set_profile(self, obj, user):
        if self.is_connected(obj):
            profile = ProfileSerializer(user, context={'request': self.context['request']}).data
            fields = [ 'id', 'first_name', 'last_name', 'photo_url', 'role', 'city', 'state', 'country' ]
            return { k: v for k, v in profile.items() if k in fields }
        else:
            profile = ObfuscatedProfileSerializer(user).data
        return profile

    def get_is_owner(self, obj):
        return self.requesting_user(obj) == obj.job.project.project_manager

    def get_current_user(self, obj):
        return self.requesting_user(obj).id

    def get_recipient(self, obj):
        return self.set_profile(obj, obj.recipient)

    def get_sender(self, obj):
        return self.set_profile(obj, obj.sender)

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

    def get_free_messages(self, obj):
        return free_messages(obj, self.requesting_user(obj), self.get_is_legacy(obj))

    def get_is_legacy(self, obj):
        try:
            proposal = Proposal.objects.get(interaction=obj)
            return False
        except Proposal.DoesNotExist:
            return True

    def get_nda(self, obj):
        if self.get_is_legacy(obj):
            serializer = DocumentSerializer(obj.nda)
            return serializer.data
        else:
            proposal = Proposal.objects.get(interaction=obj)
            nda, created = NDA.objects.get_or_create(
                sender=proposal.receiver,
                receiver=proposal.submitter,
                proposal=proposal
            )
            serializer = NDASerializer(nda)
            return serializer.data