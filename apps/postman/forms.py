"""
You may define your own custom forms, based or inspired by the following ones.

Examples of customization:
    recipients = CommaSeparatedUserField(label=("Recipients", "Recipient"),
        min=2,
        max=5,
        user_filter=my_user_filter,
        channel='my_channel',
    )
    can_overwrite_limits = False
    exchange_filter = staticmethod(my_exchange_filter)

"""
from __future__ import unicode_literals
import json

from django import forms
from django.conf import settings
try:
    from django.contrib.auth import get_user_model  # Django 1.5
except ImportError:
    from postman.future_1_5 import get_user_model
from django.db import transaction
from django.utils.translation import ugettext, ugettext_lazy as _
from multiupload.fields import MultiFileField
from notifications.signals import notify
from rest_framework.parsers import JSONParser

from business.models import Document
from docusign.serializers import DocumentSerializer
from postman.fields import CommaSeparatedUserField
from postman.models import Message, get_user_name
from postman.utils import WRAP_WIDTH
from generics.models import Attachment
from generics.validators import file_validator


def build_payload(sender, recipient, terms):
    """
    TODO This is a dirty dirty way to build the payload.  Will need to map template roles to profile fields,
    and dynamically build based on template
    """
    compensation = ''
    cash = ''
    equity = ''
    if terms.job.equity:
        equity = "{0}% Equity".format(terms.job.equity)
    if terms.job.cash:
        cash = "${0} Cash".format(terms.job.cash)
    if equity and cash:
        compensation = "{0} and {1}".format(equity, cash)
    else:
        compensation = cash if cash else equity

    return {
        'template': '054c2981-9e38-42ac-8451-f8b43230ccea',
        'status': 'new',
        'job': terms.job.id,
        'type': 'MSA',
        'signers': [
            {
                'role_name': 'Contractee',
                'profile': sender.id,
                'tabs': [
                    {
                        'label': 'Company',
                        'value': terms.contractee
                    },
                    {
                        'label': 'Title',
                        'value': sender.title
                    },
                    {
                        'label': 'FullName',
                        'value': '{0} {1}'.format(sender.first_name, sender.last_name)
                    },
                    {
                        'label': 'Compensation',
                        'value': compensation
                    },
                    {
                        'label': 'CompensationSchedule',
                        'value': terms.schedule
                    },
                    {
                        'label': 'Scope',
                        'value': terms.scope
                    },
                    {
                        'label': 'Deliverables',
                        'value': terms.deliverables
                    },
                    {
                        'label': 'Milestones',
                        'value': terms.milestones
                    },
                    {
                        'label': 'ContractorAddress',
                        'value': terms.contractor
                    },
                    {
                        'label': 'Contractor',
                        'value': '{0} {1}'.format(recipient.first_name, recipient.last_name)
                    },
                    {
                        'label': 'ContractorTitle',
                        'value': '{0} Developer'.format(recipient.role.capitalize()) if recipient.role else ''
                    },
                    {
                        'label': 'ProjectEndDate',
                        'value': terms.end_date
                    },
                    {
                        'label': 'ContractorEmail',
                        'value': recipient.email
                    }

                ]
            },
            {
                'role_name': 'Contractor',
                'profile': recipient.id
            }
        ]
    }


class BaseWriteForm(forms.ModelForm):
    """The base class for other forms."""
    attachments = MultiFileField(validators=[file_validator, ], required=False)
    nda = forms.BooleanField(required=False)
    document = forms.BooleanField(required=False)

    class Meta:
        model = Message
        fields = ('body',)
        widgets = {
            # for better confort, ensure a 'cols' of at least
            # the 'width' of the body quote formatter.
            'body': forms.Textarea(attrs={'cols': WRAP_WIDTH, 'rows': 12}),
        }

    error_css_class = 'error'
    required_css_class = 'required'

    def __init__(self, *args, **kwargs):
        sender = kwargs.pop('sender', None)
        exchange_filter = kwargs.pop('exchange_filter', None)
        user_filter = kwargs.pop('user_filter', None)
        max = kwargs.pop('max', None)
        channel = kwargs.pop('channel', None)
        self.site = kwargs.pop('site', None)
        super(BaseWriteForm, self).__init__(*args, **kwargs)

        self.instance.sender = sender if (sender and sender.is_authenticated()) else None
        if exchange_filter:
            self.exchange_filter = exchange_filter
        if 'recipients' in self.fields:
            if user_filter and hasattr(self.fields['recipients'], 'user_filter'):
                self.fields['recipients'].user_filter = user_filter

            if getattr(settings, 'POSTMAN_DISALLOW_MULTIRECIPIENTS', False):
                max = 1
            if max is not None and hasattr(self.fields['recipients'], 'set_max') \
            and getattr(self, 'can_overwrite_limits', True):
                self.fields['recipients'].set_max(max)

            if channel and hasattr(self.fields['recipients'], 'set_arg'):
                self.fields['recipients'].set_arg(channel)

    error_messages = {
        'filtered': _("Writing to some users is not possible: {users}."),
        'filtered_user': _("{username}"),
        'filtered_user_with_reason': _("{username} ({reason})"),
    }
    def clean_recipients(self):
        """Check no filter prohibits the exchange."""
        recipients = self.cleaned_data['recipients']
        exchange_filter = getattr(self, 'exchange_filter', None)
        if exchange_filter:
            errors = []
            filtered_names = []
            recipients_list = recipients[:]
            for u in recipients_list:
                try:
                    reason = exchange_filter(self.instance.sender, u, recipients_list)
                    if reason is not None:
                        recipients.remove(u)
                        filtered_names.append(
                            self.error_messages[
                                'filtered_user_with_reason' if reason else 'filtered_user'
                            ].format(username=get_user_name(u), reason=reason)
                        )
                except forms.ValidationError as e:
                    recipients.remove(u)
                    errors.extend(e.messages)
            if filtered_names:
                errors.append(self.error_messages['filtered'].format(users=', '.join(filtered_names)))
            if errors:
                raise forms.ValidationError(errors)
        return recipients

    def save(self, recipient=None, parent=None, auto_moderators=[]):
        """
        Save as many messages as there are recipients.

        Additional actions:
        - If it's a reply, build a conversation
        - Call auto-moderators
        - Notify parties if needed

        Return False if one of the messages is rejected.

        """
        recipients = self.cleaned_data.get('recipients', [])
        attachments = self.cleaned_data.get('attachments')
        nda = self.cleaned_data.get('nda')
        document = self.cleaned_data.get('document')

        if parent and not parent.thread_id:  # at the very first reply, make it a conversation
            parent.thread = parent
            parent.save()
            # but delay the setting of parent.replied_at to the moderation step
        if parent:
            self.instance.parent = parent
            self.instance.thread_id = parent.thread_id
            self.instance.recipient_bookmarked = parent.recipient_bookmarked
            self.instance.sender_bookmarked = parent.sender_bookmarked
        initial_moderation = self.instance.get_moderation()
        initial_dates = self.instance.get_dates()
        initial_status = self.instance.moderation_status
        if recipient:
            if isinstance(recipient, get_user_model()) and recipient in recipients:
                recipients.remove(recipient)
            recipients.insert(0, recipient)
        is_successful = True
        for r in recipients:
            if isinstance(r, get_user_model()):
                self.instance.recipient = r
            else:
                self.instance.recipient = None
                self.instance.email = r
            self.instance.pk = None  # force_insert=True is not accessible from here
            self.instance.auto_moderate(auto_moderators)
            self.instance.clean_moderation(initial_status)
            self.instance.clean_for_visitor()
            m = super(BaseWriteForm, self).save()
            if attachments:
                for file in attachments:
                    new_attachement = Attachment.objects.create(content_object=m, file=file)
            if nda:
                new_nda, created = Document.objects.get_or_create(
                    type='Non-Disclosure',
                    job=self.instance.thread.job,
                    project=self.instance.thread.project
                )
                notify.create(
                    self.instance.recipient,
                    recipient=self.instance.recipient,
                    verb=u'received an NDA to sign',
                    action_object=new_nda
                )
                m.nda = new_nda
                m.save()
            if document:
                #TODO Refactor for new document workflow
                payload = build_payload(self.instance.sender, self.instance.recipient, self.instance.thread.job)
                serializer = DocumentSerializer(data=payload)
                serializer.is_valid(raise_exception=True)
                new_document = serializer.create(serializer.validated_data)
                m.document = new_document
                m.save()
            if self.instance.is_rejected():
                is_successful = False
            self.instance.update_parent(initial_status)
            self.instance.notify_users(initial_status, self.site)
            # some resets for next reuse
            if not isinstance(r, get_user_model()):
                self.instance.email = ''
            self.instance.set_moderation(*initial_moderation)
            self.instance.set_dates(*initial_dates)
        return is_successful
    # commit_on_success() is deprecated in Django 1.6 and will be removed in Django 1.8
    save = transaction.atomic(save) if hasattr(transaction, 'atomic') else transaction.commit_on_success(save)


class WriteForm(BaseWriteForm):
    """The form for an authenticated user, to compose a message."""
    # specify help_text only to avoid the possible default 'Enter text to search.' of ajax_select v1.2.5
    recipients = CommaSeparatedUserField(label=(_("Recipients"), _("Recipient")), help_text='')

    class Meta(BaseWriteForm.Meta):
        fields = ('recipients', 'subject', 'body')


class AnonymousWriteForm(BaseWriteForm):
    """The form for an anonymous user, to compose a message."""
    # The 'max' customization should not be permitted here.
    # The features available to anonymous users should be kept to the strict minimum.
    can_overwrite_limits = False

    email = forms.EmailField(label=_("Email"))
    recipients = CommaSeparatedUserField(label=(_("Recipients"), _("Recipient")), help_text='', max=1)  # one recipient is enough

    class Meta(BaseWriteForm.Meta):
        fields = ('email', 'recipients', 'subject', 'body')


class BaseReplyForm(BaseWriteForm):
    """The base class for a reply to a message."""
    def __init__(self, *args, **kwargs):
        recipient = kwargs.pop('recipient', None)
        super(BaseReplyForm, self).__init__(*args, **kwargs)
        self.recipient = recipient

    def clean(self):
        """Check that the recipient is correctly initialized and no filter prohibits the exchange."""
        if not self.recipient:
            raise forms.ValidationError(ugettext("Undefined recipient."))

        exchange_filter = getattr(self, 'exchange_filter', None)
        if exchange_filter and isinstance(self.recipient, get_user_model()):
            try:
                reason = exchange_filter(self.instance.sender, self.recipient, None)
                if reason is not None:
                    raise forms.ValidationError(self.error_messages['filtered'].format(
                        users=self.error_messages[
                            'filtered_user_with_reason' if reason else 'filtered_user'
                        ].format(username=get_user_name(self.recipient), reason=reason)
                    ))
            except forms.ValidationError as e:
                raise forms.ValidationError(e.messages)
        return super(BaseReplyForm, self).clean()

    def save(self, *args, **kwargs):
        return super(BaseReplyForm, self).save(self.recipient, *args, **kwargs)


class QuickReplyForm(BaseReplyForm):
    """
    The form to use in the view of a message or a conversation, for a quick reply.

    The recipient is imposed and a default value for the subject will be provided.

    """
    pass


allow_copies = not getattr(settings, 'POSTMAN_DISALLOW_COPIES_ON_REPLY', False)
class FullReplyForm(BaseReplyForm):
    """The complete reply form."""
    if allow_copies:
        recipients = CommaSeparatedUserField(
            label=(_("Additional recipients"), _("Additional recipient")), help_text='', required=False)

    class Meta(BaseReplyForm.Meta):
        fields = (['recipients'] if allow_copies else []) + ['subject', 'body']
