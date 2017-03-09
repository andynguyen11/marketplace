import json
from datetime import timedelta, datetime
from itertools import chain
from operator import attrgetter

from django.conf import settings
from django.db.models import Q, F
from django.shortcuts import get_object_or_404
from django.utils.encoding import smart_str
from notifications.signals import notify
from rest_framework.serializers import ModelSerializer
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.viewsets import ViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.decorators import permission_classes, list_route
from rest_framework.exceptions import ValidationError

from accounts.models import Profile, Connection
from business.models import Project, Job, Terms, Document
from generics.models import Attachment
from generics.tasks import new_message_notification
from generics.validators import file_validator
from payment.models import ProductOrder, Promo
from payment.serializers import ProductOrderSerializer, ensure_order_is_payable, default_error_details
from postman.models import Message, AttachmentInteraction, Interaction, STATUS_PENDING, STATUS_ACCEPTED
from postman.permissions import IsPartOfConversation
from postman.serializers import ConversationSerializer, InteractionSerializer, MessageInteraction, FileInteraction, serialize_interaction, free_messages

def all_interactions(thread_id):
    return sorted(chain(*[
            BaseModel.objects.filter(thread=thread_id, sender_deleted_at__isnull=True, recipient_deleted_at__isnull=True).order_by('sent_at') for BaseModel
            in [Message, AttachmentInteraction]
        ]), key=attrgetter('sent_at'))

def mark_read(user, thread):
    filter = Q(thread=thread)
    for BaseModel in [Message, AttachmentInteraction]:
        BaseModel.objects.set_read(user, filter)

def get_interaction(interaction_id):
    try:
        return AttachmentInteraction.objects.get(id=interaction_id)
    except AttachmentInteraction.DoesNotExist, e:
        return Message.objects.get(id=interaction_id)


class MessageCount(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        count = Message.objects.inbox_unread_count(request.user)
        return Response({'message_count': count})


class ConversationDetail(generics.RetrieveAPIView):
    queryset = Interaction.objects.all().order_by('sent_at')
    serializer_class = ConversationSerializer
    permission_classes = (IsAuthenticated, IsPartOfConversation)
    #renderer_classes = (JSONRenderer, )


class MessageAPI(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request):
        body = request.data['body']
        recipient = Profile.objects.get(id=request.data['recipient'])
        title = 'New message about {0}'.format(smart_str(request.data['title']))
        project = Project.objects.get(id=request.data['project'])
        job, created = Job.objects.get_or_create(project=project, contractor=request.user )
        new_message = Message.objects.create(
            sender=request.user,
            recipient=recipient,
            body=body,
            subject=title,
        )
        if created:
            terms = Terms.objects.create(job=job)
            nda = Document.objects.create(job=job, type='NDA', )
            new_message.job = job
            new_message.nda = nda
            new_message.project = project
            new_message.terms = terms
            thread = new_message
        else:
            thread = Message.objects.get(job=job)
        new_message.thread = thread
        new_message.save()
        new_message_notification.delay(recipient.id, new_message.id)
        return Response(status=200)

    def new_message(self, thread, user, body):
        recipient = thread.sender if user == thread.recipient else thread.recipient
        return Message.objects.create(
            sender=user,
            recipient=recipient,
            thread=thread,
            body=body,
            subject=thread.subject
        )
        return new_message

    def new_attachment(self, thread, user, attachment, tag):
        recipient = thread.sender if user == thread.recipient else thread.recipient
        file_error = file_validator(attachment)
        if file_error:
            return {
                'error': file_error,
                'interaction': None
            }
        new_interaction = AttachmentInteraction.objects.create(
            sender=user,
            recipient=recipient,
            thread=thread
        )
        Attachment.objects.create(content_object=new_interaction, file=attachment, tag=tag)
        return {
            'error': False,
            'interaction': new_interaction
        }

    def passed_limit(self, thread, user):
        legacy = thread.nda
        return (thread.job.status == 'pending') and not free_messages(thread, user, legacy )['remaining']

    def patch(self, request, thread_id=None):
        thread = Message.objects.get(id = thread_id or request.data['thread'])

        if request.user == thread.sender or request.user == thread.recipient:
            if self.passed_limit(thread, request.user):
                return Response("Unconnected Thread Reply Limit Exceeded", status=403)

            if request.data.has_key('attachment'):
                tag = request.data.get('tag', 'Attachment')
                attachment = self.new_attachment(thread, request.user, request.data['attachment'], tag)
                if attachment['error']:
                    return Response(status=415, data=attachment['error'])
                else:
                    interaction = attachment['interaction']
            else:
                interaction = self.new_message(thread, request.user, request.data['body'])

            # messages updated, so passed message alerts possible
            # we want to do this before serialization
            if self.passed_limit(thread, request.user):
                notify.send(
                    interaction.recipient,
                    recipient=request.user,
                    verb=u'message limit reached for',
                    action_object=thread,
                    target=thread.project,
                    type=u'messageLimitReached'
                )

            serializer = ConversationSerializer(thread, context={'request': request})
            new_message_notification.delay(interaction.recipient.id, interaction.thread.id)
            return Response(serializer.data)
        else:
            return Response(status=403)

    def get(self, request, thread_id=None):
        if thread_id == 'find':
            thread_id = self.find(request)
        messages = all_interactions(thread_id)
        if(len(messages)):
            mark_read(request.user, thread_id)
            if len(messages) and (request.user == messages[0].sender or request.user == messages[0].recipient):
                interactions = map(serialize_interaction, messages)
                serializer = InteractionSerializer(interactions, many=True)
                return Response({'current_user': request.user.id, 'interactions':serializer.data})
        else: # single message
            try:
                serializer = InteractionSerializer(serialize_interaction(get_interaction(thread_id)))
                return Response(serializer.data)
            except Message.DoesNotExist, e:
                return Response(status=404)
        return Response(status=403)

    def find(self, request):
        """
        wrote this like a viewset, then hacked around the fact that this is an ApiView
        attempts to get a unique thread_id based on query. 
        """
        thread_id = None
        try:
            thread_id = Message.objects.get(
                    interaction_ptr_id=F('interaction_ptr__thread_id'),
                    **request.query_params.dict()).id
        except Message.DoesNotExist:
            raise Http404("No Message matches the given query.")
        return thread_id

    def delete(self, request, thread_id):
        try:
            interaction = get_interaction(thread_id)
        except Message.DoesNotExist:
            return Response(status=404)

        if (interaction.recipient == request.user):
            interaction.attachment.delete()
            interaction.recipient_deleted_at = datetime.now()
        elif (interaction.sender == request.user):
            if hasattr(interaction, 'attachment'):
                interaction.attachment.delete()
            interaction.sender_deleted_at = datetime.now()
        else:
            return Response(status=403)

        interaction.save()
        return self.get(request, interaction.thread.id)


class ConnectThreadAPI(APIView):

    def get_or_create_order(self, request, thread):
        try:
            return (True, ProductOrder.objects.get(status='pending', _product='connect_job', related_object_id=thread.job.id))
        except ProductOrder.DoesNotExist:
            serializer = ProductOrderSerializer(data=dict(
                requester=request.user.id,
                _product='connect_job',
                stripe_token=request.data.pop('stripe_token', None),
                promo=request.data.pop('promoCode', None),
                related_object_id=thread.job.id))
            serializer.is_valid()
            return (False, serializer.save())

    def validate_order(self, request, order):
        if order.status == 'failed':
            try:
                detail = json.loads(order.details)
            except:
                detail = order.details
            raise ValidationError(detail)

        if(order.payer == request.user):
            payable, order.details = ensure_order_is_payable(order, stripe_token=request.data.pop('stripe_token', None))
            if not payable:
                default_error_details(order)
                order.save()
                raise ValidationError({ 'error': { 'message': order.details } })
        return order

    def update_order(self, request, thread):
        created, order = self.get_or_create_order(request, thread)
        promo = request.data.pop('promoCode', None)
        if created and promo:
            order._promo = Promo.objects.get(code=promo)
            order.save()
        self.validate_order(request, order)
        if order.requester != request.user:
            order.product.change_status('accepted', order, request.user)

    def new_message(self, thread, user, body):
        recipient = thread.sender if user == thread.recipient else thread.recipient
        return Message.objects.create(
            sender=user,
            recipient=recipient,
            thread=thread,
            body=body,
            subject=thread.subject
        )

    def post(self, request, thread_id):
        thread = Message.objects.get(id = thread_id)
        self.update_order(request, thread)
        thread.refresh_from_db()
        thread.job.refresh_from_db()
        serializer = ConversationSerializer(thread, context={'request': request})
        return Response(serializer.data)
