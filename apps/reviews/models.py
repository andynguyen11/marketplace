from django.db import models

from business.models import Company, Job
from accounts.models import Profile


class Review(models.Model):
    availability = models.DecimalField()
    timeliness = models.DecimalField()
    quality = models.DecimalField()
    skills = models.DecimalField()
    deadlines = models.DecimalField()
    communication = models.DecimalField()
    notes = models.TextField(blank=True, null=True)
    job = models.ForeignKey(Job)

    class Meta:
        abstract = True


class DeveloperReview(Review):
    developer = models.ForeignKey(Profile)


class CompanyReview(Review):
    company = models.ForeignKey(Company)