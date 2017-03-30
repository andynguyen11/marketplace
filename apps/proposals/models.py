from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.db import models

from proposals.enums import PROPOSAL_STATUS


#TODO Support jobs when transitioning project to jobs model
class Proposal(models.Model):
    create_date = models.DateTimeField(auto_now_add=True)
    submitter = models.ForeignKey('accounts.Profile')
    project = models.ForeignKey('business.Project')
    cover_letter = models.TextField()
    equity = models.DecimalField(blank=True, null=True, max_digits=5, decimal_places=2)
    cash = models.IntegerField(blank=True, null=True)
    hourly_rate = models.IntegerField(blank=True, null=True)
    hours = models.IntegerField(blank=True, null=True)
    status = models.CharField(max_length=100, default='pending', choices=PROPOSAL_STATUS)
    message = models.ForeignKey('postman.Message', blank=True, null=True)

    @property
    def answers(self):
        answers = Answer.objects.filter(answerer=self.submitter, question__project=self.project)
        return answers

    @property
    def recipient(self):
        return self.project.project_manager

    class Meta:
        unique_together = ('submitter', 'project')
        ordering = ('-create_date', )


class Question(models.Model):
    create_date = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)
    ordering = models.IntegerField()
    project = models.ForeignKey('business.Project')
    text = models.TextField()

    def __unicode__(self):
        return self.text


class Answer(models.Model):
    create_date = models.DateTimeField(auto_now_add=True)
    question = models.ForeignKey(Question)
    text = models.TextField()
    answerer = models.ForeignKey('accounts.Profile')

    class Meta:
        unique_together = ('question', 'answerer')