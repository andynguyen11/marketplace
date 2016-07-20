from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from .models import (
        TemplateRoleTab, TemplateRole, Template,
        DocumentSignerTab, DocumentSigner, Document )

from generics.utils import to_browsable_fieldset, collapse_listview
from generics.serializers import RelationalModelSerializer, ParentModelSerializer, AttachmentSerializer

class TabSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemplateRoleTab
        fields = ('label', 'type')

class RoleSerializer(ParentModelSerializer):
    tabs = TabSerializer(many=True, required=False)
    class Meta:
        model = TemplateRole
        fields = ('role_name', 'id', 'order', 'tabs')
        parent_key = 'template_role'
        child_fields = ('tabs',)

class TemplateSerializer(ParentModelSerializer):
    roles = RoleSerializer(many=True)

    class Meta:
        model = Template
        fields = ('template_id', 'description', 'name', 'roles')
        parent_key = 'template'
        child_fields = ('roles',)


class SignerTabSerializer(RelationalModelSerializer):
    label = serializers.CharField(required=False)
    template_role_tab = serializers.PrimaryKeyRelatedField(queryset=TemplateRoleTab.objects.all(), required=False)

    class Meta:
        model = DocumentSignerTab
        fields = ('label', 'value', 'template_role_tab')

    def resolve_relations(self, obj):
        if not obj.get('template_role_tab', None):
            obj['template_role_tab'] = TemplateRoleTab.objects.get(
                    label=obj.get('label', None),
                    template_role=obj['document_signer'].role)
        return obj

class SignerSerializer(ParentModelSerializer):
    tabs = SignerTabSerializer(many=True, required=False)
    role = serializers.PrimaryKeyRelatedField(queryset=TemplateRole.objects.all(), required=False)
    role_name = serializers.CharField(required=False)
    status = serializers.CharField(required=False, read_only=True)

    class Meta:
        model = DocumentSigner
        fields = ('role', 'role_name', 'profile', 'tabs', 'status')
        parent_key = 'document_signer'
        child_fields = ('tabs',)

    def resolve_relations(self, obj):
        if not obj.get('role', None):
            obj['role'] = TemplateRole.objects.get(
                    role_name=obj.get('role_name', None),
                    template=obj['document'].template)

        return obj


class DocumentSerializer(ParentModelSerializer):
    signers = SignerSerializer(many=True)
    signer_one = SignerSerializer(required=False) # for testing in the BrowsableAPI
    signer_two = SignerSerializer(required=False)

    attachments = AttachmentSerializer(many=True, required=False)
    attachment_one = AttachmentSerializer(required=False)
    attachment_two = AttachmentSerializer(required=False)

    class Meta:
        model = Document
        fields = tuple(['template', 'status'] + 
                to_browsable_fieldset('signer') +
                to_browsable_fieldset('attachment'))
        parent_key = 'document'
        child_fields = ('signers', 'attachments')

    def collapse_data(self, data):
        data = collapse_listview(data, 'signer')
        data = collapse_listview(data, 'attachment', required_fields=['file'])
        return data

    def create(self, data, action='create'):
        data = self.collapse_data(data)
        document = ParentModelSerializer.create(self, data, action)
        document.send()
        return document

    def update(self, instance, data):
        data = self.collapse_data(data)
        document = ParentModelSerializer.update(self, instance, data)
        document.send()
        return document
