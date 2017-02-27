from django.db import models


class Proposal(models.Model):
    create_date = models.DateTimeField(auto_now_add=True)
    submitter = models.ForeignKey('accounts.Profile')
    project = models.ForeignKey('business.Project')
    cover_letter = models.TextField()
    equity = models.DecimalField(blank=True, null=True, max_digits=5, decimal_places=2)
    cash = models.IntegerField(blank=True, null=True)
    hourly_rate = models.IntegerField(blank=True, null=True)
    hours = models.IntegerField(blank=True, null=True)
    status = models.CharField(default='pending', max_length=100)

    @property
    def answers(self):
        questions = Question.objects.filter(project=self, active=True)
        answers = []
        for question in questions:
            answer = Answer.objects.get(question=question, answerer=self.submitter)
            answers.append(answer)
        return answers


class Question(models.Model):
    create_date = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)
    project = models.ForeignKey('business.Project')
    text = models.TextField()


class Answer(models.Model):
    create_date = models.DateTimeField(auto_now_add=True)
    question = models.ForeignKey(Question)
    text = models.TextField()
    answerer = models.ForeignKey('accounts.Profile')

    class Meta:
        unique_together = ('question', 'answerer')