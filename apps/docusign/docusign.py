import pydocusign
from django.conf import settings

client = pydocusign.DocuSignClient( **settings.DOCUSIGN ) 
client.login_information()

def all_template_ids():
    if not client.account_url:
        client.login_information()
    return [
        t['templateId'] for t
        in client.get(
            '/accounts/%s/templates' % client.account_id
            )['envelopeTemplates']
    ]


def role(email, name, role_name):
    return pydocusign.Role(
        email=email,
        name=name,
        roleName=role_name,
    )

def create_envelope( template_id, roles, email_subject, email_blurb, signer_return_url=None, status='Sent'):
    """
    creates an envelope with the template_id filled in with the given roles.
    default status is 'Sent', which will automatically send the envelope to the first recipient on creation.
    """
    envelope = pydocusign.Envelope(
        emailSubject=email_subject,
        emailBlurb=email_blurb,
        status=status,
        templateId=template_id,
        templateRoles=roles,
    )
    client.create_envelope_from_template(envelope)
    return envelope
