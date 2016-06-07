from django.db import models
from .docusign import create_envelope, role

DOCUMENT_STATUS = (
    (u'sent', u'Sent'),
    (u'received', u'Received'),
    (u'signed', u'Signed'),
)

class TemplateRole(models.Model):
    template = models.ForeignKey('docusign.Template', on_delete=models.CASCADE)
    role_name = models.CharField(max_length=10)
    order = models.IntegerField()
    unique_together = (('template', 'role_name'),)

    def __str__(self):
        return '%s - %d, %s' % (self.template.template_id, self.order, self.role_name)

class Template(models.Model):
    template_id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=100, null=True)
    description = models.CharField(max_length=100, blank=True, null=True)
    email_subject = models.CharField(max_length=100, null=True)
    email_blurb = models.CharField(max_length=500, blank=True, null=True)

    @property
    def roles(self):
        return TemplateRole.objects.filter(template=self).order_by('order')

    def __str__(self):
        return '%s, %s ' % (self.template_id, self.name) + \
                '<%s>' % ', '.join([r.role_name for r in self.roles])


class DocumentSigner(models.Model):
    role = models.ForeignKey('docusign.TemplateRole')
    document = models.ForeignKey('docusign.Document', on_delete=models.CASCADE)
    profile = models.ForeignKey('accounts.Profile')

    @property
    def role_name(self):
        return self.role.role_name

    @property
    def email(self):
        return self.profile.email

    @property
    def name(self):
        return self.profile.get_full_name()

    def to_dict(self):
        return {
            'role_name': self.role_name,
            'email': self.email,
            'name': self.name
        }


    def __str__(self):
        return '%s <%s>, %s' % (self.name, self.email, self.role_name)

class Document(models.Model):
    template = models.ForeignKey('docusign.Template')
    status = models.CharField(max_length=100, default='Sent', choices=DOCUMENT_STATUS)
    envelope_id = models.CharField(max_length=100, null=True, unique=True)

    @property
    def signers(self):
        "Returns the list of Signers who need to sign the document"
        return DocumentSigner.objects.filter(document=self)

    @property
    def roles(self):
        return [role(**signer.to_dict()) for signer in self.signers]

    def send(self):
        self.envelope_id = create_envelope(
                self.template_id,
                self.roles,
                self.template.email_subject,
                self.template.email_blurb,
                signer_return_url=None,
                status='Sent').envelopeId
        self.save()

