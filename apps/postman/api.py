from rest_framework.serializers import ModelSerializer
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer

from postman.models import Message, STATUS_PENDING, STATUS_ACCEPTED
from postman.serializers import ConversationSerializer


class ConversationDetail(generics.RetrieveAPIView):
    queryset = Message.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = (IsAuthenticated, )
    renderer_classes = (JSONRenderer, )