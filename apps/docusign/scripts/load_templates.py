from django.conf import settings
from docusign.serializers import TemplateSerializer
from rest_framework.exceptions import ValidationError
from django.core.exceptions import ObjectDoesNotExist
from docusign.docusign import client, all_template_ids
from docusign.models import Template
from docusign.tabs import normalize as normalize_tabs

def upsert(template):
    template['status'] = 'valid'
    try:
        existing = Template.objects.get(template_id=template['template_id'])
        serializer = TemplateSerializer(existing, data=template, partial=True)
    except ObjectDoesNotExist, e: 
        serializer = TemplateSerializer(data=template)

    try: 
        serializer.is_valid(raise_exception=True)
    except ValidationError, e:
        err = '\n'.join([
            key + ': ' + ', '.join(map(str, e.detail[key]))
            for key in e.detail.keys()
        ])
        raise ValidationError(err)

    return serializer.save()

def save_docusign_template(template):
    template_definition = template['envelopeTemplateDefinition']

    for t in Template.objects.all():
        t.status = 'deleted'
        t.save()

    upsert({
        'template_id': template_definition['templateId'],
        'name': template_definition['name'],
        'description': template_definition['description'],
        'email_subject': template['emailSubject'],
        'email_blurb': template['emailBlurb'],
        'roles': [
            {
                'id': str(signer['recipientId']),
                'order': signer['routingOrder'],
                'role_name': signer['roleName'],
                'tabs': normalize_tabs(signer['tabs'])
            } for signer in template['recipients']['signers']
        ]
    })

def load_template_definitions():
    for id in all_template_ids():
        save_docusign_template(client.get_template(id))

def run(): load_template_definitions()
