import os
from django.db import models
from django.conf import settings
from django.core.files import File
from django.core.exceptions import ValidationError
from .docusign import create_envelope, Role
import pydocusign

DOCUMENT_STATUS = tuple(
    (status.lower(), status)
    for status in pydocusign.Envelope.STATUS_LIST
)
SIGNER_STATUS = tuple(
    (status.lower(), status)
    for status in pydocusign.Recipient.STATUS_LIST
)

class TemplateRoleTab(models.Model):
    template_role = models.ForeignKey('docusign.TemplateRole', on_delete=models.CASCADE)
    label = models.CharField(max_length=30)

class TemplateRole(models.Model):
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

    @property
    def roles(self):
        return TemplateRole.objects.filter(template=self).order_by('order')

    def __str__(self):
        return '%s, %s ' % (self.template_id, self.name) + \
                '<%s>' % ', '.join([r.role_name for r in self.roles])


class DocumentSignerTab(models.Model):
    template_role_tab = models.ForeignKey('docusign.TemplateRoleTab')
    document_signer = models.ForeignKey('docusign.DocumentSigner')
    value = models.CharField(max_length=100)

    @property
    def label(self):
        return self.template_role_tab.label

    def to_dict(self):
        return {
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
        return self.profile.get_full_name()

    @property
    def tabs(self):
        return DocumentSignerTab.objects.filter(document_signer=self)

    def to_dict(self):
        data = {
            'role_name': self.role_name,
            'email': self.email,
            'name': self.name,
            'status': self.status
        }
        if len(self.tabs):
            data['tabs'] = {
                'textTabs': [tab.to_dict() for tab in self.tabs]
            }
        return data


    def __str__(self):
        return '%s <%s>, %s' % (self.name, self.email, self.role_name)


def fs_path(document, file):
    return settings.MEDIA_ROOT + (
        'doc-' + str(document.id) + '-file-' + file.name
    )

def upload_to(instance, filename):
    return instance.path

class DocumentAttachment(models.Model):
    document = models.ForeignKey('docusign.Document')
    file = models.FileField(upload_to=upload_to)

    @property
    def name(self):
        return self.file.name.split('-file-')[1]

    @property
    def data(self):
        return self.file.read()

    @property
    def path(self):
        return fs_path(self.document, self.file)

class Document(models.Model):
    template = models.ForeignKey('docusign.Template')
    status = models.CharField(max_length=100, default='Sent', choices=DOCUMENT_STATUS)
    envelope_id = models.CharField(max_length=100, null=True, unique=True)

    @property
    def signers(self):
        "Returns the list of Signers who need to sign the document"
        return DocumentSigner.objects.filter(document=self).order_by('role')

    @property
    def attachments(self):
        return DocumentAttachment.objects.filter(document=self)

    @property
    def roles(self):
        return [Role(**signer.to_dict()) for signer in self.signers]

    def send(self):
        self.envelope_id = create_envelope(
                self.template_id,
                self.roles,
                self.template.email_subject,
                self.template.email_blurb,
                attachments=self.attachments,
                signer_return_url=None,
                status=self.status).envelopeId
        self.save()

