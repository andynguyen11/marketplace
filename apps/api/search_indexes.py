from datetime import datetime

from django.db.models import Count
from django.template.defaultfilters import truncatechars
from haystack import indexes

from accounts.models import Profile, Skills
from business.models import Project
from generics.utils import field_names


class SkillsIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)
    name = indexes.CharField(model_attr='name')
    skill_auto = indexes.EdgeNgramField(model_attr='name')

    def get_model(self):
        return Skills

    def index_queryset(self, using=None):
        """Used when the entire index for model is updated."""
        return Skills.objects.filter(protected=True)


class ProjectIndex(indexes.ModelSearchIndex, indexes.Indexable):
    skills = indexes.MultiValueField()
    first_name = indexes.CharField(model_attr='project_manager__first_name')
    photo = indexes.CharField(model_attr='project_manager__get_photo')
    city = indexes.CharField()
    state = indexes.CharField()
    country = indexes.CharField()
    scope = indexes.CharField()

    class Meta:
        model = Project
        fields = ("title", "slug", "skills", "description", "category", "role", "city",
                  "state", "country", "remote", "first_name", "photo", "date_created",
                  "estimated_cash", "estimated_equity_percentage", "mix", "short_blurb", "scope", "featured" )

    def prepare(self, obj):
        self.prepared_data = super(ProjectIndex, self).prepare(obj)
        self.prepared_data['skills'] = [skill.name for skill in obj.skills.all()]
        self.prepared_data['city'] = obj.city if obj.city else obj.project_manager.city
        self.prepared_data['state'] = obj.state if obj.state else obj.project_manager.state
        self.prepared_data['country'] = obj.country if obj.country else obj.project_manager.country
        self.prepared_data['scope'] = truncatechars(obj.scope, 158)
        return self.prepared_data

    def index_queryset(self, using=None):
       return Project.objects.filter(
           deleted=False,
           approved=True,
           published=True,
           #end_date__gt=datetime.now()
       ).order_by('-date_created')


class UserIndex(indexes.ModelSearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)
    skills = indexes.MultiValueField(boost=2)
    roles = indexes.MultiValueField(boost=2)
    photo = indexes.CharField()
    job_descriptions = indexes.MultiValueField()
    job_titles = indexes.MultiValueField()
    profile_id = indexes.IntegerField()
    examples = indexes.IntegerField()
    grade = indexes.DecimalField()

    def prepare(self, obj):
        self.prepared_data = super(UserIndex, self).prepare(obj)
        jobs = obj.employee_set.all()
        self.prepared_data['job_descriptions'] = [job.description for job in jobs]
        self.prepared_data['job_titles'] = [job.title for job in jobs]
        self.prepared_data['skills'] = [skill.name for skill in obj.skills.all()]
        self.prepared_data['roles'] = [role.display_name for role in obj.roles.all()]
        self.prepared_data['photo'] = obj.get_photo
        self.prepared_data['profile_id'] = obj.pk
        self.prepared_data['grade'] = obj.score
        self.prepared_data['examples'] = len(obj.work_examples.all())
        return self.prepared_data

    def index_queryset(self, using=None):
        return Profile.objects.filter(tos=True, is_active=True, email_confirmed=True, score__gte=70).exclude(roles=None).exclude(long_description=None).exclude(skills=None)

    class Meta:
        model = Profile
        fields = ("profile_id", "first_name", "last_name", "email", "location", "photo",
                  "roles", "skills", "email_notifications", "city", "state", "country", "grade",
                  "long_description", "job_descriptions", "job_titles", "featured", "text", "examples", )