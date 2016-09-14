from datetime import timedelta, datetime

from django.db.models import Q
from rest_framework.serializers import ModelSerializer
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.decorators import permission_classes, api_view

from accounts.models import Profile
from business.models import Project, Job, Terms, Document
from generics.models import Attachment
from generics.tasks import new_message_notification
from postman.models import Message, STATUS_PENDING, STATUS_ACCEPTED
from postman.permissions import IsPartOfConversation
from postman.serializers import ConversationSerializer, InteractionSerializer, MessageInteraction, FileInteraction


class ConversationDetail(generics.RetrieveAPIView):
    queryset = Message.objects.all().order_by('sent_at')
    serializer_class = ConversationSerializer
    permission_classes = (IsAuthenticated, IsPartOfConversation)
    renderer_classes = (JSONRenderer, )


class MessageAPI(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request):
        body = request.data['body']
        recipient = Profile.objects.get(id=request.data['recipient'])
        title = 'New message about {0}'.format(request.data['title'])
        project = Project.objects.get(id=request.data['project'])
        job = Job.objects.create(project=project, contractor=request.user )
        terms = Terms.objects.create(job=job)
        nda = Document.objects.create(job=job, type='NDA', )
        new_message = Message.objects.create(
            sender=request.user,
            recipient=recipient,
            body=body,
            subject=title,
            job=job,
            nda=nda,
            terms=terms
        )
        new_message.thread = new_message
        new_message.save()
        new_message_notification.delay(recipient.id, new_message.id)
        return Response(status=200)

    def patch(self, request):
        thread = request.data['thread']
        body = request.data['body']
        attachments = request.data.get('attachments', [])
        message = Message.objects.get(id=thread)
        if request.user == message.sender or request.user == message.recipient:
            unread = Message.objects.filter(
                thread=message,
                read_at__isnull=True
            ).order_by('-read_at')
            recipient = message.sender if request.user == message.recipient else message.recipient
            new_message = Message.objects.create(
                sender=request.user,
                recipient=recipient,
                thread=message,
                body=body,
                subject=message.subject
            )
            if attachments:
                for file in attachments:
                    new_attachement = Attachment.objects.create(content_object=message, file=file)
            serializer = ConversationSerializer(message, context={'request': request})
            new_message_notification.delay(recipient.id, message.id)
            return Response(serializer.data)
        return Response(status=403)

    def get(self, request, thread_id):
        thread = Message.objects.get(id=thread_id)
        messages = Message.objects.filter(thread=thread_id).order_by('sent_at')
        filter = Q(thread=thread_id)
        Message.objects.set_read(request.user, filter)
        if request.user == messages[0].sender or request.user == messages[0].recipient:
            interactions = []
            for file in thread.attachments.filter(deleted=False):
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
            return Response({'current_user': request.user.id, 'interactions':serializer.data})
        return Response(status=403)