from datetime import datetime

from haystack import indexes

from accounts.models import Skills
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

    class Meta:
        model = Project
        fields = ("title", "slug", "skills", "description", "category", "role", "city",
                  "state", "country", "remote", "first_name", "photo", "date_created",
                  "estimated_cash", "estimated_equity_percentage", "mix", "short_blurb" )

    def prepare(self, obj):
        self.prepared_data = super(ProjectIndex, self).prepare(obj)
        self.prepared_data['skills'] = [skill.name for skill in obj.skills.all()]
        self.prepared_data['city'] = obj.city if obj.city else obj.project_manager.city
        self.prepared_data['state'] = obj.state if obj.state else obj.project_manager.state
        self.prepared_data['country'] = obj.country if obj.country else obj.project_manager.country
        return self.prepared_data

    def index_queryset(self, using=None):
       return Project.objects.filter(
           deleted=False,
           approved=True,
           published=True,
           #end_date__gt=datetime.now()
       ).order_by('-date_created')
