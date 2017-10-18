import simplejson
from datetime import datetime
from decimal import Decimal

from notifications.signals import notify
from django.utils.encoding import smart_str
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from rest_framework.utils import model_meta
from drf_haystack.serializers import HaystackSerializer
from html_json_forms.serializers import JSONFormSerializer

from accounts.models import Profile, Skills
from accounts.enums import ROLES
from apps.api.search_indexes import ProjectIndex
from business.models import Company, Project, Employee, NDA
from generics.serializers import ParentModelSerializer, RelationalModelSerializer, AttachmentSerializer
from generics.utils import update_instance, field_names, send_mail
from postman.models import Message
from proposals.models import Proposal, Question
from proposals.serializers import ProposalSerializer, QuestionSerializer


class CompanySerializer(serializers.ModelSerializer):
    user_id = serializers.CharField(write_only=True)
    user_title = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Company
        fields = field_names(Company, exclude=('stripe', 'slug',)) + ('type', 'user_id', 'user_title')

    def create(self, data):
        user_id = data.pop('user_id')
        user_title = data.pop('user_title', None)
        user = Profile.objects.get(id=user_id)
        company = Company.objects.create(**data)
        Employee.objects.create(profile=user, title=user_title, company=company, primary=True)
        for project in Project.objects.filter(project_manager=user):
            project.company = company
            project.save()
        return company

    def update(self, instance, data):
        update_instance(instance, data)
        return instance


class SkillsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Skills
        fields = ('name', )
        extra_kwargs = {
            'name': {
                'validators': [],
            }
        }


class ProjectSerializer(JSONFormSerializer, ParentModelSerializer):
    slug = serializers.CharField(read_only=True)
    published = serializers.BooleanField(default=False)
    project_manager_data = serializers.SerializerMethodField()
    questions = serializers.SerializerMethodField()
    proposal = serializers.SerializerMethodField()
    proposals = serializers.SerializerMethodField()
    message = serializers.SerializerMethodField()
    skills = SkillsSerializer(many=True)
    show_private_info = serializers.SerializerMethodField()
    days_to_expire = serializers.SerializerMethodField()

    class Meta:
        model = Project
        parent_key = 'project'
        extra_kwargs = {'private_info': {'write_only': True}}

    def create(self, validated_data):
        skills = validated_data.pop('skills')
        project = Project.objects.create(**validated_data)
        project.skills = [skill['name'] for skill in skills]
        project.save()
        return project

    def update(self, instance, validated_data):
        if 'skills' in validated_data:
            skills = validated_data.pop('skills')
            instance.skills = [skill['name'] for skill in skills]
        info = model_meta.get_field_info(instance)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def get_proposal(self, obj):
        try:
            if self.context['request'].user.is_authenticated():
                proposal = Proposal.objects.get(project=obj, submitter=self.context['request'].user)
                return proposal.id
            return None
        except Proposal.DoesNotExist:
            return None

    def get_proposals(self, obj):
        if self.context['request'].user == obj.project_manager:
            proposals = Proposal.objects.filter(project=obj).exclude(status__exact='declined')
            return ProposalSerializer(proposals, many=True).data
        else:
            return None

    def get_message(self, obj):
        if self.get_proposal(obj):
            proposal = Proposal.objects.get(project=obj, submitter=self.context['request'].user)
            return proposal.message.id if proposal.message else None
        else:
            return None

    def get_project_manager_data(self, obj):
        return {
            'photo_url': obj.project_manager.get_photo,
            'first_name': obj.project_manager.first_name,
            'city': obj.project_manager.city,
            'state': obj.project_manager.state,
            'country': obj.project_manager.country,
            'location': obj.project_manager.location }

    def get_questions(self, obj):
        questions = Question.objects.filter(project=obj, active=True).order_by('ordering')
        return QuestionSerializer(questions, many=True).data

    def get_show_private_info(self, obj):
        if self.context['request'].user.id in obj.nda_list:
            return obj.private_info
        return None

    def get_days_to_expire(self, obj):
        if obj.expire_date:
            today = datetime.now().date()
            delta = obj.expire_date - today
            return delta.days if delta.days >= 0 else 0
        return None


class ProjectSearchSerializer(HaystackSerializer):
    role = serializers.SerializerMethodField()

    class Meta(ProjectSerializer.Meta):
        index_classes = [ProjectIndex]
        fields = [
            "title", "slug", "skills", "description", "category", "role", "city",
            "state", "country", "remote", "first_name", "photo", "date_created",
            "estimated_cash", "estimated_equity_percentage", "mix", "short_blurb", "scope"
        ]

    def get_role(self, obj):
        if obj.category in ROLES and obj.role in ROLES[obj.category]:
            return ROLES[obj.category][obj.role]
        return None


class EmployeeSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_name = serializers.CharField(write_only=True)

    class Meta:
        model = Employee
        exclude = ('primary', )

    def update(self, instance, validated_data):
        company_name = validated_data.pop('company_name')
        if instance.company.name != company_name:
            company, created = Company.objects.get_or_create(name=company_name)
            instance.company = company
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.start_date = validated_data.get('start_date', instance.start_date)
        instance.end_date = validated_data.get('end_date', instance.end_date)
        instance.current = validated_data.get('current', instance.current)
        instance.city = validated_data.get('city', instance.city)
        instance.state = validated_data.get('state', instance.state)
        instance.country = validated_data.get('country', instance.country)
        instance.save()
        return instance

    def create(self, validated_data):
        company_name = validated_data.pop('company_name')
        profile_id = validated_data.pop('profile')
        company, created = Company.objects.get_or_create(name=company_name)
        work_history = Employee.objects.create(
            company=company,
            profile=self.context['request'].user,
            **validated_data
        )
        return work_history


class NDASerializer(serializers.ModelSerializer):

    class Meta:
        model = NDA
