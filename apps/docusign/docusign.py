import pydocusign, base64, os

from django.conf import settings

from generics.external_apis import LazyClient


def get_logged_in_client():
    client = None
    try:
        client = pydocusign.DocuSignClient( **settings.DOCUSIGN ) 
        client.login_information()

    except pydocusign.exceptions.DocuSignException, e:
        print """
        DocuSign API unavailable due to incorrect/missing environment variables.
        Attempts to call the api will throw exceptions."""
        pass
    return client

client = LazyClient(get_logged_in_client)


def all_template_ids():
    if not client.account_url:
        client.login_information()
    return [
        t['templateId'] for t
        in client.get(
            '/accounts/%s/templates' % client.account_id
            )['envelopeTemplates']
    ]


class Parser(pydocusign.DocuSignCallbackParser):
    @property
    def recipients(self):
        recipients = []
        for recipient_soup in self.xml_soup.EnvelopeStatus \
                                           .RecipientStatuses \
                                           .children:
            try:
                recipient_soup.children
            except AttributeError:  # Not a node.
                continue
            recipient = {}
            # Assign.
            for child_soup in recipient_soup.children:
                if not child_soup.name:
                    continue
                if child_soup.string is None:
                    continue
                recipient[child_soup.name] = child_soup.string
            # Transform.
            recipient['RoutingOrder'] = int(recipient['RoutingOrder'])
            for status in pydocusign.Recipient.STATUS_LIST:
                try:
                    if status == 'Completed':
                        recipient[status] = self.datetime(recipient['Signed'])
                    else:
                        recipient[status] = self.datetime(recipient[status])
                except KeyError:
                    pass
            # Register.
            recipients.append(recipient)
        # Sort by routing order.
        recipients.sort(lambda a, b: cmp(a['RoutingOrder'], b['RoutingOrder']))
        return recipients


def parse_webhook_update(xml):
    parser = Parser(xml)
    signer_updates = [ {
        'routing_order': int(signer['RoutingOrder']),
        'status': signer['Status'].lower(),
        } for signer in parser.recipients]
    return {
        'envelope_id': parser.envelope_id,
        'status': parser.envelope_status.lower(),
        'signers': signer_updates
    }


class Role(pydocusign.Role):
    def __init__(self, email, name, role_name, client_id, tabs=[], **kwargs):
        super(Role, self).__init__(
            email=email,
            name=name,
            roleName=role_name,
            clientUserId=client_id
        )
        self.tabs = tabs


    def to_dict(self):
        d = pydocusign.Role.to_dict(self)
        if(len(self.tabs)):
            d['tabs'] = self.tabs
        return d


def document(attachment, index):
    return {
        "documentId": 10 + index, 
        "name": attachment.name,
        "fileExtension": os.path.splitext(attachment.name)[1][1:],
        "documentBase64": base64.b64encode(attachment.data)
    }


def put_envelope_attachments(envelope, attachments):
    return client._request('/accounts/%s/envelopes/%s/documents' % (
        client.account_id, envelope.envelopeId
    ), data={'documents': attachments}, method='PUT')


def update_envelope(envelope, **kwargs):
    return client._request('/accounts/%s/envelopes/%s' % (
        client.account_id, envelope.envelopeId
    ), data=kwargs, method='PUT')


def initial_status(status, attachments):
    return 'created' if status.lower() == 'sent' and len(attachments) else status

event_notification = pydocusign.EventNotification(
    url = settings.WEBHOOK_BASE_URL + '/api/docusign/webhook'
)


def create_envelope( template_id, roles, email_subject, email_blurb, attachments=[],signer_return_url=None, status='Sent'):
    """
    creates an envelope with the template_id filled in with the given roles.
    default status is 'sent', which will automatically send the envelope to the first recipient on creation.
    """
    envelope = pydocusign.Envelope(
        emailSubject=email_subject,
        emailBlurb=email_blurb,
        eventNotification=event_notification,
        status=initial_status(status, attachments),
        templateId=template_id,
        templateRoles=roles,
    )
    client.create_envelope_from_template(envelope)
    if len(attachments):
        put_envelope_attachments(envelope, [document(doc, index) for index, doc in enumerate(attachments)])
    if initial_status(status, attachments) != status:
        update_envelope(envelope, status=status)
    return envelope
