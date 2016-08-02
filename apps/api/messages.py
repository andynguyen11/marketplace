from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer

from api.serializers.messages import ConversationSerializer
from postman.models import Message


class ConversationDetail(generics.RetrieveAPIView):
    queryset = Message.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = (IsAuthenticated, )
    renderer_classes = (JSONRenderer, )
