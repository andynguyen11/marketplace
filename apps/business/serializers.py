import simplejson
from decimal import Decimal

from notifications.signals import notify
from django.utils.encoding import smart_str
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from rest_framework.utils import model_meta
from drf_haystack.serializers import HaystackSerializer
from html_json_forms.serializers import JSONFormSerializer

from accounts.models import Profile, Skills
from apps.api.search_indexes import ProjectIndex
from business.models import Company, Document, Project, Job, Employee, Document, NDA
from docusign.models import Template
from docusign.serializers import TemplateSerializer, SignerSerializer, DocumentSerializer as DocusignDocumentSerializer
from generics.serializers import ParentModelSerializer, RelationalModelSerializer, AttachmentSerializer
from generics.utils import update_instance, field_names, send_mail
from payment.models import Order
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

    class Meta:
        model = Project
        parent_key = 'project'

    def create(self, validated_data):
        skills = validated_data.pop('skills')
        project = Project.objects.create(**validated_data)
        project.skills = [skill['name'] for skill in skills]
        project.save()
        return project

    def update(self, instance, validated_data):
        skills = validated_data.pop('skills')
        info = model_meta.get_field_info(instance)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.skills = [skill['name'] for skill in skills]
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


class ProjectSearchSerializer(HaystackSerializer):
    class Meta(ProjectSerializer.Meta):
        index_classes = [ProjectIndex]
        fields = [
            "title", "slug", "skills", "description", "role", "city",
            "state", "country", "remote", "first_name", "photo", "date_created",
            "estimated_cash", "estimated_equity_percentage", "mix", "short_blurb"
        ]


class JobSerializer(serializers.ModelSerializer):
    message = serializers.CharField(write_only=True, required=True)
    cash = serializers.IntegerField(required=False, allow_null=True )
    equity = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True )
    thread_id = serializers.SerializerMethodField()
    project = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = field_names(Job) + ('message', 'thread_id')

    def get_thread_id(self, job):
        return Message.objects.filter(job=job)[0].thread_id

    def get_project(self, obj):
        project = obj.project
        return {
            'title': project.title,
            'id': project.id,
            'company': project.company.name if project.company else None
        }


class DocumentSerializer(ParentModelSerializer):
    template = serializers.PrimaryKeyRelatedField(required=False, write_only=True, queryset=Template.objects.all())
    signers = SignerSerializer(many=True, required=False)
    attachments = AttachmentSerializer(many=True, required=False)
    docusign_document = DocusignDocumentSerializer(required=False, write_only=True, allow_null=True)
    signing_url  = serializers.CharField(read_only=True)
    status  = serializers.CharField()
    current_signer  = serializers.PrimaryKeyRelatedField(read_only=True)

    def to_representation(self, instance):
        ret = super(DocumentSerializer, self).to_representation(instance)
        for k, v in ret.items():
            if v is None:
                ret.pop(k)
        return ret

    class Meta:
        model = Document
        fields = field_names(Document) + ('template', 'docusign_document', 'signers', 'attachments', 'signing_url', 'status', 'current_signer')
        sibling_fields = ('docusign_document',)

    def signer(self, data, role, role_name=None):
        return {
            'role_name': role_name or role,
            'profile': getattr(data['job'], role),
        }

    def default_template(self, document_type):
        try:
            return Template.objects.get(description=document_type)
        except Template.DoesNotExist, e:
            return None

    def resolve_relations(self, data):
        if not data.has_key('docusign_document'):
            template = data.pop('template', self.default_template(data['type']))
            if template:
                if not data['job'].owner.stripe:
                    order = Order.objects.get(job=data['job'].id)
                    #TODO This check needs to be more dynamic when promos are variable
                    if order.status != 'paid':
                        raise PermissionDenied({
                            "message": "NO_PAYMENT_METHOD",
                            "profile": data['job'].owner.id,
                            "job": data['job'].id })
                    
                signers = data.pop('signers', [
                    self.signer(data, 'contractor'),
                    self.signer(data, 'owner')])

                data['docusign_document'] = { 'template': template, 'signers': signers }

                attachments = data.pop('attachments', None)
                if attachments:
                    data['docusign_document']['attachments'] = attachments
        return data


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
