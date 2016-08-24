import os
import pydocusign

from django.db import models
from django.conf import settings
from django.core.files import File
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.fields import GenericRelation
from generics.models import Attachment

from .docusign import create_envelope, Role, client, parse_exception
from .tabs import TAB_TYPES, classify as classify_tab
from business.models import Document as UserDocument


DOCUMENT_STATUS = tuple(
    (status.lower(), status)
    for status in pydocusign.Envelope.STATUS_LIST
)
SIGNER_STATUS = tuple(
    (status.lower(), status)
    for status in pydocusign.Recipient.STATUS_LIST
)
TEMPLATE_STATUS = (
    ('valid', 'still exists in docusign'),
    ('deleted', 'was removed from docusign')
)


class TemplateRoleTab(models.Model):
    type = models.CharField(max_length=30, choices=TAB_TYPES)
    template_role = models.ForeignKey('docusign.TemplateRole', on_delete=models.CASCADE)
    label = models.CharField(max_length=50)


class TemplateRole(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    template = models.ForeignKey('docusign.Template', on_delete=models.CASCADE)
    role_name = models.CharField(max_length=30)
    order = models.IntegerField()
    unique_together = (('template', 'role_name'),)

    @property
    def tabs(self):
        return TemplateRoleTab.objects.filter(template_role=self)

    def __str__(self):
        return '%s - %d, %s' % (self.template.template_id, self.order, self.role_name)


class Template(models.Model):
    template_id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=100, null=True)
    description = models.CharField(max_length=100, blank=True, null=True)
    email_subject = models.CharField(max_length=100, null=True)
    email_blurb = models.CharField(max_length=500, blank=True, null=True)
    note = models.CharField(max_length=1000, blank=True, null=True)

    status = models.CharField(max_length=1000, choices=TEMPLATE_STATUS)

    @property
    def roles(self):
        return TemplateRole.objects.filter(template=self).order_by('order')

    def __str__(self):
        return '%s, %s ' % (self.template_id, self.name) + \
                '<%s>' % ', '.join([r.role_name for r in self.roles])

class DocumentSignerTab(models.Model):
    template_role_tab = models.ForeignKey('docusign.TemplateRoleTab')
    document_signer = models.ForeignKey('docusign.DocumentSigner')
    value = models.TextField()

    @property
    def label(self):
        return self.template_role_tab.label

    @property
    def type(self):
        return self.template_role_tab.type

    def to_dict(self):
        return {
            'type': self.type,
            'tabLabel': '\\*' +  self.label,
            'value': self.value,
        }


class DocumentSigner(models.Model):
    role = models.ForeignKey('docusign.TemplateRole')
    document = models.ForeignKey('docusign.Document', on_delete=models.CASCADE)
    profile = models.ForeignKey('accounts.Profile')
    status = models.CharField(max_length=10, null=True, choices=SIGNER_STATUS)

    @property
    def role_name(self):
        return self.role.role_name

    @property
    def routing_order(self):
        return self.role.order

    @property
    def email(self):
        return self.profile.email

    @property
    def name(self):
        return self.profile.get_full_name() or self.profile.username

    @property
    def tabs(self):
        return DocumentSignerTab.objects.filter(document_signer=self)

    def to_dict(self):
        data = {
            'role_name': self.role_name,
            'email': self.email,
            'name': self.name,
            'status': self.status,
            'client_id': self.profile.id
        }
        if len(self.tabs):
            data['tabs'] = reduce(
                    classify_tab,
                    [tab.to_dict() for tab in self.tabs],
                    {})
        return data

    @property
    def signing_url(self):
        envelope = pydocusign.Envelope(envelopeId=self.document.envelope_id)
        signing_url = envelope.post_recipient_view(
            recipient=Role(**self.to_dict()),
            returnUrl=settings.BASE_URL + '/profile/documents/',
            client=client
        )
        return signing_url

    def __str__(self):
        return '%s <%s>, %s' % (self.name, self.email, self.role_name)


class Document(models.Model):
    template = models.ForeignKey('docusign.Template')
    status = models.CharField(max_length=100, default='sent', choices=DOCUMENT_STATUS)
    envelope_id = models.CharField(max_length=100, null=True, unique=True)
    attachments = GenericRelation(Attachment, related_query_name='docusign_document')

    @property
    def signers(self):
        "Returns the list of Signers who need to sign the document"
        return DocumentSigner.objects.filter(document=self).order_by('-role')

    @property
    def roles(self):
        return [Role(**signer.to_dict()) for signer in self.signers]

    def get_signer_url(self, profile):
        try:
            return DocumentSigner.objects.get(profile=profile, document=self).signing_url
        except DocumentSigner.DoesNotExist:
            return None
        except pydocusign.exceptions.DocuSignException, e:
            error = parse_exception(e)
            if error['code'] == 400: # The token for an out of sequence recipient cannot be generated.
                return None
            else:
                raise e
    @property
    def signing_url(self):
        return '/api/docusign/signing/redirect/%s' % self.id

    def create(self):
        self.envelope_id = create_envelope(
                self.template_id,
                self.roles,
                self.template.email_subject,
                self.template.email_blurb,
                attachments=self.attachments.all(),
                signer_return_url=None,
                status=self.status).envelopeId
        self.save()


