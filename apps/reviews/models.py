from django.db import models

from business.models import Company, Job
from accounts.models import Profile


class Review(models.Model):
    availability = models.DecimalField(max_digits=2, decimal_places=1, blank=True, null=True)
    timeliness = models.DecimalField(max_digits=2, decimal_places=1, blank=True, null=True)
    quality = models.DecimalField(max_digits=2, decimal_places=1, blank=True, null=True)
    skills = models.DecimalField(max_digits=2, decimal_places=1, blank=True, null=True)
    deadlines = models.DecimalField(max_digits=2, decimal_places=1, blank=True, null=True)
    communication = models.DecimalField(max_digits=2, decimal_places=1, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    job = models.ForeignKey(Job)

    class Meta:
        abstract = True


class DeveloperReview(Review):
    developer = models.ForeignKey(Profile)


class CompanyReview(Review):
    company = models.ForeignKey(Company)