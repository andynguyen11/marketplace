from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from rest_framework import generics, viewsets
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.parsers import BaseParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from generics.viewsets import NestedModelViewSet

from notifications.signals import notify

from .docusign import parse_webhook_update
from .models import Template, Document, DocumentSigner
from .serializers import TemplateSerializer, DocumentSerializer, SignerSerializer
from business.models import Document as JobDocument


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


def signal_change(document, signer, new_status):
    if new_status.lower() in tuple('signed'):
        # TODO Revisit this notification signal to reflect a proper target
        notify.send(signer, recipient=document.manager, verb=u'Contract signed', action_object=document)


class Webhook(APIView):

    parser_classes = (RawXMLParser, )

    def post(self, request, format=None):
        update = parse_webhook_update(request.data)
        document = Document.objects.get(envelope_id=update['envelope_id'])
        job_document = JobDocument.objects.get(docusign_document=document)
        document.status = update['status']
        document.save()
        signers = document.signers
        for signer in signers:
            new_status = update['signers'][signer.profile.id]['status']
            print(signer.status, new_status)
            signer.status = new_status or signer.status
            if signer.status == 'sent' and signer.profile.id == job_document.job.contractor.id:
                dev_contact_card_email.delay(job_document.job.id)
            signer.save()
            # TODO Reimplement when this notify signal is refactored properly
            #signal_change(document, signer, new_status)
        return Response(status=200, data={"message": "Success"})


@login_required
@api_view(['GET', ])
def signing_url_redirect(request, document):
    signer_url = Document.objects.get(id=document).get_signer_url(request.user)
    if type(signer_url) in (str, unicode):
        return redirect(signer_url)
    else:
        return Response(status=405, data=signer_url or {"message": "Forbidden"})
