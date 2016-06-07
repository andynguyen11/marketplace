from django.conf.urls import patterns, url
from rest_framework import generics

from .serializers import TemplateSerializer, DocumentSerializer
from .models import Template, Document

class TemplateAPI(generics.ListCreateAPIView):
    ""
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer

class DocumentAPI(generics.ListCreateAPIView):
    ""
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer


urlpatterns = patterns(
    'apps.docusign',
    url(r'template/$', view=TemplateAPI.as_view(), name='template'),
    url(r'document/$', view=DocumentAPI.as_view(), name='document'),
)
