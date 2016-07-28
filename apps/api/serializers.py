import json
from notifications.signals import notify

from rest_framework import serializers
from drf_haystack.serializers import HaystackSerializerMixin
from tagulous.serializers.json import Serializer as TagSerializer
from social.apps.django_app.default.models import UserSocialAuth

from postman.api import pm_write
from expertratings.serializers import SkillTestSerializer as ERSkillTestSerializer, SkillTestResultSerializer
from accounts.models import Profile, Skills, SkillTest
from business.models import Company, Document, Project, ProjectInfo, Job, Employee, Document
from reviews.models import DeveloperReview
from generics.serializers import RelationalModelSerializer, ParentModelSerializer, AttachmentSerializer
from generics.utils import to_browsable_fieldset, collapse_listview, update_instance, field_names
from api.search_indexes import ProjectIndex
from html_json_forms.serializers import JSONFormSerializer


class SocialSerializer(serializers.ModelSerializer):
    extra_data = serializers.JSONField()

    class Meta:
        model = UserSocialAuth


class DocumentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Document


class SkillsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Skills
        exclude = ('protected', 'slug', )


class ProfileSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    linkedin = serializers.SerializerMethodField()
    all_skills = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        exclude = ('is_superuser', 'last_login', 'date_joined', 'is_staff', 'is_active', 'stripe', 'signup_code', 'groups', 'user_permissions', )

    def get_photo_url(self, obj):
        return obj.get_photo

    def get_linkedin(self, obj):
        serializer = SocialSerializer(obj.linkedin)
        return serializer.data

    def get_all_skills(self, obj):
        serializer = SkillsSerializer(Skills.objects.all(), many=True)
        return serializer.data


class SkillTestSerializer(serializers.ModelSerializer):

    skills = serializers.CharField()
    test_details = ERSkillTestSerializer(read_only=True)
    results = SkillTestResultSerializer(many=True, read_only=True)

    class Meta:
        model = SkillTest
        fields = field_names(SkillTest) + ('skills', 'results', 'test_details')

    def create(self, data):
        test = super(SkillTestSerializer, self).create(data)
        test.create_ticket()
        return test

    def update(self, instance, data):
        update_instance(instance, data)
        instance.create_ticket()
        return instance


class CompanySerializer(serializers.ModelSerializer):
    #primary_contact = serializers.PrimaryKeyRelatedField(read_only=True, default=serializers.CurrentUserDefault())
    #category = serializers.CharField()

    class Meta:
        model = Company
        fields = field_names(Company, exclude=('stripe',)) + ('type',)

    def create(self, data):
        user = self.context['request'].user
        company = Company.objects.create(**data)
        Employee.objects.create(profile=user, company=company, primary=True)
        return company

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
    title = serializers.CharField(required=False)
    type = serializers.CharField(required=False)
    project = serializers.PrimaryKeyRelatedField(required=False, queryset=Project.objects.all())

    class Meta:
        model = ProjectInfo
        fields = field_names(ProjectInfo) + ('attachments',)
        parent_key = 'info'
        child_fields = ('attachments',)


class ProjectSerializer(JSONFormSerializer, ParentModelSerializer):
    info = InfoSerializer(many=True, required=False)
    details = InfoSerializer(required=False)
    category = serializers.CharField(required=False) # TODO - custom tag serializer needed

    class Meta:
        model = Project
        fields = field_names(Project) + ('info', 'details', 'category')
        parent_key = 'project'
        child_fields = ('info',)

    def create(self, data, action='create'):
        details = dict(type='primary', title='Project Overview', **data.pop('details', {}))
        data['info'] = data.pop('info', [])
        data['info'].append(details)
        project = super(ProjectSerializer, self).create(data, action)
        return project


class JobSerializer(serializers.ModelSerializer):
    message = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Job
        fields = field_names(Job) + ('message',)

    def create(self, data):
        msg = data.pop('message')
        job = Job.objects.create(**data)
        message = pm_write(
            sender=job.developer,
            recipient=job.project.project_manager,
            subject='New Bid from {0} for {1}'.format(job.developer.first_name or job.developer.email, job.project.title),
            body=msg,
            job=job
        )
        notify.send(message.recipient, recipient=message.recipient, verb=u'received a new bid', action_object=job)
        return job


class ProjectSearchSerializer(HaystackSerializerMixin, ProjectSerializer):
    class Meta(ProjectSerializer.Meta):
        index_classes = [ProjectIndex]
        search_fields = ("text", )

