from django.shortcuts import redirect
from rest_framework import generics, viewsets
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.parsers import BaseParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from generics.viewsets import NestedModelViewSet

from .docusign import parse_webhook_update
from .models import Template, Document, DocumentSigner
from .serializers import TemplateSerializer, DocumentSerializer, SignerSerializer


class TemplateAPI(generics.ListCreateAPIView):
    ""
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    ""
    permission_classes = (IsAuthenticated,)
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer


class SignerViewSet(NestedModelViewSet):
    permission_classes = (IsAuthenticated,)
    queryset = DocumentSigner.objects.all()
    serializer_class = SignerSerializer
    parent_key = 'document'


class RawXMLParser(BaseParser):
    media_type = 'text/xml'

    def parse(self, stream, media_type=None, parser_context=None):
        return stream.read()


class Webhook(APIView):

    parser_classes = (RawXMLParser, )

    def post(self, request, format=None):
        update = parse_webhook_update(request.data)
        document = Document.objects.get(envelope_id=update['envelope_id'])
        document.status = update['status']
        document.save()
        signers = document.signers
        for signer in signers:
            signer.status = update['signers'][signer.profile.id]['status'] or signer.status
            signer.save()
        return Response(status=200, data={"message": "Success"})


@api_view(['GET', ])
def signing_url_redirect(request, document):
    signer_url = Document.objects.get(id=document).get_signer_url(request.user)
    if type(signer_url) in (str, unicode):
        return redirect(signer_url)
    else:
        return Response(status=405, data=signer_url or {"message": "Forbidden"})
