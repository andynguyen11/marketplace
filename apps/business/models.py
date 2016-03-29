import tagulous.models

from datetime import datetime, timedelta

from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

from apps.accounts.models import Profile


class Company(models.Model):
    primary_contact = models.ForeignKey(Profile)
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


class Project(models.Model):
    company = models.ForeignKey(Company)
    project_manager = models.ForeignKey(Profile)
    title = models.CharField(max_length=255)
    image = models.ImageField(blank=True, upload_to='project')
    description = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    category = tagulous.models.SingleTagField()
    estimated_equity = models.DecimalField(blank=True, null=True, max_digits=5, decimal_places=2)
    estimated_cash = models.DecimalField(blank=True, null=True, max_digits=9, decimal_places=2)
    estimated_hours = models.IntegerField()
    skills = tagulous.models.TagField()
    status = models.CharField(max_length=100, blank=True, null=True)
    remote = models.BooleanField(default=False)
    featured = models.BooleanField(default=True)
    featured_tagline = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['-date_created']


class Job(models.Model):
    project = models.ForeignKey(Project)
    developer = models.ForeignKey(Profile)
    date_created = models.DateTimeField(auto_now_add=True)
    date_completed = models.DateTimeField(blank=True, null=True)
    equity = models.DecimalField(blank=True, null=True, max_digits=5, decimal_places=2)
    cash = models.DecimalField(blank=True, null=True, max_digits=9, decimal_places=2)
    hours = models.IntegerField(blank=True, null=True)
    status = models.CharField(max_length=100, blank=True, null=True)