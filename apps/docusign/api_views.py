from django.shortcuts import redirect
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.parsers import BaseParser
from rest_framework.response import Response

from .docusign import parse_webhook_update
from .models import Template, Document, DocumentSigner
from .serializers import TemplateSerializer, DocumentSerializer, SignerSerializer


class TemplateAPI(generics.ListCreateAPIView):
    ""
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer


class DocumentAPI(generics.ListCreateAPIView):
    ""
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer


class SignerAPI(generics.RetrieveUpdateAPIView):
    ""
    def get_queryset(self):
        id = self.request.query_params['id']
        return DocumentSigner.objects.get(id=id)
    serializer_class = SignerSerializer


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
        for signer, update in zip(signers, update['signers']):
            if signer.role.order == update['routing_order']:
                signer.status = update['status']
                signer.save()
        return Response(status=200, data={"message": "Success"})


@api_view(['GET', ])
def signing_url_redirect(request, document):
    try:
        signer = DocumentSigner.objects.get(profile=request.user, document=document)
    except DocumentSigner.DoesNotExist:
        return Response(status=405, data={"message": "Forbidden"})
    signing_url = signer.get_signing_url()
    return redirect(signing_url)
