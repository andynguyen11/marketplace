import os
from uuid import uuid4
from datetime import datetime, timedelta

import tagulous.models
from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.template.defaultfilters import slugify
from django.utils.encoding import smart_str
from django.contrib.contenttypes.models import ContentType

from postman.models import Message
from generics.models import Attachment
from business.enums import *
from accounts.enums import ROLE_TYPES


class Category(tagulous.models.TagModel):

    class TagMeta:
        autocomplete_view = 'api:company-category'


class Employee(models.Model):
    company = models.ForeignKey('business.Company')
    profile = models.ForeignKey('accounts.Profile')
    primary = models.BooleanField(default=False)
    title = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    current = models.BooleanField(default=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True)
    country = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-current', '-end_date', '-start_date']


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
    zipcode = models.CharField(max_length=15, blank=True, null=True)
    country = models.CharField(max_length=255, blank=True, null=True)
    ein = models.CharField(max_length=50, verbose_name='EIN', blank=True, null=True)
    logo = models.ImageField(blank=True, null=True, upload_to='provider/logo')
    description = models.TextField(blank=True, null=True)
    long_description = models.TextField(blank=True, null=True)
    category = tagulous.models.TagField(to=Category, blank=True)
    type = models.CharField(max_length=100, choices=COMPANY_TYPES, blank=True, null=True)
    filing_location = models.CharField(max_length=100, blank=True, null=True)
    incorporation_date = models.DateField(blank=True, null=True)

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

    def __unicode__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'companies'


class NDA(models.Model):
    date_created = models.DateTimeField(auto_now_add=True)
    sender = models.ForeignKey('accounts.Profile', related_name='sender')
    receiver = models.ForeignKey('accounts.Profile', related_name='reciever')
    status = models.CharField(default='new', max_length=30, null=True)
    proposal = models.ForeignKey('proposals.Proposal', blank=True, null=True)


class ProjectManager(models.Manager):
    def get_queryset(self):
        return super(ProjectManager, self).get_queryset().filter(deleted=False)


def path_and_rename(instance, filename):
    upload_to = 'project-images'
    ext = filename.split('.')[-1]
    # get filename
    if instance.pk:
        filename = '{}{}.{}'.format(uuid4().hex, instance.pk, ext)
    else:
        # set filename as random string
        filename = '{}.{}'.format(uuid4().hex, ext)
    # return the whole path to the file
    return os.path.join(upload_to, filename)


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
    published = models.BooleanField(default=False)
    approved = models.BooleanField(default=False)
    role = models.CharField(max_length=100, blank=True, null=True)

    objects = ProjectManager()

    def __str__(self):
        return self.title

    def __unicode__(self):
        return self.title

    class Meta:
        ordering = ['-date_created']

    def save(self, *args, **kwargs):
        self.slug = slugify(self.title)
        super(Project, self).save(*args, **kwargs)

    @property
    def skills_str(self):
        return self.skills.get_tag_string()

    def documents(self):
        documents = Document.objects.filter(project=self)
        return documents

    def nda_list(self):
        ndas = NDA.objects.filter(proposal__project=self)
        nda_list = [nda.receiver.id for nda in ndas]
        nda_list.append(self.project_manager.id)
        return nda_list



