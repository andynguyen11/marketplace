from datetime import datetime, timedelta

import tagulous.models
from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.template.defaultfilters import slugify
from django.utils.encoding import smart_str

from postman.models import Message
from generics.models import Attachment
from business.enums import *


class Category(tagulous.models.TagModel):

    class TagMeta:
        autocomplete_view = 'api:company-category'


class Employee(models.Model):
    company = models.ForeignKey('business.Company')
    profile = models.ForeignKey('accounts.Profile')
    primary = models.BooleanField(default=False)


class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField()
    legal_entity_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=255, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)
    stripe = models.CharField(max_length=255, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    address2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True)
    zipcode = models.IntegerField(blank=True, null=True)
    ein = models.CharField(max_length=255, verbose_name='EIN', blank=True, null=True)
    logo = models.ImageField(blank=True, null=True, upload_to='provider/logo')
    description = models.TextField(blank=True, null=True)
    long_description = models.TextField(blank=True, null=True)
    category = tagulous.models.TagField(to=Category, blank=True)
    type = models.CharField(max_length=100, choices=COMPANY_TYPES)
    filing_location = models.CharField(max_length=100)

    @property
    def get_logo(self):
        if self.logo:
            return '{0}{1}'.format(settings.MEDIA_URL, self.logo)
        else:
            return '{0}{1}'.format(settings.STATIC_URL, 'images/home-hero-2g.jpg')

    @property
    def primary_contact(self):
        return Employee.objects.get(company=self, primary=True)

    @property
    def employees(self):
        return Employee.objects.filter(company=self)

    @property
    def tags(self):
        projects = Project.objects.filter(company=self)
        tags = []
        for project in projects:
            # TODO List comprehension here bro
            if project.type not in tags:
                tags.append(project.type)
        return tags

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(Company, self).save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'companies'

def user_company(user):
    return Employee.objects.get(profile=user, primary=True).company


class Job(models.Model):
    project = models.ForeignKey('business.Project')
    contractor = models.ForeignKey('accounts.Profile')
    attachments = GenericRelation(Attachment, related_query_name='job_attachments')
    date_created = models.DateTimeField(auto_now_add=True)
    date_completed = models.DateTimeField(blank=True, null=True)
    equity = models.DecimalField(blank=True, null=True, max_digits=5, decimal_places=2)
    cash = models.IntegerField(blank=True, null=True)
    hours = models.IntegerField(blank=True, null=True)
    status = models.CharField(max_length=100, blank=True, null=True, default='pending', choices=JOB_STATUS)
    progress = models.IntegerField(default=0)
    nda_signed = models.BooleanField(default=False)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return '{0} - {1} {2}'.format(self.project, smart_str(self.contractor.first_name), smart_str(self.contractor.last_name))

    @property
    def conversation(self):
        return Message.objects.get(job=self, sender=self.contractor)

    @property
    def owner(self):
        return self.project.project_manager

    def save(self, *args, **kwargs):
        try:
            terms = Terms.objects.get(job=self)
            if terms.status != 'contracted' or terms.status != 'agreed':
                terms.update_date = datetime.now()
                terms.cash = self.cash
                terms.equity = self.equity
                terms.hours = self.hours
                terms.save()
        except Terms.DoesNotExist:
            pass
        super(Job, self).save(*args, **kwargs)


#TODO Deprecated
class ProjectInfo(models.Model):
    type = models.CharField(max_length=100, choices=INFO_TYPES)
    project = models.ForeignKey('business.Project')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    attachments = GenericRelation(Attachment, related_query_name='projectinfo')

    def tagged(self, tag):
        return Attachment.objects.get(projectinfo=self, tag=tag)

    def safe_tagged(self, tag):
        try:
            return self.tagged(tag)
        except Attachment.DoesNotExist, e:
            return None


class Document(models.Model):
    date_created = models.DateTimeField(auto_now=True)
    job = models.ForeignKey(Job)
    type = models.CharField(max_length=100, choices=DOCUMENT_TYPES)
    docusign_document = models.OneToOneField('docusign.Document', blank=True, null=True)
    status = models.CharField(default='new', max_length=30, null=True)

    @property
    def project(self):
        return self.job.project

    @property
    def contractor(self):
        return self.job.contractor

    @property
    def manager(self):
        return self.project.project_manager

    @property
    def signers(self):
        return self.docusign_document and self.docusign_document.signers

    def getstatus(self):
        return self.docusign_document.status if self.docusign_document else self.status

    @property
    def signing_url(self):
        return self.docusign_document and self.docusign_document.signing_url

    @property
    def current_signer(self):
        if self.status not in ('completed', 'declined', 'voided') and self.signers:
            for signer in self.signers:
                if signer.status in (None, 'sent', 'delivered'):
                    return signer.profile.id

    def docusign_status(self):
        return self.docusign_document.status


class ProjectManager(models.Manager):
    def get_queryset(self):
        return super(ProjectManager, self).get_queryset().filter(deleted=False)


class Project(models.Model):
    company = models.ForeignKey(Company, blank=True, null=True)
    project_manager = models.ForeignKey('accounts.Profile')
    title = models.CharField(max_length=255, unique=True)
    slug = models.SlugField()
    video_url = models.CharField(max_length=255, blank=True, null=True)
    type = models.CharField(max_length=100, choices=PROJECT_TYPES, null=True) # type vs category?
    category = tagulous.models.TagField(to=Category, blank=True, null=True) # not really in the mockup
    short_blurb = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    skills = tagulous.models.TagField(to='accounts.Skills', blank=True, null=True)
    deleted = models.BooleanField(default=False)
    estimated_hours = models.IntegerField(blank=True, null=True)
    estimated_cash = models.IntegerField(blank=True, null=True)
    estimated_equity_percentage = models.DecimalField(blank=True, null=True, max_digits=4, decimal_places=2)
    estimated_equity_shares = models.DecimalField(blank=True, null=True, max_digits=9, decimal_places=2)
    date_created = models.DateTimeField(auto_now_add=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=100, blank=True, null=True)
    remote = models.BooleanField(default=False)
    featured = models.BooleanField(default=False)
    mix = models.BooleanField(default=False)
    background = models.TextField(blank=True, null=True)
    progress = models.TextField(blank=True, null=True)
    scope = models.TextField(blank=True, null=True)
    milestones = models.TextField(blank=True, null=True)
    specs = models.TextField(blank=True, null=True)
    private_info = models.TextField(blank=True, null=True)
    project_image = models.ImageField(blank=True, null=True, upload_to='project-images')
    published = models.BooleanField(default=False)

    objects = ProjectManager()

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-date_created']

    def save(self, *args, **kwargs):
        self.slug = slugify(self.title)
        super(Project, self).save(*args, **kwargs)

    @property
    def image(self):
        return self.details.safe_tagged('image') if self.details else None

    @property
    def video(self):
        return self.details.safe_tagged('video') if self.details else None

    @property
    def description(self):
        return self.details.description if self.details else None

    @property
    def details(self):
        try:
            return ProjectInfo.objects.get(project=self, type='primary')
        except ProjectInfo.DoesNotExist:
            return ProjectInfo(project=self, type='primary')

    @property
    def average_equity(self):
        average = None
        bids = Job.objects.filter(project=self, ).exclude(equity__isnull=True).exclude(equity=0).exclude(cash__isnull=False)
        equities = [bid.equity for bid in bids]
        if equities:
            average = round((sum(equities) / len(equities)), 2)
        return average

    @property
    def average_cash(self):
        average = None
        bids = Job.objects.filter(project=self, ).exclude(cash__isnull=True).exclude(cash=0).exclude(equity__isnull=False)
        cash = [bid.cash for bid in bids]
        if cash:
            average = int(round((sum(cash) / float(len(cash)))))
        return average

    @property
    def average_combined(self):
        average_cash = None
        average_equity = None
        bids = Job.objects.filter(project=self, ).exclude(equity__isnull=True).exclude(cash__isnull=True).exclude(equity=0).exclude(cash=0)
        equities = [bid.equity for bid in bids]
        cash = [bid.cash for bid in bids]
        if cash and equities:
            average_equity = round((sum(equities) / len(equities)), 2)
            average_cash = int(round((sum(cash) / float(len(cash)))))
        return { 'cash': average_cash, 'equity': average_equity }

    def active_jobs(self):
        jobs = Job.objects.filter(project=self).exclude(status__exact='completed')
        return jobs

    def info(self, type=None):
        rest = {'type': type} if type else {}
        return ProjectInfo.objects.filter(project=self, **rest).exclude(type='primary')

    def documents(self):
        documents = Document.objects.filter(project=self)
        return documents

    def nda_list(self):
        documents = Document.objects.filter(job__project=self, type='NDA', status='signed')
        nda_list = [document.job.contractor.id for document in documents]
        nda_list.append(self.project_manager.id)
        return nda_list


class Terms(models.Model):
    create_date = models.DateTimeField(auto_now=True)
    update_date = models.DateTimeField(blank=True, null=True)
    job = models.OneToOneField(Job)
    contractor = models.CharField(max_length=100)
    contractee = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    scope = models.TextField(blank=True, null=True)
    deliverables = models.TextField(blank=True, null=True)
    milestones = models.TextField(blank=True, null=True)
    cash = models.IntegerField(blank=True, null=True)
    equity = models.DecimalField(blank=True, null=True, max_digits=5, decimal_places=2)
    hours = models.IntegerField(blank=True, null=True)
    schedule = models.CharField(max_length=255, default='50% upfront and 50% upon completion', blank=True, null=True, choices=COMPENSATION_SCHEDULE)
    halfway = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=100, default='new')

    def save(self, *args, **kwargs):
        if not self.pk:
            self.contractee = self.job.project.company.name if self.job.project.company else self.job.project.project_manager.name
            self.contractor = '{0} {1}'.format(smart_str(self.job.contractor.first_name), smart_str(self.job.contractor.last_name))
            self.update_date = datetime.now()
            self.cash = self.job.cash
            self.equity = self.job.equity
            self.hours = self.job.hours
            self.start_date = self.job.project.start_date
            self.end_date = self.job.project.end_date
        super(Terms, self).save(*args, **kwargs)


