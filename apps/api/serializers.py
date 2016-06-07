from rest_framework import serializers

from business.models import Company, Document

class CompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = Company


class PaymentSerializer(serializers.Serializer):
    brand = serializers.CharField(max_length=100)
    last4 = serializers.CharField(max_length=10)
    exp_month = serializers.CharField(max_length=10)
    exp_year = serializers.CharField(max_length=10)

"""
class DocumentSerializer(serializers.ModelSerializer):
    docusign_document = SignerSerializer(many=True, required=False)
    signer_one = SignerSerializer(required=False)
    signer_two = SignerSerializer(required=False)

    class Meta:
        model = Document
        fields = ('template', 'type', 'status', 'job', 'project',
                'signers', 'signer_one', 'signer_two')

    def create(self, validated_data):
        signers, vaidated_data = extract_signers(validated_data)
        document = Document.objects.create(**validated_data)
        for signer in signers:
            DocumentSigner.objects.create(document=document, **signer)
        document.send()
"""
