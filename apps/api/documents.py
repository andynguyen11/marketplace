from rest_framework import generics
from django.conf import settings
from api.serializers import DocumentSerializer
from business.models import Document
from rest_framework.response import Response


class DocumentAPI(generics.ListCreateAPIView):
    ""
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

