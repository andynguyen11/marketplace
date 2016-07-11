from rest_framework import serializers
from drf_haystack.serializers import HaystackSerializerMixin
from tagulous.serializers.json import Serializer as TagSerializer

from postman.api import MessageSerializer
from accounts.models import Profile
from business.models import Company, Document, Project, ConfidentialInfo, Job
from reviews.models import DeveloperReview
from generics.serializers import RelationalModelSerializer, ParentModelSerializer, AttachmentSerializer
from generics.utils import to_browsable_fieldset, collapse_listview, update_instance, field_names
from api.search_indexes import ProjectIndex

class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile
        exclude = ('is_superuser', 'last_login', 'password', 'is_staff', 'is_active', 'stripe', 'signup_code', 'groups', 'user_permissions', )


class CompanySerializer(serializers.ModelSerializer):
    primary_contact = serializers.PrimaryKeyRelatedField(read_only=True, default=serializers.CurrentUserDefault())
    #category = TagSerializer()
    category = serializers.CharField()

    class Meta:
        model = Company
        fields = field_names(Company, exclude=('stripe',)) + ('category',)

    def create(self, data):
        return Company.objects.create(**data)

    def update(self, instance, data):
        update_instance(instance, data)
        return instance


class PaymentSerializer(serializers.Serializer):
    brand = serializers.CharField(max_length=100)
    last4 = serializers.CharField(max_length=10)
    exp_month = serializers.CharField(max_length=10)
    exp_year = serializers.CharField(max_length=10)


class DeveloperReviewSerializer(serializers.ModelSerializer):

    class Meta:
        model = DeveloperReview


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
    category = serializers.CharField() # TODO - custom tag serializer needed

    class Meta:
        model = Project
        fields = field_names(Project) + ('confidential_info', 'category')
        parent_key = 'project'
        child_fields = ('confidential_info',)


class JobSerializer(ParentModelSerializer):
    job_messages = MessageSerializer(required=False, many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, required=False)
    attachment_one = AttachmentSerializer(required=False)
    attachment_two = AttachmentSerializer(required=False)

    class Meta:
        model = Job
        fields = field_names(Job) + tuple(['job_messages'] + to_browsable_fieldset('attachment'))
        parent_key = 'job'
        child_fields = ('attachments',)

    def create(self, data, action='create'):
        data = collapse_listview(data, 'attachment', required_fields=['file'])
        return ParentModelSerializer.create(self, data, action)

    def update(self, instance, data):
        data = collapse_listview(data, 'attachment', required_fields=['file'])
        return ParentModelSerializer.update(self, instance, data)


class ProjectSearchSerializer(HaystackSerializerMixin, ProjectSerializer):
    class Meta(ProjectSerializer.Meta):
        index_classes = [ProjectIndex]
        search_fields = ("text", )

