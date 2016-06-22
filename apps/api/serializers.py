from rest_framework import serializers

from postman.api import MessageSerializer
from accounts.models import Profile
from business.models import Company, Document, Project, ConfidentialInfo, Job
from reviews.models import DeveloperReview
from generics.serializers import RelationalModelSerializer, ParentModelSerializer, AttachmentSerializer
from generics.utils import to_browsable_fieldset, collapse_listview


class JobSerializer(serializers.ModelSerializer):
    job_messages = MessageSerializer(required=False, many=True, read_only=True)

    class Meta:
        model = Job
        fields = ('id', 'project', 'developer', 'equity', 'cash',
                  'hours', 'bid_message', 'files', 'job_messages')


class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile
        exclude = ('is_superuser', 'last_login', 'password', 'is_staff', 'is_active', 'stripe', 'signup_code', 'groups', 'user_permissions', )


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company


class PaymentSerializer(serializers.Serializer):
    brand = serializers.CharField(max_length=100)
    last4 = serializers.CharField(max_length=10)
    exp_month = serializers.CharField(max_length=10)
    exp_year = serializers.CharField(max_length=10)


class DeveloperReviewSerializer(serializers.ModelSerializer):

    class Meta:
        model = DeveloperReview


def field_names(model):
    return tuple(field.name for field in model._meta.fields)


class InfoSerializer(ParentModelSerializer):
    attachments = AttachmentSerializer(many=True, required=False)
    attachment_one = AttachmentSerializer(required=False)
    attachment_two = AttachmentSerializer(required=False)

    class Meta:
        model = ConfidentialInfo
        fields = tuple(['title', 'summary', 'project'] + to_browsable_fieldset('attachment'))
        parent_key = 'confidential_info'
        child_fields = ('attachments',)

    def create(self, data, action='create'):
        data = collapse_listview(data, 'attachment', required_fields=['file'])
        return ParentModelSerializer.create(self, data, action)

    def update(self, instance, data):
        data = collapse_listview(data, 'attachment', required_fields=['file'])
        return ParentModelSerializer.update(self, instance, data)


class ProjectSerializer(ParentModelSerializer):
    confidential_info = AttachmentSerializer(many=True, required=False)

    class Meta:
        model = Project
        fields = field_names(Project) + ('confidential_info', )
        parent_key = 'project'
        child_fields = ('confidential_info',)
