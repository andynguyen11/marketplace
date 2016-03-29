from django.db import models

from apps.business.models import Company, Job
from apps.accounts.models import Profile


class Review(models.Model):
    rating = models.IntegerField()
    notes = models.TextField(blank=True, null=True)
    job = models.ForeignKey(Job)

    class Meta:
        abstract = True


class DeveloperReview(Review):
    developer = models.ForeignKey(Profile)


class CompanyReview(Review):
    company = models.ForeignKey(Company)