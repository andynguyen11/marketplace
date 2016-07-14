from django.db import models
import tagulous.models
from expertratings.api import expertratings_api


ERRORS_FOUND = (('yes', 'YES'), ('no', 'NO'))
class SkillTestUserFeedback(models.Model):
    test_result = models.ForeignKey('expertratings.SkillTestResult')

    content_rating = models.IntegerField()
    content_comments = models.CharField(max_length=500)

    procedure_rating = models.IntegerField()
    procedure_comments = models.CharField(max_length=500)

    errors_found = models.CharField(max_length=10, choices=ERRORS_FOUND)
    errors_details = models.CharField(max_length=500)

    time = models.DateTimeField()


TEST_RESULTS = (('PASS','PASS'), ('FAIL','FAIL'))
class SkillTestResult(models.Model):
    transcript_id = models.CharField(max_length=100, primary_key=True)

    test = models.ForeignKey('expertratings.SkillTest')
    user = models.ForeignKey('accounts.Profile')

    percentage = models.FloatField()
    percentile = models.IntegerField()
    average_score = models.FloatField()
    test_result = models.CharField(max_length=10, choices=TEST_RESULTS)
    time = models.DateTimeField()

    @property
    def feedback(self):
        try: 
            return SkillTestUserFeedback.objects.get(test_result=self)
        except SkillTestUserFeedback.DoesNotExist:
            return None


class SkillTest(models.Model):

    test_id   = models.CharField(max_length=100, primary_key=True)
    test_name = models.CharField(max_length=100)
    category  = models.CharField(max_length=100)
    coverage  = tagulous.models.TagField()

    duration = models.IntegerField()
    total_questions = models.IntegerField()
    passing_marks = models.IntegerField()

    def create_ticket(self, user_id):
        return expertratings_api.create_ticket(self.test_id, user_id=user_id)

    def results(self, user):
        return SkillTestResult.objects.filter(test=self, user=user)

    @property
    def all_feedback(self):
        return [r.feedback for r in SkillTestResult.objects.filter(test=self)]

    def __str__(self):
        return '<SkillTest name="%s" id=%s>' % (self.test_name, self.test_id)
