from rest_framework.serializers import ModelSerializer
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.decorators import permission_classes, api_view
from django.db.models import Q

from accounts.models import Profile
from business.models import Project, Job, Terms, Document
from generics.models import Attachment
from postman.models import Message, AttachmentInteraction, STATUS_PENDING, STATUS_ACCEPTED
from postman.permissions import IsPartOfConversation
from postman.serializers import ConversationSerializer, InteractionSerializer, MessageInteraction, FileInteraction

from itertools import chain
from operator import attrgetter

def all_interactions(thread_id):
    return sorted(chain(*[
            BaseModel.objects.filter(thread=thread_id).order_by('sent_at') for BaseModel
            in [Message, AttachmentInteraction]
        ]), key=attrgetter('sent_at'))

def mark_read(user, thread):
    filter = Q(thread=thread)
    for BaseModel in [Message, AttachmentInteraction]:
        BaseModel.objects.set_read(user, filter)


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
        return Response(status=200)

    def new_message(self, thread, user, body):
        recipient = thread.sender if user == thread.recipient else thread.recipient
        new_message = Message.objects.create(
            sender=user,
            recipient=recipient,
            thread=thread,
            body=body,
            subject=thread.subject
        )

    def new_attachment(self, thread, user, attachment):
        recipient = thread.sender if user == thread.recipient else thread.recipient
        new_interaction = AttachmentInteraction.objects.create(
            sender=user,
            recipient=recipient,
            thread=thread
        )
        Attachment.objects.create(content_object=new_interaction, file=attachment, tag='message')

    def patch(self, request, thread_id=None):
        thread = Message.objects.get(id = thread_id or request.data['thread'])
        if request.user == thread.sender or request.user == thread.recipient:
            if request.data.has_key('attachment'):
                self.new_attachment(thread, request.user, request.data['attachment'])
            else:
                self.new_message(thread, request.user, request.data['body'])
            serializer = ConversationSerializer(thread, context={'request': request})

            #unread = Message.objects.filter(
            #    thread=thread,
            #    read_at__isnull=True
            #).order_by('-read_at')

            #if not unread:
            #    send_mail('new-message', [recipient], {})

            return Response(serializer.data)
        else:
            return Response(status=403)

    def serialize_interaction(self, message):
        if hasattr(message, 'attachment'):
            return FileInteraction(
                    sender=message.sender,
                    recipient=message.recipient,
                    timestamp=message.sent_at,
                    content=message.attachment.url,
                    attachment=message.attachment)
        else:
            return MessageInteraction(
                    sender=message.sender,
                    recipient=message.recipient,
                    timestamp=message.sent_at,
                    content=message.body)

    def get(self, request, thread_id):
        #thread_id = Message.objects.get(id=thread_id).thread
        messages = all_interactions(thread_id)
        mark_read(request.user, thread_id)
        if len(messages) and (request.user == messages[0].sender or request.user == messages[0].recipient):
            interactions = map(self.serialize_interaction, messages)
            serializer = InteractionSerializer(interactions, many=True)
            return Response({'current_user': request.user.id, 'interactions':serializer.data})
        return Response(status=403)
