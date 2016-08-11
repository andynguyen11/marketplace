from django.conf import settings
from docusign.serializers import TemplateSerializer
from rest_framework.exceptions import ValidationError
from django.core.exceptions import ObjectDoesNotExist
from docusign.docusign import client, all_template_ids
from docusign.models import Template
from docusign.tabs import normalize as normalize_tabs
from generics.utils import normalized_subdict, merge
from generics.external_apis import external_record_upserter

upsert = external_record_upserter(TemplateSerializer, primary_key='template_id')

def normalize(template):
    normalized = normalized_subdict(
            template['envelopeTemplateDefinition'],
            ['templateId', 'name', 'description', 'emailSubject', 'emailBlurb'])
    normalized['roles'] = [{
        'id': str(signer['recipientId']),
        'order': signer['routingOrder'],
        'role_name': signer['roleName'],
        'tabs': normalize_tabs(signer['tabs'])
        } for signer in template.get('recipients', {'signers': []})['signers']]
    return normalized

def load_template_definitions():
    for t in Template.objects.all():
        t.status = 'deleted'
        t.save()

    for id in all_template_ids():
        upsert(normalize((client.get_template(id))))

def run(): load_template_definitions()
