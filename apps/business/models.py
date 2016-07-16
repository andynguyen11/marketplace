from datetime import datetime, timedelta

import tagulous.models
from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation

from postman.models import Message
from generics.models import Attachment
from business.enums import *


class Category(tagulous.models.TagModel):

    class TagMeta:
        autocomplete_view = 'api:company-category'


class Company(models.Model):
    name = models.CharField(max_length=255)
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
    category = tagulous.models.TagField(to=Category, blank=True, null=True)
    type = models.CharField(max_length=100, choices=COMPANY_TYPES)
    filing_location = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'companies'


class Employee(models.Model):
    company = models.ForeignKey(Company)
    profile = models.ForeignKey('accounts.Profile')
    primary = models.BooleanField(default=False)


class Job(models.Model):
    project = models.ForeignKey('business.Project')
    developer = models.ForeignKey('accounts.Profile')
    attachments = GenericRelation(Attachment, related_query_name='job_attachments')
    date_created = models.DateTimeField(auto_now_add=True)
    date_completed = models.DateTimeField(blank=True, null=True)
    equity = models.DecimalField(blank=True, null=True, max_digits=5, decimal_places=2)
    cash = models.DecimalField(blank=True, null=True, max_digits=9, decimal_places=2)
    hours = models.IntegerField(blank=True, null=True)
    status = models.CharField(max_length=100, blank=True, null=True, choices=JOB_STATUS)
    progress = models.IntegerField(default=0)
    bid_message = models.TextField(blank=True, null=True)
    nda_signed = models.BooleanField(default=False)

    def __str__(self):
        return '{0} - {1} {2}'.format(self.project, self.developer.first_name, self.developer.last_name)

    @property
    def job_messages(self):
        return Message.objects.filter(job=self, project=self.project)


class ConfidentialInfo(models.Model):
    project = models.ForeignKey('business.Project')
    title = models.CharField(max_length=100)
    summary = models.CharField(max_length=500, null=True)
    attachments = GenericRelation(Attachment, related_query_name='business_confidentialinfo')


class Project(models.Model):
    company = models.ForeignKey(Company)
    project_manager = models.ForeignKey('accounts.Profile')
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=100, choices=PROJECT_TYPES)
    image = models.ImageField(blank=True, upload_to='project')
    short_blurb = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    category = tagulous.models.TagField(to=Category)
    city = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True)
    estimated_equity = models.DecimalField(blank=True, null=True, max_digits=5, decimal_places=2)
    estimated_cash = models.DecimalField(blank=True, null=True, max_digits=9, decimal_places=2)
    estimated_hours = models.IntegerField()
    skills = tagulous.models.TagField(to='accounts.Skills')
    status = models.CharField(max_length=100, blank=True, null=True)
    remote = models.BooleanField(default=False)
    featured = models.BooleanField(default=False)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-date_created']

    def active_jobs(self):
        jobs = Job.objects.filter(status='active', project=self)
        return jobs

    def info(self):
        info = ConfidentialInfo.objects.filter(project=self)
        return info


class Document(models.Model):
    docusign_document = models.OneToOneField('docusign.Document', unique=True)
    type = models.CharField(max_length=100, choices=DOCUMENT_TYPES)
    project = models.ForeignKey(Project)
    job = models.ForeignKey(Job)

    @property
    def project_manager(self):
        return self.project.project_manager

    @property
    def developer(self):
        return self.project.developer

    @property
    def status(self):
        return self.docusign_document.status


