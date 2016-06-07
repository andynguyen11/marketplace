import tagulous.models

from datetime import datetime, timedelta

from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from api import docusign


class Company(models.Model):
    primary_contact = models.ForeignKey('accounts.Profile')
    name = models.CharField(max_length=255)
    legal_entity_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    stripe = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    address2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255)
    state = models.CharField(max_length=255)
    zipcode = models.IntegerField()
    ein = models.CharField(max_length=255, verbose_name='EIN', blank=True, null=True)
    logo = models.ImageField(blank=True, upload_to='provider/logo')
    description = models.TextField(blank=True, null=True)
    category = tagulous.models.SingleTagField()

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'companies'


PROJECT_TYPES = (
    (u'art', u'Art and Design'),
    (u'technology', u'Technology'),
    (u'gaming', u'Gaming'),
    (u'nonprofit', u'Non-Profit'),
    (u'social', u'Social'),
    (u'news', u'News and Publishing'),
    (u'music', u'Music and Media'),
    (u'location', u'Location-Based'),
    (u'health', u'Health and Fitness'),
)


JOB_STATUS = (
    (u'pending', u'Pending'),
    (u'active', u'Active'),
    (u'completed', u'Completed'),
)


class Job(models.Model):
    project = models.ForeignKey('business.Project')
    developer = models.ForeignKey('accounts.Profile')
    date_created = models.DateTimeField(auto_now_add=True)
    date_completed = models.DateTimeField(blank=True, null=True)
    equity = models.DecimalField(blank=True, null=True, max_digits=5, decimal_places=2)
    cash = models.DecimalField(blank=True, null=True, max_digits=9, decimal_places=2)
    hours = models.IntegerField(blank=True, null=True)
    status = models.CharField(max_length=100, blank=True, null=True, choices=JOB_STATUS)
    progress = models.IntegerField(default=0)

    def __str__(self):
        return '{0} - {1} {2}'.format(self.project, self.developer.first_name, self.developer.last_name)


class Project(models.Model):
    company = models.ForeignKey(Company)
    project_manager = models.ForeignKey('accounts.Profile')
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=100, choices=PROJECT_TYPES)
    image = models.ImageField(blank=True, upload_to='project')
    short_blurb = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    category = tagulous.models.SingleTagField()
    secondary_category = tagulous.models.SingleTagField()
    location = tagulous.models.SingleTagField()
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


DOCUMENT_TYPES = (
    (u'Non-Disclosure', u'Non-Disclosure Agreement'),
    (u'Contract Service', u'Contract Service Agreement'),
    (u'Non-Compete', u'Non-Compete Agreement'),
)

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
