import simplejson
from decimal import Decimal

from notifications.signals import notify
from django.utils.encoding import smart_str
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from drf_haystack.serializers import HaystackSerializerMixin
from html_json_forms.serializers import JSONFormSerializer

from accounts.models import Profile
from apps.api.search_indexes import ProjectIndex
from business.models import Company, Document, Project, ProjectInfo, Job, Employee, Document, Terms
from docusign.models import Template
from docusign.serializers import TemplateSerializer, SignerSerializer, DocumentSerializer as DocusignDocumentSerializer
from generics.serializers import ParentModelSerializer, RelationalModelSerializer, AttachmentSerializer
from generics.utils import update_instance, field_names, send_mail
from payment.models import Order
from postman.helpers import pm_write
from postman.models import Message


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
    slug = serializers.CharField(read_only=True)
    published = serializers.BooleanField(default=False)
    project_manager_data = serializers.SerializerMethodField()
    bid_stats = serializers.SerializerMethodField()

    class Meta:
        model = Project
        parent_key = 'project'

    def get_project_manager_data(self, obj):
        return {
            'photo_url': obj.project_manager.get_photo,
            'first_name': obj.project_manager.first_name,
            'city': obj.project_manager.city,
            'state': obj.project_manager.state,
            'country': obj.project_manager.country,
            'location': obj.project_manager.location }

    def get_bid_stats(self, obj):
        averages = {}
        averages['cash'] = obj.average_cash
        averages['equity'] = obj.average_equity
        averages['combined'] = obj.average_combined
        return { 'averages': averages }


class ProjectSearchSerializer(HaystackSerializerMixin, ProjectSerializer):
    class Meta(ProjectSerializer.Meta):
        index_classes = [ProjectIndex]
        search_fields = ProjectIndex.Meta.fields


class JobSerializer(serializers.ModelSerializer):
    message = serializers.CharField(write_only=True, required=True)
    cash = serializers.IntegerField(required=False, allow_null=True )
    equity = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True )
    thread_id = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = field_names(Job) + ('message', 'thread_id')

    def create(self, data):
        msg = data.pop('message')
        project_id = data.pop('project')
        contractor_id = data.pop('contractor')
        # TODO Lazy creating these may not be the most optimal solution
        job, created = Job.objects.get_or_create(project=project_id, contractor=contractor_id)
        job = Job(id=job.id, date_created=job.date_created, project=job.project, contractor=job.contractor, **data)
        job.save()
        cash = ''
        equity = ''
        email_template = None
        if job.equity:
            equity = "{0}% Equity".format(job.equity)
            email_template = 'bid-recieved-equity'
        if job.cash:
            cash = "${0} Cash".format(job.cash)
            email_template = 'bid-recieved-cash'
        if equity and cash:
            compensation = "{0} and {1}".format(equity, cash)
            email_template = 'bid-recieved-cash-equity'
        else:
            compensation = cash if cash else equity
            email_template = 'bid-recieved-cash' if cash else 'bid-recieved-equity'
        message = "Hi, I'm interested in working on your project and just submitted a bid. \n\n" \
                  "The bid terms are: \n\n" \
                  "{0} for an estimated {1} hours of work. \n\n" \
                  "Personal message from developer: {2}".format(compensation, job.hours, smart_str(msg))
        message = pm_write(
            sender=job.contractor,
            recipient=job.project.project_manager,
            subject='New bid on {0}'.format(job.project.title),
            body=message
        )
        if created:
            terms = Terms.objects.create(job=job)
            nda = Document.objects.create(job=job, type='NDA', project=job.project, )
            message.job = job
            message.nda = nda
            message.project = job.project
            message.terms = terms
            thread = message
        else:
            thread = Message.objects.get(job=job)
        message.thread = thread
        message.save()

        notify.send(
            message.sender,
            recipient=message.recipient,
            verb=u'submitted a bid on',
            action_object=message,
            target=job.project
        )
        # Send email notification
        if email_template:
            send_mail(email_template, [message.recipient], {
                'developername': job.contractor.first_name,
                'projectname': job.project.title,
                'developertype': job.contractor.role.capitalize(),
                'cash': job.cash,
                'equity': simplejson.dumps(job.equity),
                'hours': job.hours,
                'message': msg,
                'email': message.recipient.email
            })
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
        message = "I adjusted my bid. \n\n" \
                  "The bid terms are now: \n\n" \
                  "{0} for an estimated {1} hours of work.".format(compensation, validated_data['hours'])
        message = Message.objects.create(
            sender=instance.contractor,
            recipient=instance.project.project_manager,
            subject='{0}'.format(thread.subject),
            body=message,
            thread=thread
        )
        return super(JobSerializer, self).update(instance, validated_data)

    def get_thread_id(self, job):
        return Message.objects.filter(job=job)[0].thread_id

# TODO DRY: ManagerBidSerializer and ContractorBidSerializer can inherit from a base BidSummarySerializer
class ManagerBidSerializer(serializers.ModelSerializer):
    " bid serializer for summarizing details a project manager cares about "
    cash = serializers.IntegerField(required=False, allow_null=True )
    equity = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True )
    contractor = serializers.SerializerMethodField()
    thread_id = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = field_names(Job) + ('thread_id', )

    def get_contractor(self, obj):
        contractor = { k: getattr(obj.contractor, k) for k in [
            'first_name', 'capacity', 'role'
        ]}
        contractor['photo_url'] = obj.contractor.get_photo
        return contractor

    def get_thread_id(self, job):
        try:
            return Message.objects.filter(job=job)[0].thread_id
        except IndexError:
            return None

class ContractorBidSerializer(serializers.ModelSerializer):
    cash = serializers.IntegerField(required=False, allow_null=True )
    equity = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True )
    project = serializers.SerializerMethodField()
    thread_id = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = field_names(Job) + ('thread_id', )

    def get_project(self, obj):
        return { k: getattr(obj.project, k) for k in [
             'id','title',
        ]}

    def get_thread_id(self, job):
        return Message.objects.filter(job=job)[0].thread_id


class ProjectSummarySerializer(ParentModelSerializer):
    " serializer for the project tab "
    slug = serializers.CharField(read_only=True)
    published = serializers.BooleanField(default=False)
    bids = serializers.SerializerMethodField()
    bid_stats = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ('id', 'title', 'slug', 'short_blurb',
                'type', 'category', 'skills',
                'date_created', 'start_date', 'end_date',
                'estimated_hours', 'estimated_cash',
                'estimated_equity_percentage',
                'estimated_equity_shares', 'mix', 'remote',
                'status', 'featured', 'published', 'approved',
                'company', 'project_manager',
                'bids', 'bid_stats', )
        parent_key = 'project'

    def get_bids(self, obj):
        jobs = Job.objects.filter(project=obj)
        return ManagerBidSerializer(jobs, many=True).data

    def get_bid_stats(self, obj):
        averages = {}
        averages['cash'] = obj.average_cash
        averages['equity'] = obj.average_equity
        averages['combined'] = obj.average_combined
        return { 'averages': averages }


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


# TODO: less liberal 
# project manager shouldn't be able to change hours, compensation, etc.
# project manager can only change "less important" attributes, not compensation
class TermsSerializer(serializers.ModelSerializer):
    project = serializers.SerializerMethodField()
    update_date = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Terms

    def get_project(self, obj):
        return { 'title': obj.job.project.title, 'id': obj.job.project.id }

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
