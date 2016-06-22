from django.db import models


class Review(models.Model):
    create_date = models.DateTimeField(auto_now=True)
    availability = models.DecimalField(max_digits=2, decimal_places=1)
    timeliness = models.DecimalField(max_digits=2, decimal_places=1)
    quality = models.DecimalField(max_digits=2, decimal_places=1)
    skills = models.DecimalField(max_digits=2, decimal_places=1)
    deadlines = models.DecimalField(max_digits=2, decimal_places=1)
    communication = models.DecimalField(max_digits=2, decimal_places=1)
    notes = models.TextField(blank=True, null=True)
    job = models.ForeignKey('business.Job')

    class Meta:
        abstract = True


class DeveloperReview(Review):
    developer = models.ForeignKey('accounts.Profile')


class CompanyReview(Review):
    company = models.ForeignKey('business.Company')