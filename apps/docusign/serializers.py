from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from .models import (
        TemplateRoleTab, TemplateRole, Template,
        DocumentSignerTab, DocumentSigner, Document,
        DocumentAttachment )
from .utils import to_browsable_fieldset, collapse_listview, ParentModelSerializer, RelationalModelSerializer

class TabSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemplateRoleTab
        fields = ('label',)

class RoleSerializer(ParentModelSerializer):
    tabs = TabSerializer(many=True, required=False)
    class Meta:
        model = TemplateRole
        fields = ('role_name', 'order', 'tabs')
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
        if not hasattr(obj, 'template_role_tab'):
            obj['template_role_tab'] = TemplateRoleTab.objects.get(
                    label=obj.get('label'),
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
        if not hasattr(obj, 'role'):
            obj['role'] = TemplateRole.objects.get(
                    role_name=obj.get('role_name'),
                    template=obj['document'].template)

        return obj


class AttachmentSerializer(serializers.ModelSerializer):
    file = serializers.FileField(max_length=None, allow_empty_file=False, required=False)
    class Meta:
        model = DocumentSigner
        fields = ('file',)


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

    def create(self, data, action='create'):
        data = collapse_listview(data, 'signer')
        data = collapse_listview(data, 'attachment', required_fields=['file'])
        document = ParentModelSerializer.create(self, data, action)
        document.send()
        return document
