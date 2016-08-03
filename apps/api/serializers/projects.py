from notifications.signals import notify

from rest_framework import serializers
from drf_haystack.serializers import HaystackSerializerMixin
from html_json_forms.serializers import JSONFormSerializer

from api.search_indexes import ProjectIndex
from business.models import Company, Document, Project, ProjectInfo, Job, Employee, Document, Terms
from generics.serializers import ParentModelSerializer, AttachmentSerializer
from generics.utils import field_names
from postman.api import pm_write


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
        details = dict(**data.pop('details', {}))
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
        # TODO Lazy creating these may not be the most optimal solution
        job = Job.objects.create(**data)
        terms = Terms.objects.create(job=job)
        nda = Document.objects.create(job=job, type='NDA')
        message = pm_write(
            sender=job.contractor,
            recipient=job.project.project_manager,
            subject='New Bid from {0} for {1}'.format(job.contractor.first_name or job.contractor.email, job.project.title),
            body=msg
        )
        # TODO Rethink saving these on the message
        message.job = job
        message.nda = nda
        message.terms = terms
        message.save()
        notify.send(message.recipient, recipient=message.recipient, verb=u'received a new bid', action_object=job)
        return job


class DocumentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Document


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