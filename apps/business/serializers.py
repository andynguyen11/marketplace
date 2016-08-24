from notifications.signals import notify

from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from drf_haystack.serializers import HaystackSerializerMixin
from html_json_forms.serializers import JSONFormSerializer

from accounts.models import Profile
from apps.api.search_indexes import ProjectIndex
from business.models import Company, Document, Project, ProjectInfo, Job, Employee, Document, Terms
from generics.serializers import ParentModelSerializer, RelationalModelSerializer, AttachmentSerializer
from docusign.models import Template
from docusign.serializers import TemplateSerializer, SignerSerializer, DocumentSerializer as DocusignDocumentSerializer
from generics.utils import update_instance, field_names
from postman.helpers import pm_write
from postman.models import Message


class CompanySerializer(serializers.ModelSerializer):
    user_id = serializers.CharField(write_only=True)

    class Meta:
        model = Company
        fields = field_names(Company, exclude=('stripe', 'slug',)) + ('type', 'user_id')

    def create(self, data):
        user_id = data.pop('user_id')
        user = Profile.objects.get(id=user_id)
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


class ProjectSummarySerializer(serializers.ModelSerializer):

     class Meta:
         model = Project
         fields = ('id', 'title', 'slug' , 'type', 'date_created', 'short_blurb', 'company', 'project_manager')


class ProjectSerializer(JSONFormSerializer, ParentModelSerializer):
    info = InfoSerializer(many=True, required=False)
    details = InfoSerializer(required=False)
    slug = serializers.CharField(read_only=True)
    #category = serializers.CharField(required=False) # TODO - custom tag serializer needed

    class Meta:
        model = Project
        fields = field_names(Project) + ('info', 'details', 'skills')
        parent_key = 'project'
        child_fields = ('info',)

    def handle_details(self, data, instance=None):
        data = data.copy()
        details = dict(**data.pop('details', {}))

        if instance:
            details['id'] = ProjectInfo.objects.get(project=instance, type='primary').id
        data['info'] = [ i for i in data.pop('info', []) if i['type'] != 'primary']
        for i, tab in enumerate(data['info']):
            if tab['description'] == 'undefined':
                del data['info'][i]
        data['info'].append(details)
        return data

    def create(self, data, action='create'):
        data = self.handle_details(data)
        project = super(ProjectSerializer, self).create(data, action)
        return project

    def update(self, instance, data):
        data = self.handle_details(data, instance)
        project = super(ProjectSerializer, self).update(instance, data)
        return project


class JobSerializer(serializers.ModelSerializer):
    message = serializers.CharField(write_only=True, required=True)
    cash = serializers.IntegerField(required=False, allow_null=True )
    equity = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True )

    class Meta:
        model = Job
        fields = field_names(Job) + ('message',)

    def create(self, data):
        msg = data.pop('message')
        # TODO Lazy creating these may not be the most optimal solution
        job = Job.objects.create(**data)
        terms = Terms.objects.create(job=job)
        nda = Document.objects.create(job=job, type='NDA', project=job.project, )
        cash = ''
        equity = ''
        if job.equity:
            equity = "{0}% Equity".format(job.equity)
        if job.cash:
            cash = "${0} Cash".format(job.cash)
        if equity and cash:
            compensation = "{0} and {1}".format(equity, cash)
        else:
            compensation = cash if cash else equity
        message = "Hi, I'm interested in working on your project and just submitted a bid. \n\n" \
                  "The bid terms are: \n\n" \
                  "{0} for an estimated {1} hours of work. \n\n" \
                  "Personal message from developer: {2}".format(compensation, job.hours, msg)
        message = pm_write(
            sender=job.contractor,
            recipient=job.project.project_manager,
            subject='New bid on {1}'.format(job.project.title),
            body=message
        )
        # TODO Rethink saving these on the message
        message.job = job
        message.nda = nda
        message.project = job.project
        message.terms = terms
        message.thread = message
        message.save()
        notify.send(message.recipient, recipient=message.recipient, verb=u'received a new bid', action_object=job)
        return job

    def update(self, instance, validated_data):
        thread = Message.objects.get(job=instance, sender=instance.contractor)
        cash = ''
        equity = ''
        if validated_data.get('equity', None):
            equity = "{0}% Equity".format(validated_data['equity'])
        if validated_data.get('cash', None):
            cash = "${0} Cash".format(validated_data['cash'])
        if equity and cash:
            compensation = "{0} and {1}".format(equity, cash)
        else:
            compensation = cash if cash else equity
        message = "Hi, I have adjusted my bid. \n\n" \
                  "The bid terms are now: \n\n" \
                  "{0} for an estimated {1} hours of work.".format(compensation, validated_data['hours'])
        message = Message.objects.create(
            sender=instance.contractor,
            recipient=instance.project.project_manager,
            subject='re:{0}'.format(thread.subject),
            body=message,
            thread=thread
        )
        return super(JobSerializer, self).update(instance, validated_data)


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


class TermsSerializer(serializers.ModelSerializer):
    project = serializers.SerializerMethodField()
    update_date = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Terms

    def get_project(self, obj):
        return { 'title': obj.job.project.title, 'id': obj.job.project.id }


class ProjectSearchSerializer(HaystackSerializerMixin, ProjectSerializer):
    class Meta(ProjectSerializer.Meta):
        index_classes = [ProjectIndex]
        search_fields = ("text", )
