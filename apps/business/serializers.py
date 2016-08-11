from notifications.signals import notify

from rest_framework import serializers
from drf_haystack.serializers import HaystackSerializerMixin
from html_json_forms.serializers import JSONFormSerializer

from apps.api.search_indexes import ProjectIndex
from business.models import Company, Document, Project, ProjectInfo, Job, Employee, Document, Terms
from generics.serializers import ParentModelSerializer, RelationalModelSerializer, AttachmentSerializer
from docusign.models import Template
from docusign.serializers import TemplateSerializer, SignerSerializer, DocumentSerializer as DocusignDocumentSerializer
from generics.utils import update_instance, field_names
from postman.helpers import pm_write


class CompanySerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = field_names(Company, exclude=('stripe', 'slug',)) + ('type',)

    def get_logo_url(self, obj):
        return obj.get_logo()

    def create(self, data):
        user = self.context['request'].user
        company = Company.objects.create(**data)
        Employee.objects.create(profile=user, company=company, primary=True)
        return company

    def update(self, instance, data):
        update_instance(instance, data)
        return instance


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
        fields = field_names(Project) + ('info', 'details', 'category', 'skills')
        parent_key = 'project'
        child_fields = ('info',)

    def create(self, data, action='create'):
        details = dict(**data.pop('details', {}))
        data['info'] = data.pop('info', [])
        for i, tab in enumerate(data['info']):
            if tab['description'] == 'undefined':
                del data['info'][i]
        print(data['info'])
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
        # TODO Lazy creating these may not be the most optimal solution
        job = Job.objects.create(**data)
        terms = Terms.objects.create(job=job)
        nda = Document.objects.create(job=job, type='NDA', project=job.project)
        message = pm_write(
            sender=job.contractor,
            recipient=job.project.project_manager,
            subject='New Bid from {0} for {1}'.format(job.contractor.first_name or job.contractor.email, job.project.title),
            body=msg
        )
        # TODO Rethink saving these on the message
        message.job = job
        message.nda = nda
        message.project = job.project
        message.terms = terms
        message.save()
        notify.send(message.recipient, recipient=message.recipient, verb=u'received a new bid', action_object=job)
        return job


class DocumentSerializer(ParentModelSerializer):
    template = TemplateSerializer(read_only=True)
    signers = SignerSerializer(many=True, required=False)
    attachments = AttachmentSerializer(many=True, required=False)
    docusign_document = DocusignDocumentSerializer(required=False)

    class Meta:
        model = Document
        fields = field_names(Document) + ('template', 'docusign_document', 'signers', 'attachments')
        sibling_fields = ('docusign_document',)

    def signer(self, data, role, role_name=None):
        return {
            'role_name': role_name or role,
            'profile': getattr(data['job'], role),
        }

    def default_template(self, document_type):
        return Template.objects.get(description=document_type)

    def resolve_relations(self, data):
        signers = data.pop('signers', [
                    self.signer(data, 'contractor'),
                    self.signer(data, 'owner')])

        data['docusign_document'] = {
            'template': data.pop('template', self.default_template(data['type'])), 
            'signers': signers
        } 

        attachments = data.pop('attachments', None)
        if attachments:
            data['docusign_document']['attachments'] = attachments

        return data


class TermsSerializer(serializers.ModelSerializer):
    project = serializers.SerializerMethodField()

    class Meta:
        model = Terms

    def get_project(self, obj):
        return obj.job.project.title


class ProjectSearchSerializer(HaystackSerializerMixin, ProjectSerializer):
    class Meta(ProjectSerializer.Meta):
        index_classes = [ProjectIndex]
        search_fields = ("text", )
