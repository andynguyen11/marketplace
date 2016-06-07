from rest_framework import serializers
from .models import TemplateRole, Template, DocumentSigner, Document

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemplateRole
        fields = ('order', 'role_name')

class TemplateSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True)

    class Meta:
        model = Template
        fields = ('template_id', 'description', 'name', 'roles')

    def create(self, validated_data):
        roles = validated_data.pop('roles') or []
        template = Template.objects.create(**validated_data)
        for role in roles:
            TemplateRole.objects.update_or_create(template=template, **role)
        return template

    def update(self, instance, validated_data):
        roles = validated_data.pop('roles') or []
        instance.template_id = validated_data.get('template_id', instance.template_id)
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.save()
        for role in roles:
            TemplateRole.objects.update_or_create(template=instance, **role)
        return instance


class SignerSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentSigner
        fields = ('role', 'profile')

def extract_signers(validated_data):
    signers = validated_data.pop('signers')
    signer_one = validated_data.pop('signer_one') 
    signer_two = validated_data.pop('signer_two') 
    if not signers: signers = []
    if signer_one: signers.append(signer_one)
    if signer_two: signers.append(signer_two)
    return signers, validated_data

class DocumentSerializer(serializers.ModelSerializer):
    signers = SignerSerializer(many=True, required=False)
    signer_one = SignerSerializer(required=False)
    signer_two = SignerSerializer(required=False)

    class Meta:
        model = Document
        fields = ('template', 'status',
                'signers', 'signer_one', 'signer_two')

    def create(self, validated_data):
        signers, validated_data = extract_signers(validated_data)
        document = Document.objects.create(**validated_data)
        for signer in signers:
            DocumentSigner.objects.create(document=document, **signer)
        document.send()
        return document
