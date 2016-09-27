from datetime import timedelta, datetime

from django.db.models import Q
from rest_framework.serializers import ModelSerializer
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.decorators import permission_classes
from django.db.models import Q
from django.utils.encoding import smart_str

from accounts.models import Profile
from business.models import Project, Job, Terms, Document
from generics.models import Attachment
from generics.tasks import new_message_notification
from generics.validators import file_validator
from postman.models import Message, AttachmentInteraction, STATUS_PENDING, STATUS_ACCEPTED
from postman.permissions import IsPartOfConversation
from postman.serializers import ConversationSerializer, InteractionSerializer, MessageInteraction, FileInteraction, serialize_interaction

from itertools import chain
from operator import attrgetter

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


class ConversationDetail(generics.RetrieveAPIView):
    queryset = Message.objects.all().order_by('sent_at')
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

    def patch(self, request, thread_id=None):
        thread = Message.objects.get(id = thread_id or request.data['thread'])
        if request.user == thread.sender or request.user == thread.recipient:
            if request.data.has_key('attachment'):
                tag = request.data.get('tag', 'Attachment')
                attachment = self.new_attachment(thread, request.user, request.data['attachment'], tag)
                if attachment['error']:
                    return Response(status=415, data=attachment['error'])
                else:
                    interaction = attachment['interaction']
            else:
                interaction = self.new_message(thread, request.user, request.data['body'])
            serializer = ConversationSerializer(thread, context={'request': request})
            new_message_notification.delay(interaction.recipient.id, interaction.thread.id)
            return Response(serializer.data)
        else:
            return Response(status=403)

    def get(self, request, thread_id):
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


